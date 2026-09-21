import { describe, expect, it } from "vitest";

import { formatObservedAtShort } from "./format";

const NOW = new Date("2026-09-21T09:00:00+09:00");

describe("formatObservedAtShort", () => {
  it("올해 안의 날짜면 연도를 떨어뜨린다", () => {
    expect(formatObservedAtShort("2026-03-19T09:49:59", NOW)).toBe("3월 19일 기준");
  });

  it("해가 다르면 연도를 남긴다 — 작년 9월을 올해 값으로 읽히게 두지 않는다", () => {
    expect(formatObservedAtShort("2025-09-11T10:39:42", NOW)).toBe("2025년 9월 11일 기준");
  });

  it("기준 시점이 없거나 깨져 있으면 없다고 쓴다 — 비워 두지 않는다", () => {
    expect(formatObservedAtShort(null, NOW)).toBe("기준 시점 없음");
    expect(formatObservedAtShort("어제", NOW)).toBe("기준 시점 없음");
  });

  it("공급자 이름을 붙이지 않는다 — 캡션에 남는 것은 기준 시점뿐이다", () => {
    expect(formatObservedAtShort("2026-03-19T09:49:59", NOW)).not.toContain("KorService2");
  });
});
