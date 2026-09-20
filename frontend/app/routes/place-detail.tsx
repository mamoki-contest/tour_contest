import { Link, useLocation, useNavigate, useSearchParams } from "react-router";

import type { Route } from "./+types/place-detail";
import type { RelatedPlacesGroup } from "../lib/contract";
import { BottomNav } from "../components/bottom-nav";
import { ForecastGrid } from "../components/forecast-grid";
import { RelatedPlaceCard } from "../components/place-card";
import { useCollection } from "../lib/use-collection";
import { CurrentAccessSection } from "../components/road-status";
import { EmptyState, ErrorState } from "../components/states";
import { backHref, shouldUseHistoryBack } from "../lib/back-link";
import { parseExploreState } from "../lib/explore-params";
import { fetchPlaceDetail } from "../lib/place-detail.server";
import { formatSourceCaption } from "../lib/format";

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: `${loaderData?.detail?.name ?? "관광지"} — 한사나다` }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const result = await fetchPlaceDetail(params.placeId, request.signal);

  if (!result.ok) {
    console.error(`[detail] ${result.failure.dataName} 조회 실패: ${result.failure.cause}`);
    return { detail: null, error: { dataName: result.failure.dataName } };
  }

  return { detail: result.data, error: null };
}

export default function PlaceDetailRoute({ loaderData }: Route.ComponentProps) {
  const { detail, error } = loaderData;
  const [searchParams] = useSearchParams();
  // 탐색에서 들고 온 날짜 조건을 상세에서도 그대로 쓴다 — 조건이 화면마다 달라지지 않게.
  const state = parseExploreState(searchParams);
  const collection = useCollection();
  const saved = detail ? collection.isSaved(detail.placeId) : false;

  if (error || !detail) {
    return (
      <main className="mx-auto min-h-dvh max-w-[1024px] px-gutter py-gutter">
        <ErrorState
          dataName={error?.dataName ?? "관광지 정보"}
          action={
            <Link
              to="/"
              className="type-label-lg inline-flex h-12 items-center rounded-md bg-primary-strong px-4 text-surface transition-colors duration-200 hover:bg-primary-deep"
            >
              탐색 홈으로
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto min-h-dvh max-w-[1024px] px-gutter pb-32">
      <div className="sticky top-0 z-10 -mx-gutter bg-grey-50/95 px-gutter py-3 backdrop-blur">
        <BackLink />
      </div>

      {detail.photoUrl ? (
        <img src={detail.photoUrl} alt="" className="aspect-video w-full rounded-xl object-cover" />
      ) : (
        <div className="type-caption flex aspect-video w-full items-center justify-center rounded-xl bg-grey-100 text-grey-600">
          사진 없음
        </div>
      )}

      {/* 상세의 관광지 이름은 말줄임하지 않는다 — 확인하러 온 화면이다. */}
      <h1 className="type-headline-lg mt-4 text-grey-900">{detail.name}</h1>
      <p className="type-body-md mt-2 text-grey-600">
        {[detail.address, detail.category].filter(Boolean).join(" · ") || "주소 정보 없음"}
      </p>
      {detail.description ? (
        <p className="type-body-lg mt-4 text-grey-700">{detail.description}</p>
      ) : null}
      <p className="type-caption mt-2 text-grey-600">
        {formatSourceCaption(detail.source, detail.observedAt)}
      </p>

      {/*
        섹션 사이 48px. 붙이면 네 신호가 하나의 종합 평가처럼 읽힌다 (U20, ADR-0002).
        각 섹션은 자기 상태를 독립적으로 가진다 — 하나가 비어도 나머지는 그대로 산다 (U7).
      */}
      <Section title="언제 갈까요">
        <ForecastGrid forecast={detail.forecast} dateMode={state.dateMode} selectedDate={state.date} />
      </Section>

      <Section title="지금 가는 길">
        <CurrentAccessSection access={detail.currentAccess} />
      </Section>

      <RelatedSection
        title="대신 가볼 만한 곳"
        description="이 장소 대신 갈 만한 관광지예요. 한산할 것으로 보이는 날을 확인한 곳만 담았어요."
        group={detail.alternatives}
        noDataMessage="이 관광지의 연관 장소 정보를 얻지 못했어요."
        noneQualifiedMessage="연관 장소는 확인했지만, 예측을 가진 대체지 후보가 없었어요."
      />

      <RelatedSection
        title="함께 가기 좋은 곳"
        description="같은 여행에서 함께 들르기 좋은 음식점·숙박시설이에요. 대체지가 아니에요."
        group={detail.companions}
        noDataMessage="이 관광지의 연관 장소 정보를 얻지 못했어요."
        noneQualifiedMessage="연관 장소 중 음식점·숙박시설은 없었어요."
      />
      </main>

      {/*
        저장은 하단 고정 주 버튼 하나뿐이다 (D6) — 상단 아이콘을 따로 두지 않아
        `화면당 행동 하나`가 지켜진다. 저장 직후 같은 자리가 이동 경로로 바뀌므로
        별도 토스트를 띄우지 않는다 (U19).
      */}
      <div className="fixed inset-x-0 bottom-16 z-20 mx-auto max-w-[1024px] px-gutter pb-3">
        {saved ? (
          <Link
            to="/saved"
            className="type-label-lg flex h-12 w-full items-center justify-center rounded-md bg-primary-surface text-primary-strong shadow-float"
          >
            저장됨 · 나만의 지도에서 보기
          </Link>
        ) : (
          <button
            type="button"
            onClick={() =>
              collection.save({
                placeId: detail.placeId,
                name: detail.name,
                address: detail.address,
                photoUrl: detail.photoUrl,
                coordinates: detail.coordinates,
              })
            }
            className="type-label-lg h-12 w-full rounded-md bg-primary-strong text-surface shadow-float transition-colors duration-200 hover:bg-primary-deep"
          >
            저장하기
          </button>
        )}
      </div>

      <BottomNav savedCount={collection.snapshot.places.length} />
    </>
  );
}

/**
 * `← 뒤로` 비상구 (U9 · H3).
 *
 * href 와 클릭이 **다른 일을 한다.** href 는 언제나 앱 안의 실제 주소(탐색 홈 +
 * 탐색 조건)라 새 탭·가운데 클릭·링크 복사·JS 없는 첫 페인트가 전부 갈 곳이 있고,
 * 앱 안에서 들어온 경우에만 클릭이 히스토리 한 겹을 되돌린다. 링크로 곧장 들어온
 * 첫 진입은 뒤로가기를 부르지 않는다 — 그러면 사이트 밖으로 나간다.
 */
function BackLink() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Link
      to={backHref(location.search)}
      onClick={(event) => {
        // 새 탭·새 창으로 여는 수식 클릭은 브라우저에게 맡긴다.
        if (event.defaultPrevented) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        // 클릭 시점의 히스토리를 본다 — 렌더 중에 읽으면 서버에는 없는 값이다.
        if (!shouldUseHistoryBack(window.history.state)) return;

        event.preventDefault();
        navigate(-1);
      }}
      className="type-label-md inline-flex h-10 items-center rounded-sm text-grey-700"
    >
      ← 뒤로
    </Link>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-section">
      <h2 className="type-headline-md text-grey-800">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * 대체지 후보와 함께 가기 좋은 곳은 **같은 카드 모양**을 쓴다.
 * 형태로 나누면 둘 중 하나가 열등해 보인다 — 이 둘은 우열이 아니라 종류가 다르다.
 * 구분은 섹션과 문구가 한다.
 */
/**
 * 대체지 후보와 함께 가기 좋은 곳은 **같은 카드 모양**을 쓴다.
 * 형태로 나누면 둘 중 하나가 열등해 보인다 — 이 둘은 우열이 아니라 종류가 다르다.
 * 구분은 섹션과 문구가 한다.
 *
 * 비어 있을 때의 문구는 두 가지다. `확인해 봤지만 자격을 통과한 곳이 없었다`와
 * `정보를 얻지 못했다`를 같은 말로 덮으면, 확인해 봤다는 사실까지 사라진다.
 */
function RelatedSection({
  title,
  description,
  group,
  noDataMessage,
  noneQualifiedMessage,
}: {
  title: string;
  description: string;
  group: RelatedPlacesGroup;
  noDataMessage: string;
  noneQualifiedMessage: string;
}) {
  return (
    <Section title={title}>
      <p className="type-body-md -mt-2 mb-4 text-grey-600">{description}</p>

      {group.places.length === 0 ? (
        // 빈 추천을 감추지 않는다 — 섹션을 지우면 확인해 봤다는 사실까지 사라진다.
        <EmptyState
          message={group.status === "NO_RELATED_DATA" ? noDataMessage : noneQualifiedMessage}
        />
      ) : (
        <>
          <ul className="flex gap-6 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible">
            {group.places.map((place) => (
              <li key={`${place.name}-${place.rank ?? 0}`} className="w-[260px] shrink-0 sm:w-auto">
                <RelatedPlaceCard place={place} />
              </li>
            ))}
          </ul>
          <p className="type-caption mt-4 text-grey-600">
            {formatSourceCaption(group.source, group.observedAt)}
          </p>
        </>
      )}
    </Section>
  );
}
