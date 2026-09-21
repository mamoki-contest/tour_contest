import { useCallback, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useNavigation,
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
import { HelpButton, HelpSheet } from "../components/help-sheet";
import { RegionSheet } from "../components/region-sheet";
import {
  GeneralSearchNotice,
  SearchSheet,
  SuggestedThemes,
  ThemeNormalizedNotice,
} from "../components/search-sheet";
import { MapView, type MapLoadState } from "../components/map-view";
import { MapLegend, MapZone, type MapStatus } from "../components/map-zone";
import { PlaceCard, PlaceCardSkeleton } from "../components/place-card";
import { SortToggle } from "../components/sort-toggle";
import { DataNote, EmptyState, ErrorState, SecondaryButton, StaleNote } from "../components/states";
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
import { exploreDetailHref } from "../lib/back-link";
import { formatBaselineCaption, formatStaleCaption, isStale } from "../lib/data-status";
import { useHelpSeen } from "../lib/use-help-seen";
import { isListQueryNavigation, isMapMoveNavigation, isPageNavigation } from "../lib/list-loading";
import { listHeading } from "../lib/list-heading";
import { normalizedTheme, searchNotice } from "../lib/search-notice";
import { unrankedBoundary } from "../lib/unranked";
import { fetchPlaceList } from "../lib/places.server";
import { fetchRegionVisitScale } from "../lib/regions.server";
import { formatVisitPeriodShort } from "../lib/format";

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
 * 다시 부른다. 조회 범위는 조작이 잦아든 뒤에 한 번 적히는 `bbox` 쪽이다 (#48).
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

  /*
   * 로딩 표시는 두 갈래에서 온다 (#20).
   *
   * `다시 시도`는 재검증(`useRevalidator`)이지만, 사용자가 겪는 조건 변경은 전부
   * `<Link>`·`navigate()` 라 내비게이션을 탄다. 재검증만 보던 동안에는 정렬을 뒤집어도
   * 시·군을 골라도 스켈레톤이 한 번도 켜지지 않았다. 그렇다고 모든 이동에 켜면
   * 시트를 열고 닫는 것만으로 읽던 목록이 사라지므로, 조회 조건이 바뀐 이동만 센다.
   */
  const navigation = useNavigation();
  const location = useLocation();
  /*
   * 지도를 민 것만은 예외다 (#48). 조회 조건이 분명히 바뀌었는데도 스켈레톤을 켜지
   * 않는다 — 지도를 훑는 동안 목록이 회색 카드로 바뀌었다 돌아오기를 되풀이하면,
   * 방금 본 곳이 어디였는지 잃는다. 이전 목록을 그대로 두고 헤더의 `N곳` 이
   * 갱신되는 것으로 바뀌었음을 말한다.
   */
  const listLoading =
    revalidator.state !== "idle" ||
    (isListQueryNavigation(location, navigation.location) &&
      !isMapMoveNavigation(location, navigation.location));
  // `더 보기`는 읽던 목록을 덮지 않는다 — 버튼 자신이 진행 중임을 말한다.
  const loadingMore = isPageNavigation(location, navigation.location);

  // 로더 데이터가 아니라 살아 있는 URL에서 읽는다 — 스냅 변화는 로더를 다시 돌리지 않는다.
  const state = parseExploreState(searchParams);
  const collection = useCollection();

  // 코드만으로는 시·군 이름을 알 수 없다 — 이름은 방문 규모 목록에서 온다.
  const regionLabel =
    regions?.regions.find((region) => region.sigunguCode === state.regionCode)?.name ?? null;

  /*
   * 검색 결과의 성격 (#26 · U18).
   *
   * 조건 칩 · 목록 위 안내 · 시트 헤더가 **같은 판정**을 쓴다. 세 곳이 각자 판단하면
   * 언젠가 서로 다른 말을 하고, 사용자는 어느 쪽이 지금 걸린 조건인지 알 수 없게 된다.
   */
  const search = data?.search ?? null;
  const noticeInput = { theme: state.theme, query: state.query, search };
  const appliedTheme = normalizedTheme(noticeInput);
  const notice = searchNotice(noticeInput);

  // 키가 없으면 시도할 것도 없다. 있으면 SDK가 뜰 때까지 로딩으로 둔다.
  const [mapLoad, setMapLoad] = useState<MapLoadState>(kakaoAppKey ? "LOADING" : "FAILED");

  /*
   * 도움말을 이미 봤는지 (#35, WIREFRAME R1).
   *
   * 기록은 ⓘ 를 누른 순간이 아니라 **도움말이 열린 상태**에서 일어난다 (#41) —
   * 다른 화면의 ⓘ 링크로 열어도, 주소를 직접 쳐서 들어와도 같은 사실이다.
   */
  const helpSeen = useHelpSeen(state.sheet === "help");

  /**
   * 지도가 멎으면 보이는 범위로 목록을 다시 부른다 (#48).
   *
   * 누를 것이 없어졌으므로 이 이동은 **사용자가 의도한 조회**이면서도 히스토리를 쌓지
   * 않는다(`replace`). 지도를 훑는 동안 쌓인 범위를 뒤로가기가 한 걸음씩 되감으면,
   * 상세 이전의 탐색 화면으로 돌아가는 길이 수십 걸음 뒤로 밀린다.
   *
   * 시·군 조건은 함께 풀린다(`withMapBounds`): 두 범위가 AND 로 걸리면 조건 칩이
   * 말하는 범위와 실제 조회 범위가 달라지고, 칩은 시·군 이름만 말해 사용자가 그
   * 사실을 알 수 없다. 쪽 수도 첫 쪽으로 돌아간다 — 늘려 둔 쪽은 다른 목록의 쪽이다.
   */
  const autoRefresh = useCallback(
    (bounds: MapBounds) => {
      navigate(exploreHref(withMapBounds(state, bounds)), {
        replace: true,
        preventScrollReset: true,
      });
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

  // 여는 일만 한다 — `봤다`는 기록은 열린 상태를 보는 쪽이 맡는다 (#41).
  const openHelp = useCallback(() => openSheet("help"), [openSheet]);

  /** 시트가 확정한 조건은 열림 상태를 지우고 적용한다 — 시트가 닫히면서 결과가 보인다. */
  const applyFromSheet = useCallback(
    (next: Partial<ExploreState>) => {
      // 조건이 바뀌면 지금까지 늘려 둔 쪽은 다른 목록의 쪽이다 — 첫 쪽부터 다시 읽는다.
      navigate(exploreHref({ ...state, ...next, page: 1, sheet: null }), {
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

  /** 제안 테마로 다시 찾는 주소 — 걸려 있던 시·군·날짜는 지키고 검색어만 바꾼다. */
  const themeHref = useCallback(
    (theme: string) => exploreHref({ ...state, theme, query: null, page: 1, sheet: null }),
    [state],
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

  /*
   * 온라인 언급 미산정 구역이 시작하는 자리 (#27, U17 · D7).
   *
   * 검색 결과에는 그리지 않는다 — 검색 입구는 정렬을 받지 않아 뒤쪽에 모아 준다는
   * 보장이 없고, 보장 없는 자리에 선을 그으면 없는 구조를 지어내는 셈이 된다.
   */
  const unrankedFrom =
    data && data.search === null && data.sortApplied ? unrankedBoundary(data.places) : null;

  return (
    <div className="relative h-dvh overflow-hidden lg:grid lg:h-dvh lg:grid-cols-[1fr_480px] lg:gap-0 lg:overflow-hidden">
      <MapZone status={mapStatus} onRetry={() => revalidator.revalidate()} legend={legend}>
        {kakaoAppKey ? (
          <MapView
            appKey={kakaoAppKey}
            places={data?.places ?? []}
            regionCode={appliedRegion}
            urlViewport={state.viewport}
            initialBounds={state.bounds}
            onLoadStateChange={setMapLoad}
            onAutoRefresh={autoRefresh}
            onViewportChange={rememberViewport}
          />
        ) : null}
        <TopBar
          state={state}
          regionLabel={regionLabel}
          appliedTheme={appliedTheme}
          onOpenSheet={openSheet}
        />
      </MapZone>

      <BottomSheet
        snap={effectiveSnap}
        onSnapChange={setSnap}
        legend={legend}
        header={
          <SheetHeader
            state={state}
            data={data}
            regionLabel={regionLabel}
            appliedTheme={appliedTheme}
            dropped={dropped}
            helpSeen={helpSeen}
            onOpenHelp={openHelp}
          />
        }
      >
        {listLoading ? (
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
          <NoResults state={state} search={search} themeHref={themeHref} onRetry={() => revalidator.revalidate()} />
        ) : (
          <>
            {/*
              지원 테마 결과와 일반 검색 결과는 신뢰 수준이 다르다 (ADR-0003).
              같은 목록 모양으로 오기 때문에, 어느 쪽인지 목록 맨 앞에서 밝힌다 (U18).
            */}
            {notice.kind === "THEME_NORMALIZED" ? (
              <div className="mb-6">
                <ThemeNormalizedNotice rawQuery={notice.rawQuery} appliedTheme={notice.theme} />
              </div>
            ) : notice.kind === "GENERAL_SEARCH" ? (
              <div className="mb-6">
                <GeneralSearchNotice query={notice.query} />
              </div>
            ) : null}

            <PlaceList>
              {data.places.map((place, index) => (
                <div key={place.placeId}>
                  {index === unrankedFrom ? (
                    <UnrankedDivider count={data.places.length - index} />
                  ) : null}
                  <PlaceCard
                    place={place}
                    // 지금 걸린 탐색 조건을 상세로 들고 간다 — 거기서 돌아올 길이 된다 (#42).
                    href={exploreDetailHref(place.placeId, state)}
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
                </div>
              ))}
            </PlaceList>

            <MoreButton state={state} data={data} loading={loadingMore} />
          </>
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
          // 고를 수 있는 날은 응답이 말하는 예측 지원 창까지다 (#30 M3).
          supported={data?.forecastWindow ?? null}
          onClose={closeSheet}
          onApply={(dateMode, date) => applyFromSheet({ dateMode, date })}
        />
      ) : null}

      {state.sheet === "help" ? <HelpSheet onClose={closeSheet} /> : null}
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
  appliedTheme,
  onOpenSheet,
}: {
  state: ExploreState;
  regionLabel: string | null;
  /** 백엔드가 검색어를 지원 테마로 정규화했을 때 그 테마 이름. 아니면 null. */
  appliedTheme: string | null;
  onOpenSheet: (sheet: OpenSheet) => void;
}) {
  return (
    // 데스크톱에서는 지도 위에 떠 있지 않고 맨 위에 흐르되, 위치는 유지한다 —
    // static 이면 뒤에 깔린 지도(absolute)가 칩 줄을 덮는다.
    <div className="absolute inset-x-0 top-0 z-10 px-gutter pt-[calc(env(safe-area-inset-top)+16px)] lg:relative lg:px-6 lg:pt-6">
      <ConditionBar
        state={state}
        regionLabel={regionLabel}
        normalizedTheme={appliedTheme}
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
  regionLabel,
  appliedTheme,
  dropped,
  helpSeen,
  onOpenHelp,
}: {
  state: ExploreState;
  data: Route.ComponentProps["loaderData"]["data"];
  regionLabel: string | null;
  /** 백엔드가 검색어를 지원 테마로 정규화했을 때 그 테마 이름. 아니면 null. */
  appliedTheme: string | null;
  dropped: Route.ComponentProps["loaderData"]["dropped"];
  helpSeen: boolean;
  onOpenHelp: () => void;
}) {
  /*
   * 헤더는 지금 걸린 조회 범위를 말한다 (#25).
   *
   * 오래 `이 지도 범위 N곳` 하나로 고정돼 있어서, 춘천시를 골라도 테마로 찾아도
   * 지도가 아예 안 떠도 같은 문장이었다 — 조건 칩과 목록이 다른 범위를 말했다.
   */
  const heading = listHeading({
    hasBounds: state.bounds !== null,
    regionLabel,
    theme: state.theme ?? appliedTheme,
    query: appliedTheme ? null : state.query,
    count: data?.totalCount ?? data?.places.length ?? null,
  });

  return (
    <div className="pt-2 lg:px-6 lg:pt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="type-headline-md text-grey-800">{heading}</h2>
        <div className="flex items-center gap-2">
          <SortToggle state={state} />
          {/* 신호 설명은 화면마다 반복하지 않고 이 한 자리에 모았다 (#35). */}
          <HelpButton unseen={!helpSeen} onOpen={onOpenHelp} />
        </div>
      </div>

      {/*
        캡션은 기준 시점 한 줄뿐이다 (#35). 값이 낡았을 때만(`STALE`) 그 사실이
        시점보다 먼저 온다 — 최신인 줄 알고 움직이면 헛걸음이 되기 때문이다 (#21).
      */}
      {isStale(data?.status) ? (
        <StaleNote caption={formatStaleCaption(data?.observedAt ?? null)} />
      ) : (
        <DataNote>{formatBaselineCaption(data?.observedAt ?? null)}</DataNote>
      )}

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
        ? "고른 날짜는 예측이 닿지 않아 날짜 조건을 풀었어요."
        : "그 시·군을 찾을 수 없어 강원 전체로 보여드려요."}
    </p>
  );
}

/**
 * 온라인 언급 미산정 구역의 머리 (#27, U17 · D7).
 *
 * 이 아래 장소들은 **낮은 관심도가 아니라 값이 없는 것**이다. 순위 안에 섞어 두면
 * 꼴찌로 읽히므로 선을 그어 구역을 가른다. 왜 순위에 넣지 않았는지는 도움말이 말한다.
 */
function UnrankedDivider({ count }: { count: number }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="h-px grow bg-grey-200" aria-hidden="true" />
      <span className="type-label-md shrink-0 text-grey-700">온라인 언급 정보 없음 {count}곳</span>
      <span className="h-px grow bg-grey-200" aria-hidden="true" />
    </div>
  );
}

/**
 * 21번째 이후로 가는 길 (#30 M4).
 *
 * 쪽을 나눠 따로 보여주지 않고 읽던 목록을 늘린다. 주소에 쪽 수가 적히므로 상세에
 * 들어갔다 돌아와도 늘려 둔 자리가 그대로 있다 (U6).
 */
function MoreButton({
  state,
  data,
  loading,
}: {
  state: ExploreState;
  data: NonNullable<Route.ComponentProps["loaderData"]["data"]>;
  loading: boolean;
}) {
  if (data.reachedLimit) {
    // 끝에 닿았다는 사실을 숨기고 버튼만 지우면, 사용자는 목록이 여기까지인 줄 안다.
    return (
      <p className="type-body-md mt-6 rounded-lg bg-grey-100 p-3 text-grey-700">
        여기까지 {data.places.length}곳을 봤어요. 시·군이나 테마로 좁히면 나머지를 찾을 수 있어요.
      </p>
    );
  }

  if (!data.hasMore) return null;

  return (
    <Link
      to={exploreHref({ ...state, page: state.page + 1 })}
      replace
      preventScrollReset
      aria-disabled={loading}
      className="type-label-lg mt-6 flex h-12 w-full items-center justify-center rounded-md bg-grey-100 text-grey-700 transition-colors duration-200 hover:bg-grey-200"
    >
      {loading ? "불러오는 중" : "더 보기"}
    </Link>
  );
}

/**
 * 결과가 없을 때 (#29).
 *
 * 검색이 0건인 것과 조회 범위가 비어 있는 것은 **다른 사정**이고 다음 행동도 다르다.
 * 전에는 둘 다 `이 범위에 관광지가 없어요`였는데, `즐라탄`을 친 사람에게 범위 이야기를
 * 하는 것은 엉뚱한 곳을 고치라는 말과 같다. 그리고 그 옆에 붙던 제안 테마는 누를 수
 * 없는 글자였다 — 0건 화면에서 유일하게 다음으로 갈 자리였는데도.
 */
function NoResults({
  state,
  search,
  themeHref,
  onRetry,
}: {
  state: ExploreState;
  search: NonNullable<Route.ComponentProps["loaderData"]["data"]>["search"];
  themeHref: (theme: string) => string;
  onRetry: () => void;
}) {
  const term = state.query ?? state.theme;

  if (search && term) {
    return (
      <>
        <EmptyState message={`'${term}'에 맞는 관광지가 없어요.`} />
        <SuggestedThemes themes={search.suggestedThemes} hrefFor={themeHref} />
      </>
    );
  }

  return (
    <EmptyState
      message="이 범위에 관광지가 없어요."
      action={<SecondaryButton onClick={onRetry}>다시 불러오기</SecondaryButton>}
    />
  );
}

/** 카드 사이 24px — 리듬의 세 값(48 · 24 · 8) 밖으로 나가지 않는다. */
function PlaceList({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6">{children}</div>;
}
