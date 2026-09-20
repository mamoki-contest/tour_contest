import { describe, expect, it } from "vitest";

import {
  formatAge,
  formatBaselineCaption,
  formatStaleCaption,
  formatStatusCaption,
  isStale,
} from "./data-status";

const now = new Date("2026-09-21T12:00:00+09:00");

describe("데이터 상태 문구 (#21 · #35)", () => {
  it("STALE만 최종 정상 데이터다", () => {
    expect(isStale("STALE")).toBe(true);
    expect(isStale("OK")).toBe(false);
    expect(isStale("MISSING")).toBe(false);
    expect(isStale(null)).toBe(false);
  });

  it("얼마나 지난 값인지 말한다", () => {
    expect(formatAge("2026-09-21T09:00:00+09:00", now)).toBe("3시간 전");
    expect(formatAge("2026-09-19T12:00:00+09:00", now)).toBe("2일 전");
    expect(formatAge("2026-09-21T11:40:00+09:00", now)).toBe("방금 전");
  });

  it("서버 시계가 앞서 있어도 미래를 `-1시간 전`으로 적지 않는다", () => {
    expect(formatAge("2026-09-21T13:00:00+09:00", now)).toBe("방금 전");
  });

  it("시점을 모르면 얼마나 지났는지도 모른다", () => {
    expect(formatAge(null, now)).toBeNull();
    expect(formatAge("깨진 값", now)).toBeNull();
  });

  it("STALE 캡션은 낡았다는 사실을 기준 시점보다 먼저 말한다", () => {
    expect(formatStaleCaption("2026-09-21T09:00:00+09:00", now)).toBe("최근 저장된 정보 · 3시간 전 기준");
    expect(formatStaleCaption(null, now)).toBe("최근 저장된 정보");
  });

  it("기준 시점 캡션에는 공급자 이름이 없다 (#35)", () => {
    expect(formatBaselineCaption("2026-09-21T09:00:00+09:00", now)).toBe("9월 21일 기준");
  });

  it("해를 넘긴 기준 시점은 연도까지 말한다", () => {
    expect(formatBaselineCaption("2025-01-22T15:25:11+09:00", now)).toBe("2025년 1월 22일 기준");
  });

  it("시점을 모르면 줄을 만들지 않는다", () => {
    expect(formatBaselineCaption(null, now)).toBeNull();
    expect(formatStatusCaption("OK", null, now)).toBeNull();
  });

  it("NO_DATA(MISSING)와 STALE은 다른 문구다", () => {
    const observedAt = "2026-09-21T09:00:00+09:00";
    expect(formatStatusCaption("STALE", observedAt, now)).toBe("최근 저장된 정보 · 3시간 전 기준");
    expect(formatStatusCaption("MISSING", observedAt, now)).toBe("9월 21일 기준");
  });
});
