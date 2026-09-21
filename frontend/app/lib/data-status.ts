import type { DataStatus } from "./contract";

/**
 * 데이터 상태를 사용자가 읽는 한 줄로 옮긴다 (#21 · #35).
 *
 * 화면은 오래 값의 null 여부만 봤다 — 캐시가 만료된 뒤 공급자 실패로 돌려주는
 * **최종 정상 데이터**(`STALE`)가 방금 받은 값과 똑같이 보였다. 여기서 그 둘을 가른다.
 *
 * `STALE` 과 `MISSING` 을 같은 문구로 덮지 않는다. 앞엣것은 **낡았지만 있는 값**이고
 * 뒤엣것은 **없는 값**이다. 낡은 값을 없다고 말하면 쓸 수 있는 정보를 버리게 되고,
 * 없는 값을 낡았다고 말하면 있지도 않은 숫자를 기다리게 한다.
 */

export function isStale(status: DataStatus | null | undefined): boolean {
  return status === "STALE";
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function parse(observedAt: string | null | undefined): Date | null {
  if (!observedAt) return null;
  const parsed = new Date(observedAt);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * `3시간 전` · `2일 전` · `방금 전`. 시점을 모르면 null —
 * 모르는 것을 `0시간 전`으로 적지 않는다.
 */
export function formatAge(observedAt: string | null | undefined, now: Date = new Date()): string | null {
  const parsed = parse(observedAt);
  if (!parsed) return null;

  const elapsed = now.getTime() - parsed.getTime();
  // 서버 시계가 조금 앞서 있을 수 있다. 미래를 `-1시간 전`으로 적지 않는다.
  if (elapsed < HOUR) return "방금 전";
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}시간 전`;
  return `${Math.floor(elapsed / DAY)}일 전`;
}

/**
 * STALE 한 줄. 기준 시점을 알면 얼마나 낡았는지까지 말한다.
 * — `최근 저장된 정보 · 3시간 전 기준`
 */
export function formatStaleCaption(
  observedAt: string | null | undefined,
  now: Date = new Date(),
): string {
  const age = formatAge(observedAt, now);
  return age ? `최근 저장된 정보 · ${age} 기준` : "최근 저장된 정보";
}

/**
 * 기준 시점 한 줄 (#35) — `9월 21일 기준`.
 *
 * 공급자 이름을 붙이지 않는다. 올해가 아니면 연도를 함께 적는다 — 한 해를 넘긴
 * 기준 시점이 올해 것처럼 읽히면 안 된다. 시점을 모르면 null이고, 화면은 그 줄을
 * 아예 그리지 않는다.
 */
export function formatBaselineCaption(
  observedAt: string | null | undefined,
  now: Date = new Date(),
): string | null {
  const parsed = parse(observedAt);
  if (!parsed) return null;

  const year = new Intl.DateTimeFormat("en-CA", { year: "numeric", timeZone: "Asia/Seoul" });
  const sameYear = year.format(parsed) === year.format(now);

  return `${new Intl.DateTimeFormat("ko-KR", {
    ...(sameYear ? {} : { year: "numeric" }),
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(parsed)} 기준`;
}

/**
 * 한 신호가 화면에 달고 갈 캡션.
 *
 * `STALE` 이면 낡았다는 사실이 기준 시점보다 먼저다 — 값이 최신인 줄 알고 움직이면
 * 헛걸음이 되기 때문이다. 그 밖에는 기준 시점 한 줄만 남긴다 (#35).
 */
export function formatStatusCaption(
  status: DataStatus | null | undefined,
  observedAt: string | null | undefined,
  now: Date = new Date(),
): string | null {
  return isStale(status) ? formatStaleCaption(observedAt, now) : formatBaselineCaption(observedAt, now);
}
