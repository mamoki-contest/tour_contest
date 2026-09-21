import { describe, expect, it } from "vitest";

import type { OnlineMention, Place } from "./contract";
import { isUnranked, unrankedBoundary } from "./unranked";

function place(name: string, mention: Partial<OnlineMention>): Place {
  return {
    placeId: name,
    name,
    photoUrl: null,
    address: null,
    coordinates: null,
    category: null,
    regionCenterRank: { value: null, status: "MISSING", source: null, observedAt: null },
    onlineMention: {
      status: "COLLECTED",
      count: null,
      collectedAt: null,
      ruleVersion: null,
      ...mention,
    },
    tmapRank: { status: "NOT_AVAILABLE", rank: null, period: null },
    visitorStats: { status: "NOT_REGISTERED", count: null, period: null, countStatus: null },
    forecast: {
      selectedDateLevel: null,
      quietDate: null,
      status: "MISSING",
      source: null,
      observedAt: null,
    },
  };
}

const collected = (count: number) => place(`언급 ${count}`, { status: "COLLECTED", count });
const ambiguous = (name: string) => place(name, { status: "AMBIGUOUS", count: null });

describe("온라인 언급 미산정 구역 (#27)", () => {
  it("정상 수집이 아니면 미산정이다", () => {
    expect(isUnranked(ambiguous("가"))).toBe(true);
    expect(isUnranked(place("나", { status: "UNAVAILABLE", count: null }))).toBe(true);
    expect(isUnranked(place("다", { status: "COLLECTION_FAILED", count: null }))).toBe(true);
  });

  it("0건은 미산정이 아니다 — 정상 수집의 정상 값이다", () => {
    expect(isUnranked(collected(0))).toBe(false);
  });

  it("정상 수집인데 값이 없으면 셀 수 없는 것으로 읽는다", () => {
    expect(isUnranked(place("라", { status: "COLLECTED", count: null }))).toBe(true);
  });

  it("미산정이 뒤쪽에 모여 있으면 그 자리가 경계다", () => {
    const places = [collected(90), collected(40), ambiguous("다"), ambiguous("라")];
    expect(unrankedBoundary(places)).toBe(2);
  });

  it("미산정이 없으면 경계도 없다", () => {
    expect(unrankedBoundary([collected(90), collected(40)])).toBeNull();
  });

  it("전부 미산정이면 첫 줄부터가 그 구역이다", () => {
    expect(unrankedBoundary([ambiguous("가"), ambiguous("나")])).toBe(0);
  });

  it("미산정이 중간에 섞여 있으면 선을 긋지 않는다 — 없는 구조를 지어내지 않는다", () => {
    expect(unrankedBoundary([collected(90), ambiguous("나"), collected(40)])).toBeNull();
  });

  it("빈 목록에는 경계가 없다", () => {
    expect(unrankedBoundary([])).toBeNull();
  });
});
