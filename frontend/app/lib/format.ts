/**
 * 앞 낱말의 받침 유무로 조사를 고른다.
 *
 * 데이터 이름이 값에서 오기 때문에(`지도`·`관광지 목록`) 조사를 고정하면 반드시 어긋난다
 * — `지도을`처럼. 한글 음절은 (코드 - 0xAC00) % 28 이 0이 아니면 받침이 있다.
 */
export function withParticle(word: string, withFinal: string, withoutFinal: string): string {
  const last = word.trim().at(-1);
  if (!last) return word;

  const code = last.charCodeAt(0);
  const isHangulSyllable = code >= 0xac00 && code <= 0xd7a3;
  // 한글이 아니면(숫자·영문) 받침을 판정할 수 없다. 더 흔한 쪽으로 붙인다.
  if (!isHangulSyllable) return `${word}${withoutFinal}`;

  return `${word}${(code - 0xac00) % 28 !== 0 ? withFinal : withoutFinal}`;
}

/** 기준 시점을 캡션 문구로 옮긴다. 값이 없으면 없다고 쓴다 — 비워 두지 않는다. */
export function formatObservedAt(observedAt: string | null): string {
  if (!observedAt) return "기준 시점 없음";
  const parsed = new Date(observedAt);
  if (Number.isNaN(parsed.getTime())) return "기준 시점 없음";
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  });
  return `${formatter.format(parsed)} 기준`;
}

/** 출처와 기준 시점을 한 줄로 묶는다. 이 캡션 없이는 어떤 값도 화면에 올리지 않는다. */
export function formatSourceCaption(source: string | null, observedAt: string | null): string {
  return [source ?? "출처 없음", formatObservedAt(observedAt)].join(" · ");
}

/**
 * 좁은 자리의 기준 시점 — `3월 19일 기준`.
 *
 * 카드 캡션에서 공급자 이름을 걷어낸 자리(#35)에 남는 한 줄이다. 올해 안의 날짜면
 * 연도를 떨어뜨리고, **해가 다르면 연도를 남긴다** — 작년 9월을 `9월 기준`으로 적으면
 * 올해 값으로 읽힌다. 기준 시점을 줄이는 것과 틀리게 적는 것은 다른 일이다.
 */
export function formatObservedAtShort(observedAt: string | null, now: Date = new Date()): string {
  if (!observedAt) return "기준 시점 없음";
  const parsed = new Date(observedAt);
  if (Number.isNaN(parsed.getTime())) return "기준 시점 없음";

  const year = (date: Date) =>
    new Intl.DateTimeFormat("ko-KR", { year: "numeric", timeZone: "Asia/Seoul" }).format(date);

  const formatter = new Intl.DateTimeFormat("ko-KR", {
    ...(year(parsed) === year(now) ? {} : { year: "numeric" }),
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  });
  return `${formatter.format(parsed)} 기준`;
}

/**
 * 방문 규모의 기준 기간을 캡션 한 줄로 옮긴다.
 *
 * 공급자가 최근 데이터를 바로 공개하지 않아 이 기간은 오늘과 한 달 가까이 떨어져
 * 있다. 그래서 기간을 숨기지 않는다 — 언제를 센 값인지가 값만큼 중요하다.
 */
export function formatVisitPeriod(start: string | null, end: string | null): string | null {
  if (!start || !end) return null;
  return `${start.replaceAll("-", ".")} ~ ${end.replaceAll("-", ".")} 기준`;
}

/**
 * 같은 기간을 좁은 자리에 넣는 짧은 꼴 — `2026.08.16 ~ 08.22 기준`.
 *
 * 지도 범례는 지도 위에 얹히고 데스크톱에서는 목록 컬럼 옆에 좁게 선다. 한 주 안의
 * 기간이라 뒤쪽 연도는 앞과 늘 같으므로, 같을 때만 떨어뜨려 줄을 아낀다.
 */
export function formatVisitPeriodShort(start: string | null, end: string | null): string | null {
  if (!start || !end) return null;
  const from = start.replaceAll("-", ".");
  const to = end.replaceAll("-", ".");
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  return `${from} ~ ${sameYear ? to.slice(5) : to} 기준`;
}
