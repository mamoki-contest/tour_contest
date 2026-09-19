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
