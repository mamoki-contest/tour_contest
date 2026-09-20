import { useCallback, useState } from "react";
import {
  useNavigate,
  useRevalidator,
  useSearchParams,
  type ShouldRevalidateFunctionArgs,
} from "react-router";

import type { Route } from "./+types/home";
import { BottomNav } from "../components/bottom-nav";
import { BottomSheet } from "../components/bottom-sheet";
import { ConditionBar } from "../components/condition-bar";
import { SaveButton } from "../components/save-controls";
import { useCollection } from "../lib/use-collection";
import { DateSheet } from "../components/date-sheet";
import { RegionSheet } from "../components/region-sheet";
import { SearchSheet } from "../components/search-sheet";
import { MapView, type MapLoadState } from "../components/map-view";
import { MapLegend, MapZone, type MapStatus } from "../components/map-zone";
import { PlaceCard, PlaceCardSkeleton } from "../components/place-card";
import { InterestSourceNote, SortToggle } from "../components/sort-toggle";
import { EmptyState, ErrorState, SecondaryButton } from "../components/states";
import {
  exploreHref,
  hasDroppedDate,
  parseExploreState,
  withMapBounds,
  withRegionCode,
  type ExploreState,
  type MapBounds,
  type MapViewport,
  type OpenSheet,
  type SheetSnap,
} from "../lib/explore-params";
import { fetchPlaceList } from "../lib/places.server";
import { fetchRegionVisitScale } from "../lib/regions.server";
import { formatObservedAt, formatVisitPeriodShort } from "../lib/format";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "한사나다 — 강원 관광 탐색" },
    {
      name: "description",
      content: "강원특별자치도 18개 시·군의 관광지를 살펴보는 탐색 홈.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  // 조회 조건은 로더가 읽는다. 화면 상태(시트 스냅)는 컴포넌트가 URL에서 직접 읽는다.
  const params = new URL(request.url).searchParams;
  const state = parseExploreState(params);

  // 두 조회는 서로를 기다릴 이유가 없다 — 지역 방문 규모가 늦다고 목록이 늦지 않게 한다.
  const [listResult, regions] = await Promise.all([
    fetchPlaceList(request.signal, state),
    fetchRegionVisitScale(request.signal),
  ]);

  if (!regions.ok) {
    console.error(`[regions] ${regions.failure.dataName} 조회 실패: ${regions.failure.cause}`);
  }
  const regionData = regions.ok ? regions.data : null;

  /*
   * 강원에 없는 시·군 코드는 백엔드가 400으로 거절해 목록을 통째로 잃게 만든다.
   * 코드의 권위 있는 목록은 방금 함께 받은 지역 방문 규모가 쥐고 있으므로, 거기에
   * 없는 코드였다면 **그 조건만 버리고** 다시 부른다. 정상 경로는 이 자리에 오지
   * 않으니 조회가 늘지 않는다.
   */
  const unknownRegion =
    state.regionCode !== null &&
    regionData !== null &&
    !regionData.regions.some((region) => region.sigunguCode === state.regionCode);

  let result = listResult;
  let droppedRegion = false;
  if (!result.ok && unknownRegion) {
    console.error(`[places] 알 수 없는 시·군 코드 ${state.regionCode}, 강원 전체로 다시 조회합니다.`);
    result = await fetchPlaceList(request.signal, { ...state, regionCode: null });
    droppedRegion = result.ok;
  }

  // 버린 조건은 화면이 말한다. 조용히 무시하면 사용자는 다른 조건의 결과를 읽게 된다.
  const dropped = { date: hasDroppedDate(params), region: droppedRegion };

  /*
   * 목록에 **실제로 적용된** 시·군. 지도가 시·군을 따라 움직일 때 URL의 값이 아니라
   * 이 값을 봐야 한다 — 조회가 끝나기 전의 URL을 보면 아직 이전 시·군의 마커로
   * 지도를 맞추게 되고, 그 뒤 새 마커가 와도 이미 맞췄다고 여겨 멈춘다.
   */
  const appliedRegion = droppedRegion ? null : state.regionCode;

  // 지도 SDK는 브라우저가 직접 불러야 하므로 이 키는 클라이언트로 내려간다.
  // 관광 API 키와 달리 숨길 수 있는 값이 아니고, 도메인 등록이 보호 장치다.
  const kakaoAppKey = process.env.KAKAO_MAP_APP_KEY ?? "";

  if (!result.ok) {
    // 원인은 서버 로그에만 남긴다 — 클라이언트로 내려보내지 않는다.
    console.error(`[places] ${result.failure.dataName} 조회 실패: ${result.failure.cause}`);
    return {
      data: null,
      regions: regionData,
      dropped,
      appliedRegion,
      kakaoAppKey,
      error: { dataName: result.failure.dataName },
    };
  }

  return {
    data: result.data,
    regions: regionData,
    dropped,
    appliedRegion,
    kakaoAppKey,
    error: null,
  };
}

/**
 * 화면 상태만 바뀐 이동은 목록을 다시 부르지 않는다.
 *
 * 시트 스냅(`snap`)과 지도 위치(`c`·`z`)가 그것이다. 특히 지도 위치는 **사용자가 지도를
 * 미는 동안 계속 바뀐다** — 여기서 걸러 내지 않으면 손가락을 뗄 때마다 목록 전체를
 * 다시 부른다. 조회 범위는 `이 지도 영역에서 검색` 을 눌러야 확정되는 `bbox` 쪽이다.
 */
const VIEW_ONLY_PARAMS = ["snap", "c", "z"];

export function shouldRevalidate({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  const current = new URLSearchParams(currentUrl.search);
  const next = new URLSearchParams(nextUrl.search);
  for (const key of VIEW_ONLY_PARAMS) {
    current.delete(key);
    next.delete(key);
  }
  if (currentUrl.pathname === nextUrl.pathname && current.toString() === next.toString()) {
    return false;
  }
  return defaultShouldRevalidate;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { data, regions, dropped, appliedRegion, kakaoAppKey, error } = loaderData;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const loading = revalidator.state !== "idle";

  // 로더 데이터가 아니라 살아 있는 URL에서 읽는다 — 스냅 변화는 로더를 다시 돌리지 않는다.
  const state = parseExploreState(searchParams);
  const collection = useCollection();

  // 코드만으로는 시·군 이름을 알 수 없다 — 이름은 방문 규모 목록에서 온다.
  const regionLabel =
    regions?.regions.find((region) => region.sigunguCode === state.regionCode)?.name ?? null;

  // 키가 없으면 시도할 것도 없다. 있으면 SDK가 뜰 때까지 로딩으로 둔다.
  const [mapLoad, setMapLoad] = useState<MapLoadState>(kakaoAppKey ? "LOADING" : "FAILED");

  const searchThisArea = useCallback(
    (bounds: MapBounds) => {
      // 지도를 움직인 것만으로는 목록이 바뀌지 않는다 — 사용자가 눌러야 범위가 확정된다.
      // 시·군 조건은 함께 풀린다: 두 범위가 AND 로 걸리면 조건 칩이 말하는 범위와
      // 실제 조회 범위가 달라진다.
      navigate(exploreHref(withMapBounds(state, bounds)), { preventScrollReset: true });
    },
    [navigate, state],
  );

  /**
   * 지도를 민 자리를 주소에 적어 둔다 (U6).
   *
   * 조회 조건이 아니므로 히스토리를 쌓지 않고 `replace` 로 덮어쓴다 — 뒤로가기가
   * 지도 이동을 한 걸음씩 되감는 대신 상세 이전의 탐색 화면으로 돌아가게 둔다.
   */
  const rememberViewport = useCallback(
    (viewport: MapViewport) => {
      navigate(exploreHref({ ...state, viewport }), {
        replace: true,
        preventScrollReset: true,
      });
    },
    [navigate, state],
  );

  /** 시트 열기는 히스토리를 쌓는다 — 뒤로가기가 시트를 한 겹 닫는 비상구가 된다 (U9). */
  const openSheet = useCallback(
    (sheet: OpenSheet) => navigate(exploreHref({ ...state, sheet }), { preventScrollReset: true }),
    [navigate, state],
  );

  const closeSheet = useCallback(
    () => navigate(-1),
    [navigate],
  );

  /** 시트가 확정한 조건은 열림 상태를 지우고 적용한다 — 시트가 닫히면서 결과가 보인다. */
  const applyFromSheet = useCallback(
    (next: Partial<ExploreState>) => {
      navigate(exploreHref({ ...state, ...next, sheet: null }), {
        replace: true,
        preventScrollReset: true,
      });
    },
    [navigate, state],
  );

  const setSnap = useCallback(
    (snap: SheetSnap) => {
      // 스냅 변화는 히스토리를 쌓지 않는다 — 뒤로가기가 시트 높이만 되돌리면 비상구가 막힌다.
      navigate(exploreHref({ ...state, snap }), { replace: true, preventScrollReset: true });
    },
    [navigate, state],
  );

  /**
   * 지도가 떠도 방문 규모 색상 레이어는 아직 없다 — 행정구역 경계와 방문 규모 데이터가
   * 둘 다 있어야 그릴 수 있다. 없는 색을 지어내지 않고 범례가 그 사실을 말한다.
   */
  const mapStatus: MapStatus =
    mapLoad === "FAILED"
      ? "MAP_FAILED"
      : regions === null
        ? "REGION_FILL_FAILED"
        : "REGION_FILL_UNSUPPORTED";
  // 지도를 못 띄우면 목록만으로 탐색할 수 있게 시트를 접히지 않게 한다 (U8).
  const effectiveSnap = mapStatus === "MAP_FAILED" && state.snap === "peek" ? "middle" : state.snap;

  /**
   * 범례는 두 자리에 산다 — 모바일은 시트 위(U1), 데스크톱은 지도 좌하단.
   *
   * 지도가 실패해도 그린다. 방문 규모 값과 기준 기간은 지도와 함께 죽지 않으며,
   * 색을 못 칠하는 동안에는 이 카드가 시·군 방문 규모로 가는 입구가 된다.
   * 관심도 캡션(시트 헤더)과는 끝까지 다른 블록에 둔다 (U15).
   */
  const legend = (
    <MapLegend
      status={mapStatus}
      periodLabel={formatVisitPeriodShort(
        regions?.periodStart ?? null,
        regions?.periodEnd ?? null,
      )}
      onOpenRegions={() => openSheet("region")}
    />
  );

  return (
    <div className="relative h-dvh overflow-hidden lg:grid lg:h-dvh lg:grid-cols-[1fr_480px] lg:gap-0 lg:overflow-hidden">
      <MapZone status={mapStatus} onRetry={() => revalidator.revalidate()} legend={legend}>
        {kakaoAppKey ? (
          <MapView
            appKey={kakaoAppKey}
            places={data?.places ?? []}
            regionCode={appliedRegion}
            initialViewport={state.viewport}
            initialBounds={state.bounds}
            onLoadStateChange={setMapLoad}
            onSearchThisArea={searchThisArea}
            onViewportChange={rememberViewport}
          />
        ) : null}
        <TopBar state={state} regionLabel={regionLabel} onOpenSheet={openSheet} />
      </MapZone>

      <BottomSheet
        snap={effectiveSnap}
        onSnapChange={setSnap}
        legend={legend}
        header={<SheetHeader state={state} data={data} dropped={dropped} />}
      >
        {loading ? (
          <PlaceList>
            <PlaceCardSkeleton />
            <PlaceCardSkeleton />
            <PlaceCardSkeleton />
          </PlaceList>
        ) : error ? (
          <ErrorState
            dataName={error.dataName}
            action={<SecondaryButton onClick={() => revalidator.revalidate()}>다시 시도</SecondaryButton>}
          />
        ) : !data || data.places.length === 0 ? (
          <EmptyState
            message="이 범위에 관광지가 없어요."
            action={<SecondaryButton onClick={() => revalidator.revalidate()}>다시 불러오기</SecondaryButton>}
          />
        ) : (
          <PlaceList>
            {data.places.map((place) => (
              <PlaceCard
                key={place.placeId}
                place={place}
                dateMode={state.dateMode}
                saveButton={
                  <SaveButton
                    saved={collection.isSaved(place.placeId)}
                    placeName={place.name}
                    onToggle={() =>
                      collection.isSaved(place.placeId)
                        ? collection.remove(place.placeId)
                        : collection.save({
                            placeId: place.placeId,
                            name: place.name,
                            address: place.address,
                            photoUrl: place.photoUrl,
                            coordinates: place.coordinates,
                          })
                    }
                  />
                }
              />
            ))}
          </PlaceList>
        )}
      </BottomSheet>

      <BottomNav savedCount={collection.snapshot.places.length} />

      {state.sheet === "region" ? (
        <RegionSheet
          selected={state.regionCode}
          data={regions}
          onClose={closeSheet}
          // 시·군을 고르면 지도 경계 조건은 지운다 — 두 범위가 겹치면 어느 쪽인지 알 수 없다.
          onSelect={(regionCode) => applyFromSheet(withRegionCode(state, regionCode))}
        />
      ) : null}

      {state.sheet === "search" ? (
        <SearchSheet
          state={state}
          onClose={closeSheet}
          onApplyTheme={(theme) => applyFromSheet({ theme, query: null })}
          onApplyQuery={(query) => applyFromSheet({ query, theme: null })}
        />
      ) : null}

      {state.sheet === "date" ? (
        <DateSheet
          state={state}
          onClose={closeSheet}
          onApply={(dateMode, date) => applyFromSheet({ dateMode, date })}
        />
      ) : null}
    </div>
  );
}

/**
 * 상단 컴팩트 바 (U12 → D5) — 지도 위에 뜨는 것은 조건 요약 칩 열뿐이다.
 * 테마 칩 8개 전체는 검색 시트 안으로 접었다. 그래야 지도가 살아남는다.
 */
function TopBar({
  state,
  regionLabel,
  onOpenSheet,
}: {
  state: ExploreState;
  regionLabel: string | null;
  onOpenSheet: (sheet: OpenSheet) => void;
}) {
  return (
    // 데스크톱에서는 지도 위에 떠 있지 않고 맨 위에 흐르되, 위치는 유지한다 —
    // static 이면 뒤에 깔린 지도(absolute)가 칩 줄을 덮는다.
    <div className="absolute inset-x-0 top-0 z-10 px-gutter pt-[calc(env(safe-area-inset-top)+16px)] lg:relative lg:px-6 lg:pt-6">
      <ConditionBar
        state={state}
        regionLabel={regionLabel}
        onOpenRegion={() => onOpenSheet("region")}
        onOpenSearch={() => onOpenSheet("search")}
        onOpenDate={() => onOpenSheet("date")}
      />
    </div>
  );
}

function SheetHeader({
  state,
  data,
  dropped,
}: {
  state: ExploreState;
  data: Route.ComponentProps["loaderData"]["data"];
  dropped: Route.ComponentProps["loaderData"]["dropped"];
}) {
  // 조회 범위의 전체 개수와 지금 화면에 온 개수는 다르다. 첫 쪽만 받아 놓고
  // 전체 개수를 `이만큼 보여준다`로 읽히게 두지 않는다.
  const shown = data?.places.length ?? 0;
  const total = data?.totalCount ?? null;

  return (
    <div className="pt-2 lg:px-6 lg:pt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="type-headline-md text-grey-800">
          {data ? `이 지도 범위 ${total ?? shown}곳` : "이 지도 범위"}
        </h2>
        <SortToggle state={state} />
      </div>

      {total !== null && total > shown ? (
        <p className="type-caption mt-2 text-grey-600">그중 {shown}곳을 먼저 보여드려요</p>
      ) : null}

      {/* 관심도 캡션은 시트 헤더에 산다. 지도 범례와 같은 시각 블록에 두지 않는다 (U15). */}
      <InterestSourceNote
        source={data?.source ?? null}
        observedAt={formatObservedAt(data?.observedAt ?? null)}
        // 검색 결과는 애초에 정렬을 요청하지 않는다 — 그 자리에 실패 문구를 띄우지 않는다.
        sortApplied={data === null || data.search !== null || data.sortApplied}
      />

      {/*
        지원 테마 결과와 일반 검색 결과는 신뢰 수준이 다르다 (ADR-0003).
        같은 목록 모양으로 오기 때문에, 어느 쪽인지 문장으로 반드시 밝힌다.
      */}
      {data?.search ? <SearchNotice search={data.search} /> : null}

      <DroppedConditionNotice dropped={dropped} />
    </div>
  );
}

/**
 * 쓸 수 없어 버린 조건을 한 줄로 알린다.
 *
 * 어긋난 조건 하나 때문에 목록 전체를 잃는 대신 그 조건만 버렸다. 대신 무엇이
 * 빠졌는지는 반드시 말한다 — 말하지 않으면 사용자는 자기가 건 조건의 결과를
 * 보고 있다고 믿는다.
 */
function DroppedConditionNotice({
  dropped,
}: {
  dropped: Route.ComponentProps["loaderData"]["dropped"];
}) {
  if (!dropped.date && !dropped.region) return null;

  return (
    <p className="type-body-md mt-2 rounded-lg bg-grey-100 p-3 text-grey-700">
      {dropped.date
        ? "고른 날짜가 예측이 닿는 30일 밖이라 날짜 조건을 풀었어요."
        : "그 시·군을 찾을 수 없어 강원 전체로 보여드려요."}
    </p>
  );
}

function SearchNotice({ search }: { search: NonNullable<Route.ComponentProps["loaderData"]["data"]>["search"] }) {
  if (!search) return null;

  return (
    <div className="type-body-md mt-2 rounded-lg bg-grey-100 p-3 text-grey-700">
      {search.resultType === "SUPPORTED_THEME" ? (
        <p>
          {search.appliedTheme ? `${search.appliedTheme} ` : ""}테마에 맞는 곳만 골라 보여드려요.
        </p>
      ) : (
        <p>검색어와 관련된 결과예요. 테마에 맞는지는 확인하지 못했어요.</p>
      )}

      {search.suggestedThemes.length > 0 ? (
        <p className="type-caption mt-2 text-grey-600">
          이런 테마는 어떠세요 — {search.suggestedThemes.join(" · ")}
        </p>
      ) : null}
    </div>
  );
}

/** 카드 사이 24px — 리듬의 세 값(48 · 24 · 8) 밖으로 나가지 않는다. */
function PlaceList({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6">{children}</div>;
}
