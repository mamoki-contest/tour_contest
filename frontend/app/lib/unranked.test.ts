import { describe, expect, it } from "vitest";

import type { Place } from "./contract";
import { isUnranked, unrankedBoundary } from "./unranked";

function place(name: string, interest: number | null): Place {
  return {
    placeId: name,
    name,
    photoUrl: null,
    address: null,
    coordinates: null,
    category: null,
    regionCenterRank: { value: null, status: "MISSING", source: null, observedAt: null },
    interest: {
      value: interest,
      status: interest === null ? "MISSING" : "OK",
      source: null,
      observedAt: null,
    },
    forecast: { selectedDateLevel: null, quietDate: null, status: "MISSING", source: null, observedAt: null },
  };
}

describe("온라인 언급 미산정 구역 (#27)", () => {
  it("값이 없는 장소가 미산정이다 — 0은 값이 있는 것이다", () => {
    expect(isUnranked(place("가", null))).toBe(true);
    expect(isUnranked(place("나", 0))).toBe(false);
  });

  it("미산정이 뒤쪽에 모여 있으면 그 자리가 경계다", () => {
    const places = [place("가", 90), place("나", 40), place("다", null), place("라", null)];
    expect(unrankedBoundary(places)).toBe(2);
  });

  it("미산정이 없으면 경계도 없다", () => {
    expect(unrankedBoundary([place("가", 90), place("나", 40)])).toBeNull();
  });

  it("전부 미산정이면 첫 줄부터가 그 구역이다", () => {
    expect(unrankedBoundary([place("가", null), place("나", null)])).toBe(0);
  });

  it("미산정이 중간에 섞여 있으면 선을 긋지 않는다 — 없는 구조를 지어내지 않는다", () => {
    const places = [place("가", 90), place("나", null), place("다", 40)];
    expect(unrankedBoundary(places)).toBeNull();
  });

  it("빈 목록에는 경계가 없다", () => {
    expect(unrankedBoundary([])).toBeNull();
  });
});
