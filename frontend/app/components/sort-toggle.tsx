import { Link } from "react-router";

import { exploreHref, type ExploreState, type SortOrder } from "../lib/explore-params";

/**
 * 인기 많은 순 ⇄ 덜 알려진 순 (ADR-0006 양방향 관심도 탐색).
 *
 * 회색 트랙 위에 선택된 항목만 흰 알약으로 뜬다. **파란색을 쓰지 않는다** — 어느 쪽도
 * 권장 방향이 아니기 때문이다. 정렬 이름에 `혼잡한 순`·`한산한 순`을 쓰지 않는다:
 * 관심도는 과거 관심 행동이지 혼잡이 아니다.
 *
 * 링크로 만든 이유는 정렬이 URL 상태이기 때문이다 — 뒤로가기가 이전 정렬로 돌아간다 (U6).
 */
export function SortToggle({ state }: { state: ExploreState }) {
  return (
    <div
      role="group"
      aria-label="관광지 관심도 정렬"
      className="inline-flex shrink-0 gap-1 rounded-sm bg-grey-100 p-1"
    >
      <SortOption state={state} value="INTEREST_DESC">
        인기 많은 순
      </SortOption>
      <SortOption state={state} value="INTEREST_ASC">
        덜 알려진 순
      </SortOption>
    </div>
  );
}

function SortOption({
  state,
  value,
  children,
}: {
  state: ExploreState;
  value: SortOrder;
  children: React.ReactNode;
}) {
  const selected = state.sort === value;

  return (
    <Link
      to={exploreHref({ ...state, sort: value })}
      replace
      aria-current={selected ? "true" : undefined}
      className={[
        "type-label-md inline-flex h-8 items-center rounded-sm px-3 whitespace-nowrap transition-colors duration-200",
        selected ? "bg-surface text-grey-900" : "text-grey-700",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

/**
 * 정렬 토글 바로 아래 상시 캡션 (U3) — 접지 않는다.
 *
 * 관심도가 혼잡과 무관하다는 사실을 모른 채 정렬을 뒤집으면 `덜 알려진 순`을
 * `한산한 순`으로 읽는다. 그 오해를 막는 것이 이 캡션의 일이다.
 */
export function InterestSourceNote({
  source,
  observedAt,
}: {
  source: string | null;
  observedAt: string | null;
}) {
  return (
    <p className="type-caption mt-2 text-grey-600">
      {[source ?? "출처 없음", observedAt ?? "기준 시점 없음"].join(" · ")} · 실제 방문객 수가
      아니라 내비게이션 목적지 집계예요
    </p>
  );
}
