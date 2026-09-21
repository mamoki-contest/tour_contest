import { Link } from "react-router";

import { searchConditionChip } from "../lib/condition-chip";
import {
  DEFAULT_EXPLORE_STATE,
  exploreHref,
  hasActiveConditions,
  type ExploreState,
} from "../lib/explore-params";

/**
 * 조건 요약 줄 (WIREFRAME U4) — 걸려 있는 네 조건을 항상 보이게 하고, 각 칩이 해당
 * 시트로 가는 입구가 된다. 조건을 동시에 펼치지 않고 필요할 때 하나씩 여는 방식이라
 * `화면당 결정 하나`가 유지된다.
 *
 * 말줄임 없이 가로 스크롤한다 (U14) — 긴 시·군명이 다른 조건을 밀어내면 안 된다.
 */
export function ConditionBar({
  state,
  regionLabel,
  normalizedTheme = null,
  onOpenRegion,
  onOpenSearch,
  onOpenDate,
}: {
  state: ExploreState;
  /** 선택된 시·군 이름. 없으면 `강원 전체`. */
  regionLabel: string | null;
  /**
   * 백엔드가 검색어를 지원 테마로 정규화했을 때 그 테마 이름 (#26).
   *
   * 입력은 `해수용장`이었지만 목록은 해수욕장 테마 결과다. 칩이 입력어를 그대로
   * 되뇌면 조건 칩과 결과가 어긋나고, 사용자는 일반 검색 결과를 보고 있다고 믿는다.
   */
  normalizedTheme?: string | null;
  /** 탐색 범위 시트를 여는 동작. 없으면 칩이 현재 값만 말하는 상태 표시로 남는다. */
  onOpenRegion?: () => void;
  /** 검색 시트를 여는 동작. 아직 없으면 칩이 현재 값만 말하는 상태 표시로 남는다. */
  onOpenSearch?: () => void;
  /** 날짜 시트를 여는 동작. 없으면 마찬가지로 상태 표시로 남는다. */
  onOpenDate?: () => void;
}) {
  const searchChip = searchConditionChip(state.theme ?? normalizedTheme, state.query);
  const dateLabel =
    state.dateMode === "FIXED" && state.date ? formatChipDate(state.date) : "날짜 미정";
  const sortLabel = state.sort === "MENTION_DESC" ? "온라인 언급 많은 순" : "온라인 언급 적은 순";

  return (
    <div className="flex gap-2 overflow-x-auto" aria-label="적용된 탐색 조건">
      {/* 지도 경계가 확정돼 있으면 `강원 전체`라고 말하면 안 된다 — 실제 조회 범위가 다르다. */}
      <ConditionChip
        onClick={onOpenRegion}
        label="탐색 범위"
        value={regionLabel ?? (state.bounds ? "이 지도 범위" : "강원 전체")}
      />
      <ConditionChip onClick={onOpenSearch} label={searchChip.label} value={searchChip.value} />
      <ConditionChip onClick={onOpenDate} label="날짜" value={dateLabel} />
      {/* 정렬은 시트가 아니라 시트 헤더의 토글이 주인이다. 칩은 현재 값만 말한다. */}
      <ConditionChip label="정렬" value={sortLabel} />
      {hasActiveConditions(state) ? (
        <Link
          to={exploreHref({ ...DEFAULT_EXPLORE_STATE, snap: state.snap })}
          className="type-label-md inline-flex h-10 shrink-0 items-center rounded-sm bg-surface px-3 whitespace-nowrap text-primary-strong shadow-float transition-colors duration-200"
        >
          초기화
        </Link>
      ) : null}
    </div>
  );
}

/** 여는 동작이 있으면 시트 입구가 되고, 없으면 현재 값만 말하는 상태 표시로 남는다. */
function ConditionChip({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick?: () => void;
}) {
  /*
   * `relative` 가 칩 자신을 아래 `sr-only` 의 기준 상자로 만든다 — 장식이 아니라 필요다.
   *
   * `sr-only` 는 `position: absolute` 다. 칩 안에 기준이 될 상자가 없으면 이 줄
   * 바깥(가로 스크롤 영역 밖)의 상자가 기준이 되고, 그러면 **가로 스크롤이 잘라 주지
   * 못한다** — 칩이 늘어나 스크롤 영역을 넘어가는 순간 그 보이지 않는 글자가 페이지
   * 폭을 밀어낸다. 기준을 칩으로 당겨 두면 스크롤 영역 안에서 함께 잘린다.
   */
  const shell =
    "type-label-md relative inline-flex h-10 shrink-0 items-center rounded-sm bg-surface px-3 whitespace-nowrap text-grey-700 shadow-float";

  if (!onClick) {
    return (
      <span className={shell}>
        <span className="sr-only">{label}: </span>
        {value}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${shell} transition-colors duration-200 hover:bg-grey-50`}
    >
      <span className="sr-only">{label}: </span>
      {value}
    </button>
  );
}

/** 칩 안에서는 연도를 떨어뜨린다 — 향후 30일이라 월·일이면 충분하고 줄을 밀지 않는다. */
function formatChipDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "날짜 미정";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(parsed);
}
