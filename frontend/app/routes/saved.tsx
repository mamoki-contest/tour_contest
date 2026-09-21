import { useCallback, useEffect, useState } from "react";
import { Link, useFetcher, useLocation, useNavigate } from "react-router";

import type { Route } from "./+types/saved";
import { BottomNav } from "../components/bottom-nav";
import { HelpSheet } from "../components/help-sheet";
import { SaveEditSheet } from "../components/save-controls";
import { ErrorState, SecondaryButton } from "../components/states";
import { useCollection } from "../lib/use-collection";
import { savedDetailHref, shouldUseHistoryBack } from "../lib/back-link";
import { closeSheetSearch, openSheetSearch } from "../lib/sheet-link";
import { useHelpSeen } from "../lib/use-help-seen";
import type { CollectionItemStatus } from "../lib/contract";
import type { SavedPlace } from "../lib/personal-collection";
import { NoDataBadge } from "../components/badges";
import { formatCalendarDate } from "../lib/forecast-window";
import { fetchForecastWindow } from "../lib/places.server";
import type { loader as lookupLoader } from "./saved-lookup";

export function meta({}: Route.MetaArgs) {
  return [{ title: "나만의 지도 — 한사나다" }];
}

/**
 * 저장 목록 자체는 이 브라우저에만 있어 서버가 알 수 없다. 로더가 가져오는 것은
 * **방문 예정일을 고를 수 있는 창**뿐이다 (#30 M3) — 그 값은 백엔드만 안다.
 */
export async function loader({ request }: Route.LoaderArgs) {
  return { forecastWindow: await fetchForecastWindow(request.signal) };
}

/**
 * 나만의 지도 (슬라이스 #9).
 *
 * 탐색 홈과 같은 골격을 의도적으로 재사용하되 **방문 규모 색상은 없다** — 개인 화면이
 * 인기 순위를 나타내지 않는다 (ADR-0005). 하단 내비의 활성 표시가 두 화면을 구분한다.
 */
export default function SavedRoute({ loaderData }: Route.ComponentProps) {
  const { snapshot, loaded, save, remove, clear } = useCollection();
  const [editing, setEditing] = useState<SavedPlace | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const freshness = useFreshness(snapshot.places.map((place) => place.placeId));
  const location = useLocation();
  const navigate = useNavigate();

  /*
   * 도움말은 이 화면에서 연다 (#41). 탐색 홈으로 보내던 링크는 저장 목록을 떠나게
   * 했고, 그 길로 도움말을 다 읽어도 `아직 안 봤음` 표시가 남았다.
   */
  const helpOpen = new URLSearchParams(location.search).get("sheet") === "help";
  useHelpSeen(helpOpen);

  const closeHelp = useCallback(() => {
    if (shouldUseHistoryBack(window.history.state)) {
      navigate(-1);
      return;
    }
    navigate({ search: closeSheetSearch(location.search) }, { replace: true });
  }, [navigate, location.search]);

  const allTags = [...new Set(snapshot.places.flatMap((place) => place.tags))];
  const visible = tagFilter
    ? snapshot.places.filter((place) => place.tags.includes(tagFilter))
    : snapshot.places;

  return (
    <>
      <main className="mx-auto min-h-dvh max-w-[1024px] px-gutter py-gutter pb-28">
        <h1 className="type-display text-grey-900">나만의 지도</h1>

        {/*
          통째로 상한 것과 일부만 상한 것은 **다른 화면**이다 (#28).

          일부라면 나머지가 남아 목록이 서고, 한 줄 알림만 있으면 된다. 통째로 상하면
          남는 것이 없어 `아직 저장한 곳이 없어요`와 `불러오지 못했어요`가 나란히 뜬다 —
          서로 어긋나는 두 문장이고, 되돌릴 버튼이 없어 영영 이 화면이다.
        */}
        {snapshot.corrupted ? (
          <CorruptedCollection onClear={clear} />
        ) : (
          <>
            {snapshot.droppedCount > 0 ? (
              <div className="mt-4">
                <ErrorState dataName="일부 저장 정보" />
              </div>
            ) : null}

            {!loaded ? (
              <p className="type-body-lg mt-6 text-grey-600">불러오는 중이에요</p>
            ) : snapshot.places.length === 0 ? (
              // 빈 지도를 보여주지 않는다. 탐색으로 돌아가는 입구를 준다 (ADR-0005 명시).
              <div className="mt-6 rounded-xl bg-grey-50 p-5">
                <p className="type-body-lg text-grey-700">아직 저장한 곳이 없어요.</p>
                <Link
                  to="/"
                  className="type-label-lg mt-4 inline-flex h-12 items-center rounded-md bg-primary-strong px-4 text-surface transition-colors duration-200 hover:bg-primary-deep"
                >
                  탐색 홈에서 둘러보기
                </Link>
              </div>
            ) : (
              <>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="type-headline-md text-grey-800">
                    저장한 곳 {snapshot.places.length}곳
                  </h2>
                  {/* 보관 위치 설명은 도움말 한 자리에 모았다 (#35). 이 화면을 떠나지 않는다 (#41). */}
                  <Link
                    to={{ search: openSheetSearch(location.search, "help") }}
                    className="type-label-md text-primary-strong"
                  >
                    ⓘ 저장한 곳은 어디에 남나요
                  </Link>
                </div>

                {allTags.length > 0 ? (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                    <TagFilterChip selected={tagFilter === null} onClick={() => setTagFilter(null)}>
                      전체
                    </TagFilterChip>
                    {allTags.map((tag) => (
                      <TagFilterChip
                        key={tag}
                        selected={tagFilter === tag}
                        onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                      >
                        {tag}
                      </TagFilterChip>
                    ))}
                  </div>
                ) : null}

                <ul className="mt-6 grid gap-6">
                  {visible.map((place) => (
                    <li key={place.placeId}>
                      <article className="rounded-xl bg-surface p-4">
                        {/*
                          어디서 온 카드인지 주소에 적어 둔다 (#42) — 상세의 `← 뒤로`가
                          탐색 홈이 아니라 이 목록을 가리켜야 한다.
                        */}
                        <Link to={savedDetailHref(place.placeId)} className="block rounded-lg">
                          <h3 className="type-title-md line-clamp-2 text-grey-900">{place.name}</h3>
                          <p className="type-body-md mt-2 truncate text-grey-600">
                            {place.address ?? "주소 정보 없음"}
                          </p>
                        </Link>

                        {place.tags.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {place.tags.map((tag) => (
                              <span
                                key={tag}
                                className="type-label-md inline-flex items-center rounded-full bg-grey-100 px-3 py-1 text-grey-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        {place.memo ? (
                          <p className="type-body-md mt-2 line-clamp-6 whitespace-pre-wrap text-grey-700">
                            {place.memo}
                          </p>
                        ) : null}

                        {/* 저장값은 `2026-09-24`지만 화면은 읽을 수 있는 날로 말한다 (#30 M2). */}
                        {place.plannedDate ? (
                          <p className="type-caption mt-2 text-grey-600">
                            방문 예정일 {formatCalendarDate(place.plannedDate)}
                          </p>
                        ) : null}

                        <FreshnessNote status={freshness.get(place.placeId) ?? null} />

                        <button
                          type="button"
                          onClick={() => setEditing(place)}
                          className="type-label-md mt-4 text-primary-strong"
                        >
                          태그·메모 수정
                        </button>
                      </article>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </main>

      <BottomNav savedCount={snapshot.places.length} />

      {editing ? (
        <SaveEditSheet
          place={editing}
          supported={loaderData.forecastWindow}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            save({ ...editing, ...patch });
            setEditing(null);
          }}
          onRemove={() => {
            remove(editing.placeId);
            setEditing(null);
          }}
        />
      ) : null}

      {helpOpen ? <HelpSheet onClose={closeHelp} /> : null}
    </>
  );
}

/**
 * 읽을 수 없게 된 저장값에서 빠져나오는 길 (#28).
 *
 * 빈 상태 문구는 띄우지 않는다 — 저장한 곳이 없는 것이 아니라 읽지 못한 것이고,
 * 두 문장이 함께 뜨면 어느 쪽이 사실인지 알 수 없다. 지우기는 되돌릴 수 없으므로
 * **한 단계 확인**을 거친다 (H5 에러 예방). 확인 전까지 원본은 그대로 남는다.
 */
function CorruptedCollection({ onClear }: { onClear: () => void }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="mt-6 rounded-xl bg-red-surface p-5" role="alert">
      <p className="type-body-lg text-red-deep">저장 정보를 읽을 수 없어요</p>
      <p className="type-caption mt-2 text-grey-700">
        지우면 저장해 둔 곳과 태그·메모가 함께 사라지고 되돌릴 수 없어요.
      </p>

      {confirming ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <SecondaryButton onClick={() => setConfirming(false)}>그대로 두기</SecondaryButton>
          <button
            type="button"
            onClick={onClear}
            className="type-label-lg h-12 rounded-md bg-red px-4 text-surface transition-colors duration-200"
          >
            지우고 새로 시작
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <SecondaryButton onClick={() => setConfirming(true)}>
            지우고 새로 시작하기
          </SecondaryButton>
        </div>
      )}
    </div>
  );
}

function TagFilterChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "type-label-md inline-flex h-10 shrink-0 items-center rounded-full px-3 whitespace-nowrap transition-colors duration-200",
        selected ? "bg-primary-surface text-primary-strong" : "bg-grey-100 text-grey-700",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/**
 * 저장해 둔 식별자로 지금 상태를 묻는다.
 *
 * 컬렉션은 이 브라우저에만 있으므로 서버 로더가 먼저 알 수 없다 — 목록을 읽은 뒤에
 * 화면이 식별자를 들고 물으러 간다. 답이 늦거나 실패해도 저장 목록은 그대로 선다.
 */
function useFreshness(placeIds: string[]): Map<string, CollectionItemStatus> {
  const fetcher = useFetcher<typeof lookupLoader>();
  // 같은 목록으로 다시 묻지 않게, 식별자 묶음이 바뀔 때만 조회한다.
  const key = placeIds.join(",");

  useEffect(() => {
    if (key === "") return;
    const query = new URLSearchParams();
    for (const id of key.split(",")) query.append("id", id);
    fetcher.load(`/saved/lookup?${query.toString()}`);
    // fetcher는 매 렌더 새 객체라 의존성에 넣으면 조회가 멈추지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return new Map((fetcher.data?.items ?? []).map((item) => [item.placeId, item.status]));
}

/**
 * 확인 결과 한 줄.
 *
 * `확인하지 못했다`와 `없어졌다`를 절대 같은 말로 쓰지 않는다 — 부르지 못한 것을
 * 사라진 것으로 표시하면, 멀쩡히 저장해 둔 곳을 지우라고 권하게 된다.
 * 정상일 때는 아무 말도 하지 않는다. 모든 카드에 `정상`을 붙이면 예외가 묻힌다.
 */
function FreshnessNote({ status }: { status: CollectionItemStatus | null }) {
  if (status === null || status === "AVAILABLE") return null;

  return (
    <p className="mt-2">
      {status === "NOT_FOUND" ? (
        <NoDataBadge>더 이상 찾을 수 없는 곳이에요 — 정리해도 괜찮아요</NoDataBadge>
      ) : (
        <NoDataBadge>이번에는 확인하지 못했어요 — 사라진 곳은 아니에요</NoDataBadge>
      )}
    </p>
  );
}
