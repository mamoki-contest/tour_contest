/**
 * 날짜 확정 탐색이 다룰 수 있는 창 (슬라이스 #6).
 *
 * 오늘부터 30일. 이 창 밖은 **고를 수 없게 막는다** — 고른 뒤에 에러를 띄우는 게
 * 아니라 구조로 예방한다 (U10, H5 에러 예방).
 */

export const FORECAST_WINDOW_DAYS = 30;

/** 서울 기준 달력 날짜로 읽는다. 사용자가 보는 `오늘`과 서버 시간대가 어긋나지 않게. */
export function toCalendarDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(date);
}

export function todayInSeoul(now: Date = new Date()): string {
  return toCalendarDate(now);
}

function addDays(calendarDate: string, days: number): string {
  const [year, month, day] = calendarDate.split("-").map(Number);
  // UTC로 더해야 서머타임 없는 한국에서도 날짜가 밀리지 않는다.
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return shifted.toISOString().slice(0, 10);
}

/** 오늘 ~ +30일. 캘린더가 그릴 수 있는 날의 전부다. */
export function forecastWindow(now: Date = new Date()): string[] {
  const start = todayInSeoul(now);
  return Array.from({ length: FORECAST_WINDOW_DAYS + 1 }, (_, index) => addDays(start, index));
}

export function isWithinForecastWindow(date: string, now: Date = new Date()): boolean {
  const start = todayInSeoul(now);
  return date >= start && date <= addDays(start, FORECAST_WINDOW_DAYS);
}

/**
 * 예측이 실제로 닿는 날의 범위 (#30 M3).
 *
 * 위의 `오늘 + 30일`은 프론트가 혼자 정한 창이고, 백엔드가 가진 창은 그보다 짧다.
 * 응답이 창을 말해 주면 그것을 쓰고, 말해 주지 않을 때만 30일로 되돌아간다 —
 * 고를 수 있다고 그려 놓고 조회에서 되돌리지 않기 위해서다.
 */
export interface SupportedWindow {
  from: string;
  to: string;
}

/**
 * 화면이 실제로 그릴 창.
 *
 * 시작은 오늘보다 이를 수 없다 — 응답의 창이 어제부터라도 지난 날을 고르게 하지
 * 않는다. 끝은 응답이 말하는 그대로 둔다.
 */
export function resolveWindow(
  supported: SupportedWindow | null | undefined,
  now: Date = new Date(),
): SupportedWindow {
  const today = todayInSeoul(now);
  if (!supported) return { from: today, to: addDays(today, FORECAST_WINDOW_DAYS) };

  const from = supported.from > today ? supported.from : today;
  // 시작이 끝을 넘어선 창은 창이 아니다. 하루짜리로 접어 빈 달력을 그리지 않는다.
  return { from, to: supported.to < from ? from : supported.to };
}

/** 창 안의 날을 하루씩 편다. 달력과 칩 열이 같은 목록을 쓴다. */
export function windowDates(window: SupportedWindow): string[] {
  const days: string[] = [];
  for (let day = window.from; day <= window.to; day = addDays(day, 1)) days.push(day);
  return days;
}

export function isWithinWindow(date: string, window: SupportedWindow): boolean {
  return date >= window.from && date <= window.to;
}

/**
 * `9월 24일`. 달력 날짜를 사람이 읽는 꼴로 (#30 M2).
 *
 * 화면에 `2026-09-24` 원문이 그대로 나오던 자리를 이 함수가 대신한다. 시간대를
 * 붙여 읽는 이유는, 날짜만 넘기면 UTC 자정으로 읽혀 한국에서 하루 밀리기 때문이다.
 */
export function formatCalendarDate(calendarDate: string): string {
  const parsed = new Date(`${calendarDate}T00:00:00+09:00`);
  if (Number.isNaN(parsed.getTime())) return calendarDate;
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(parsed);
}

/** `9월 21일 ~ 10월 19일`. 고를 수 있는 날을 숫자로 말한다 — `30일 안에서`가 아니라. */
export function windowLabel(window: SupportedWindow): string {
  return `${formatCalendarDate(window.from)} ~ ${formatCalendarDate(window.to)}`;
}

/** 캘린더 첫 줄을 요일에 맞춰 비우기 위한 빈칸 수 (일요일 시작). */
export function leadingBlankCount(calendarDate: string): number {
  const [year, month, day] = calendarDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function dayOfMonth(calendarDate: string): number {
  return Number(calendarDate.slice(8, 10));
}

export function monthLabel(calendarDate: string): string {
  const [year, month] = calendarDate.split("-").map(Number);
  return `${year}년 ${month}월`;
}

export function monthKey(calendarDate: string): string {
  return calendarDate.slice(0, 7);
}
