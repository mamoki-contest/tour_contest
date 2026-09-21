import { describe, expect, it } from "vitest";

import type { OnlineMention, TmapRank, VisitorStats } from "./contract";
import { mentionSignal, placeSignals, tmapSignal, visitorSignal } from "./place-signals";

function mention(overrides: Partial<OnlineMention> = {}): OnlineMention {
  return {
    status: "COLLECTED",
    count: 374649,
    collectedAt: "2026-09-20T00:08:03.999702",
    ruleVersion: "name+sigungu",
    ...overrides,
  };
}

function tmap(overrides: Partial<TmapRank> = {}): TmapRank {
  return { status: "AVAILABLE", rank: 1, period: "202508-202607", ...overrides };
}

function visitor(overrides: Partial<VisitorStats> = {}): VisitorStats {
  return {
    status: "AVAILABLE",
    count: 34769,
    period: "202512",
    countStatus: "CONFIRMED",
    ...overrides,
  };
}

describe("mentionSignal", () => {
  it("검색 결과 수와 수집 월을 적는다", () => {
    expect(mentionSignal(mention())).toEqual({
      kind: "value",
      value: "온라인 언급 374,649건",
      basis: "9월 기준",
    });
  });

  it("0건은 값이다 — 없음 배지로 넘기지 않는다", () => {
    expect(mentionSignal(mention({ count: 0 }))).toMatchObject({
      kind: "value",
      value: "온라인 언급 0건",
    });
  });

  it("수집 시각이 없으면 기준 시점을 지어내지 않는다", () => {
    expect(mentionSignal(mention({ collectedAt: null }))).toMatchObject({ basis: null });
  });

  it.each([
    ["AMBIGUOUS", "언급 판정 보류"],
    ["UNAVAILABLE", "언급 집계 대상 아님"],
    ["COLLECTION_FAILED", "언급 미수집"],
  ] as const)("%s 는 제 이유로 없다고 말한다", (status, label) => {
    expect(mentionSignal(mention({ status, count: null }))).toEqual({ kind: "no-data", label });
  });

  it("세 없음 상태의 문구가 서로 다르다", () => {
    const labels = (["AMBIGUOUS", "UNAVAILABLE", "COLLECTION_FAILED"] as const).map((status) => {
      const signal = mentionSignal(mention({ status, count: null }));
      return signal.kind === "no-data" ? signal.label : null;
    });

    expect(new Set(labels).size).toBe(3);
  });
});

describe("tmapSignal", () => {
  it("시·군 안의 순위임을 문구에 박고 조회기간을 붙인다", () => {
    expect(tmapSignal(tmap())).toEqual({
      kind: "value",
      value: "시·군 TMAP 검색 1위",
      basis: "2025.08~2026.07",
    });
  });

  it("미수록은 순위를 만들지 않는다", () => {
    expect(tmapSignal(tmap({ status: "NOT_AVAILABLE", rank: null, period: null }))).toEqual({
      kind: "no-data",
      label: "TMAP 미수록",
    });
  });

  it("조회기간 모양이 다르면 버린다 — 기간을 지어내지 않는다", () => {
    expect(tmapSignal(tmap({ period: "2025-08" }))).toMatchObject({ basis: null });
  });
});

describe("visitorSignal", () => {
  it("공표월과 확정 여부를 함께 적는다", () => {
    expect(visitorSignal(visitor())).toEqual({
      kind: "value",
      value: "입장객 34,769명",
      basis: "2025.12 (확정)",
    });
  });

  it("잠정치는 잠정이라고 적는다", () => {
    expect(visitorSignal(visitor({ countStatus: "PROVISIONAL" }))).toMatchObject({
      basis: "2025.12 (잠정)",
    });
  });

  it("잠정·확정을 모르면 공표월만 적는다", () => {
    expect(visitorSignal(visitor({ countStatus: null }))).toMatchObject({ basis: "2025.12" });
  });

  it.each([
    ["NOT_REGISTERED", "입장객 미집계"],
    ["NOT_IMPORTED", "입장객 정보 없음"],
  ] as const)("%s 는 0명이 아니라 제 문구로 없다고 말한다", (status, label) => {
    expect(
      visitorSignal(visitor({ status, count: null, period: null, countStatus: null })),
    ).toEqual({ kind: "no-data", label });
  });
});

describe("placeSignals", () => {
  it("셋을 고정 순서로, 각각 따로 내놓는다 — 합치지 않는다", () => {
    const signals = placeSignals({
      onlineMention: mention(),
      tmapRank: tmap({ status: "NOT_AVAILABLE", rank: null, period: null }),
      visitorStats: visitor(),
    });

    expect(signals.map((signal) => signal.key)).toEqual(["mention", "tmap", "visitor"]);
    expect(signals.map((signal) => signal.kind)).toEqual(["value", "no-data", "value"]);
  });

  it("셋 다 없어도 자리를 비우지 않는다", () => {
    const signals = placeSignals({
      onlineMention: mention({ status: "AMBIGUOUS", count: null }),
      tmapRank: tmap({ status: "NOT_AVAILABLE", rank: null, period: null }),
      visitorStats: visitor({
        status: "NOT_REGISTERED",
        count: null,
        period: null,
        countStatus: null,
      }),
    });

    expect(signals).toHaveLength(3);
    expect(signals.every((signal) => signal.kind === "no-data")).toBe(true);
  });
});
