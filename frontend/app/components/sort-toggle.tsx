import { Link } from "react-router";

import { exploreHref, type ExploreState, type SortOrder } from "../lib/explore-params";

/**
 * 온라인 언급 많은 순 ⇄ 온라인 언급 적은 순 (PRD v4 §온라인 언급량 수집과 정렬).
 *
 * 회색 트랙 위에 선택된 항목만 흰 알약으로 뜬다. **파란색을 쓰지 않는다** — 어느 쪽도
 * 권장 방향이 아니기 때문이다. 이름에 `인기`·`혼잡한 순`·`한산한 순`을 쓰지 않는다:
 * 블로그 검색 결과 수는 실제 인기도, 방문객 수도, 현재 혼잡도 아니다.
 *
 * 링크로 만든 이유는 정렬이 URL 상태이기 때문이다 — 뒤로가기가 이전 정렬로 돌아간다 (U6).
 */
export function SortToggle({ state }: { state: ExploreState }) {
  return (
    <div
      role="group"
      aria-label="온라인 언급 정렬"
      className="inline-flex shrink-0 gap-1 rounded-sm bg-grey-100 p-1"
    >
      <SortOption state={state} value="MENTION_DESC">
        온라인 언급 많은 순
      </SortOption>
      <SortOption state={state} value="MENTION_ASC">
        온라인 언급 적은 순
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
 * 정렬이 무엇을 센 값인지 모른 채 방향을 뒤집으면 `온라인 언급 적은 순`을 `한산한 순`
 * 으로 읽는다. 그 오해를 막는 것이 이 캡션의 일이다.
 */
export function MentionSortNote({
  source,
  observedAt,
  /** 요청한 정렬이 적용되지 않았으면 그 사실을 먼저 말한다 — 토글만 눌린 채로 두지 않는다. */
  sortApplied = true,
}: {
  source: string | null;
  /** 이미 문구로 다듬어진 기준 시점. 예: `2026년 9월 19일 기준`. */
  observedAt: string | null;
  sortApplied?: boolean;
}) {
  return (
    <>
      {!sortApplied ? (
        <p className="type-caption mt-2 text-grey-700">
          지금은 온라인 언급 정보가 없어 순서를 매기지 않았어요
        </p>
      ) : null}
      <p className="type-caption mt-2 text-grey-600">
        {[source ?? "출처 없음", observedAt ?? "기준 시점 없음"].join(" · ")} · 실제 방문객 수가
        아니라 온라인에서 얼마나 언급됐는지예요
      </p>
    </>
  );
}

/**
 * 옛 이름. `home.tsx` 가 이 이름으로 부르고 있어 남겨 둔다 — 그 파일이 새 이름으로
 * 옮겨 가면 이 줄을 지운다. 화면 문구는 이미 v4 어휘다.
 */
export const InterestSourceNote = MentionSortNote;
