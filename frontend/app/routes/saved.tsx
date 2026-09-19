import { useEffect, useState } from "react";
import { Link, useFetcher } from "react-router";

import type { Route } from "./+types/saved";
import { BottomNav } from "../components/bottom-nav";
import { SaveEditSheet } from "../components/save-controls";
import { ErrorState } from "../components/states";
import { useCollection } from "../lib/use-collection";
import type { CollectionItemStatus } from "../lib/contract";
import type { SavedPlace } from "../lib/personal-collection";
import { NoDataBadge } from "../components/badges";
import type { loader as lookupLoader } from "./saved-lookup";

export function meta({}: Route.MetaArgs) {
  return [{ title: "나만의 지도 — 한사나다" }];
}

/**
 * 나만의 지도 (슬라이스 #9).
 *
 * 탐색 홈과 같은 골격을 의도적으로 재사용하되 **방문 규모 색상은 없다** — 개인 화면이
 * 인기 순위를 나타내지 않는다 (ADR-0005). 하단 내비의 활성 표시가 두 화면을 구분한다.
 */
export default function SavedRoute() {
  const { snapshot, loaded, save, remove } = useCollection();
  const [editing, setEditing] = useState<SavedPlace | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const freshness = useFreshness(snapshot.places.map((place) => place.placeId));

  const allTags = [...new Set(snapshot.places.flatMap((place) => place.tags))];
  const visible = tagFilter
    ? snapshot.places.filter((place) => place.tags.includes(tagFilter))
    : snapshot.places;

  return (
    <>
      <main className="mx-auto min-h-dvh max-w-[1024px] px-gutter py-gutter pb-28">
        <h1 className="type-display text-grey-900">나만의 지도</h1>

        {/*
          손상된 항목이 있어도 정상 항목은 그대로 보여준다 — 화면 전체를 중단시키지 않는다.
        */}
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
            <p className="type-caption mt-2 text-grey-600">
              저장한 곳은 이 브라우저에만 남아요. 다른 기기에서는 보이지 않아요.
            </p>
            <Link
              to="/"
              className="type-label-lg mt-4 inline-flex h-12 items-center rounded-md bg-primary-strong px-4 text-surface transition-colors duration-200 hover:bg-primary-deep"
            >
              탐색 홈에서 둘러보기
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-2 flex items-center justify-between gap-2">
              <h2 className="type-headline-md text-grey-800">저장한 곳 {snapshot.places.length}곳</h2>
            </div>
            <p className="type-caption mt-2 text-grey-600">
              이 브라우저에만 보관돼요. 기기를 바꾸거나 지우면 사라져요.
            </p>

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
                    <Link
                      to={`/places/${encodeURIComponent(place.placeId)}`}
                      className="block rounded-lg"
                    >
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

                    {place.plannedDate ? (
                      <p className="type-caption mt-2 text-grey-600">
                        방문 예정일 {place.plannedDate}
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
      </main>

      <BottomNav savedCount={snapshot.places.length} />

      {editing ? (
        <SaveEditSheet
          place={editing}
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
    </>
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
 * `확인하지 못했다`와 `없어졌다`를 절대 같은 말로 쓰지 않는다 — 공급자를 못 부른 것을
 * 사라진 것으로 표시하면, 멀쩡히 저장해 둔 곳을 지우라고 권하게 된다.
 * 정상일 때는 아무 말도 하지 않는다. 모든 카드에 `정상`을 붙이면 예외가 묻힌다.
 */
function FreshnessNote({ status }: { status: CollectionItemStatus | null }) {
  if (status === null || status === "AVAILABLE") return null;

  return (
    <p className="mt-2">
      {status === "NOT_FOUND" ? (
        <NoDataBadge>공급자에 더 이상 없는 곳이에요 — 정리해도 괜찮아요</NoDataBadge>
      ) : (
        <NoDataBadge>이번에는 확인하지 못했어요 — 사라진 곳은 아니에요</NoDataBadge>
      )}
    </p>
  );
}
