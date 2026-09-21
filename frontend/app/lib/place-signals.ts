import type { OnlineMention, TmapRank, VisitorStats } from "./contract";

/**
 * 카드가 세 신호를 무슨 말로 적을지 고르는 규칙 (슬라이스 #4).
 *
 * 온라인 언급량·TMAP 검색순위·입장객 수는 **범위도 단위도 기준 시점도 다르다.**
 * 그래서 합치지도, 서로의 결측을 대신하지도 않는다 (PRD v4 §신호 결합). 화면에서 그
 * 금지를 지키는 방법은 셋을 각각 제 문장으로 적고, 없을 때도 **각각 제 이유로** 없다고
 * 말하는 것이다 — `보조 정보 없음` 한 줄로 뭉치면 무엇을 확인해 봤는지가 사라진다.
 *
 * 여기서는 말만 고른다. 점선 배지냐 본문 줄이냐는 `place-card` 가 정한다.
 */

/**
 * 한 신호가 카드에서 차지하는 자리.
 *
 * 값이 없어도 자리를 비우지 않는다 — 빈자리는 좋은 소식으로 읽힌다(DESIGN.md).
 */
export type PlaceSignal =
  /** `value` 는 사실, `basis` 는 그 사실이 언제 기준인지다. 공급자 이름은 넣지 않는다 (#35). */
  | { kind: "value"; value: string; basis: string | null }
  | { kind: "no-data"; label: string };

const COUNT_FORMAT = new Intl.NumberFormat("ko-KR");

function formatCount(count: number): string {
  return COUNT_FORMAT.format(count);
}

const MONTH_FORMAT = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  timeZone: "Asia/Seoul",
});

/**
 * 수집 시각을 **수집 월**로 줄인다 — `9월 기준`.
 *
 * 언급량은 월 1회 스냅샷이라 일·시각까지 적으면 그날 센 값처럼 읽힌다. PRD v4가
 * 화면에 요구하는 것도 검색 결과 수와 `수집 월`이다.
 */
export function formatMentionMonth(collectedAt: string | null): string | null {
  if (!collectedAt) return null;
  const parsed = new Date(collectedAt);
  if (Number.isNaN(parsed.getTime())) return null;
  return `${MONTH_FORMAT.format(parsed)} 기준`;
}

/** `202508-202607` → `2025.08~2026.07`. 모양이 다르면 지어내지 않고 버린다. */
export function formatTmapPeriod(period: string | null): string | null {
  if (!period) return null;
  const match = /^(\d{4})(\d{2})-(\d{4})(\d{2})$/.exec(period.trim());
  if (!match) return null;
  const [, fromYear, fromMonth, toYear, toMonth] = match;
  return `${fromYear}.${fromMonth}~${toYear}.${toMonth}`;
}

/** `202512` → `2025.12`. 모양이 다르면 버린다 — 기준 시점을 추측하지 않는다. */
export function formatVisitorPeriod(period: string | null): string | null {
  if (!period) return null;
  const match = /^(\d{4})(\d{2})$/.exec(period.trim());
  if (!match) return null;
  return `${match[1]}.${match[2]}`;
}

/**
 * 언급량이 없는 네 갈래 중 셋.
 *
 * **같은 문구로 표시하지 않는다.** `이름이 흔해 가릴 수 없다`와 `호출이 실패했다`는
 * 사용자에게 다른 사실이고, 강원 카탈로그에서 `AMBIGUOUS` 는 76곳으로 드물지도 않다.
 */
const MENTION_NO_DATA: Record<Exclude<OnlineMention["status"], "COLLECTED">, string> = {
  AMBIGUOUS: "언급 판정 보류",
  UNAVAILABLE: "언급 집계 대상 아님",
  COLLECTION_FAILED: "언급 미수집",
};

export function mentionSignal(mention: OnlineMention): PlaceSignal {
  if (mention.status !== "COLLECTED" || mention.count === null) {
    const status = mention.status === "COLLECTED" ? "COLLECTION_FAILED" : mention.status;
    return { kind: "no-data", label: MENTION_NO_DATA[status] };
  }

  // 0건은 정상 수집의 정상 값이다 — `없음`으로 넘기지 않는다.
  return {
    kind: "value",
    value: `온라인 언급 ${formatCount(mention.count)}건`,
    basis: formatMentionMonth(mention.collectedAt),
  };
}

export function tmapSignal(rank: TmapRank): PlaceSignal {
  if (rank.status !== "AVAILABLE" || rank.rank === null) {
    // 수록되지 않은 것이지 순위가 낮은 것이 아니다.
    return { kind: "no-data", label: "TMAP 미수록" };
  }

  // 시·군을 문구 안에 박아 둔다 — 강원 전역 순위로 읽히면 PRD v4가 막는 오해가 그대로 생긴다.
  return {
    kind: "value",
    value: `시·군 TMAP 검색 ${rank.rank}위`,
    basis: formatTmapPeriod(rank.period),
  };
}

const VISITOR_COUNT_LABEL: Record<NonNullable<VisitorStats["countStatus"]>, string> = {
  PROVISIONAL: "잠정",
  CONFIRMED: "확정",
};

export function visitorSignal(stats: VisitorStats): PlaceSignal {
  if (stats.status !== "AVAILABLE" || stats.count === null) {
    /*
     * 확인해 봤는데 그 달 집계가 없는 것(`NOT_REGISTERED`)과 통계 파일을 아직 적재하지
     * 않아 확인해 본 적이 없는 것(`NOT_IMPORTED`)은 다른 말이다. 어느 쪽도 `0명`이 아니다.
     */
    return {
      kind: "no-data",
      label: stats.status === "NOT_IMPORTED" ? "입장객 정보 없음" : "입장객 미집계",
    };
  }

  const period = formatVisitorPeriod(stats.period);
  // 잠정치를 확정치처럼 읽히게 두지 않는다 — 기준 월 옆에 반드시 붙인다.
  const countLabel = stats.countStatus === null ? null : `(${VISITOR_COUNT_LABEL[stats.countStatus]})`;
  const basis = [period, countLabel].filter((part): part is string => part !== null).join(" ");

  return {
    kind: "value",
    value: `입장객 ${formatCount(stats.count)}명`,
    basis: basis === "" ? null : basis,
  };
}

/** 어느 신호의 줄인지. 순서가 바뀌어도 자리가 흔들리지 않게 한다. */
export type PlaceSignalKey = "mention" | "tmap" | "visitor";

/** 카드가 그리는 순서. 정렬이 쓰는 신호가 먼저 오고, 보조 근거가 뒤를 받친다. */
export function placeSignals(place: {
  onlineMention: OnlineMention;
  tmapRank: TmapRank;
  visitorStats: VisitorStats;
}): (PlaceSignal & { key: PlaceSignalKey })[] {
  return [
    { key: "mention", ...mentionSignal(place.onlineMention) },
    { key: "tmap", ...tmapSignal(place.tmapRank) },
    { key: "visitor", ...visitorSignal(place.visitorStats) },
  ];
}
