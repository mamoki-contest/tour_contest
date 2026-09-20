import { describe, expect, it } from "vitest";

import { toPlace } from "./backend.server";

/**
 * 입력은 로컬 백엔드(`GET /api/v1/attractions?sort=ONLINE_MENTION_DESC`)의 실제 응답을
 * 줄인 것이다 — 좋은사람커피 3535267(언급만) · 강릉 경포대(TMAP 5위) ·
 * 정동진역(입장객 2,734명 확정).
 *
 * 여기서 지키는 것은 하나다: **세 신호가 서로를 대신하지 않는다.** 하나가 없다고
 * 다른 하나를 끌어다 쓰지도, 없는 이유를 하나로 뭉개지도 않는다.
 */

function attraction(overrides: Record<string, unknown> = {}) {
  return { contentId: "3535267", name: "좋은사람커피", ...overrides };
}

describe("toPlace — 온라인 언급량", () => {
  it("정상 수집을 수치·수집 시각·규칙 버전까지 옮긴다", () => {
    const place = toPlace(
      attraction({
        onlineMention: {
          status: "COLLECTED",
          count: 374307,
          collectedAt: "2026-09-20T00:08:03.999702",
          ruleVersion: "name+sigungu",
          sortable: true,
        },
      }),
    );

    expect(place?.onlineMention).toEqual({
      status: "COLLECTED",
      count: 374307,
      collectedAt: "2026-09-20T00:08:03.999702",
      ruleVersion: "name+sigungu",
    });
  });

  it("0건도 정상 수집이다 — 없음으로 넘기지 않는다", () => {
    const place = toPlace(
      attraction({ onlineMention: { status: "COLLECTED", count: 0, collectedAt: null } }),
    );

    expect(place?.onlineMention.status).toBe("COLLECTED");
    expect(place?.onlineMention.count).toBe(0);
  });

  it.each([
    ["AMBIGUOUS", "AMBIGUOUS"],
    ["UNAVAILABLE", "UNAVAILABLE"],
    ["COLLECTION_FAILED", "COLLECTION_FAILED"],
  ])("%s 는 그대로 남고 수치는 없다 — 0으로 읽지 않는다", (given, expected) => {
    const place = toPlace(
      attraction({
        onlineMention: { status: given, count: null, collectedAt: "2026-09-20T00:00:00" },
      }),
    );

    expect(place?.onlineMention.status).toBe(expected);
    expect(place?.onlineMention.count).toBeNull();
  });

  it("수집됐다면서 수치가 없으면 수집하지 못한 것으로 읽는다", () => {
    const place = toPlace(attraction({ onlineMention: { status: "COLLECTED", count: null } }));

    expect(place?.onlineMention.status).toBe("COLLECTION_FAILED");
    expect(place?.onlineMention.count).toBeNull();
  });

  it("언급량 자체가 없는 응답은 미수집이다 — 정상 수집으로 낙관하지 않는다", () => {
    const place = toPlace(attraction());

    expect(place?.onlineMention.status).toBe("COLLECTION_FAILED");
    expect(place?.onlineMention.count).toBeNull();
  });
});

describe("toPlace — TMAP 검색순위", () => {
  it("수록된 장소의 순위와 조회기간을 옮긴다", () => {
    const place = toPlace(
      attraction({ tmapRank: { status: "AVAILABLE", rank: 5, period: "202508-202607" } }),
    );

    expect(place?.tmapRank).toEqual({ status: "AVAILABLE", rank: 5, period: "202508-202607" });
  });

  it("미수록은 순위를 만들지 않는다 — 0위도 꼴찌도 아니다", () => {
    const place = toPlace(
      attraction({ tmapRank: { status: "NOT_AVAILABLE", rank: null, period: null } }),
    );

    expect(place?.tmapRank).toEqual({ status: "NOT_AVAILABLE", rank: null, period: null });
  });

  it("언급량이 있어도 TMAP 결측을 그 값으로 메우지 않는다", () => {
    const place = toPlace(
      attraction({
        onlineMention: { status: "COLLECTED", count: 374307, collectedAt: "2026-09-20T00:00:00" },
        tmapRank: { status: "NOT_AVAILABLE", rank: null, period: null },
      }),
    );

    expect(place?.onlineMention.count).toBe(374307);
    expect(place?.tmapRank.rank).toBeNull();
  });
});

describe("toPlace — 입장객 통계", () => {
  it("공표월 집계를 잠정·확정까지 옮긴다", () => {
    const place = toPlace(
      attraction({
        visitorStats: {
          status: "AVAILABLE",
          count: 2734,
          period: "202512",
          countStatus: "CONFIRMED",
        },
      }),
    );

    expect(place?.visitorStats).toEqual({
      status: "AVAILABLE",
      count: 2734,
      period: "202512",
      countStatus: "CONFIRMED",
    });
  });

  it("잠정치를 확정치로 바꾸지 않는다", () => {
    const place = toPlace(
      attraction({
        visitorStats: {
          status: "AVAILABLE",
          count: 1924,
          period: "202603",
          countStatus: "PROVISIONAL",
        },
      }),
    );

    expect(place?.visitorStats.countStatus).toBe("PROVISIONAL");
  });

  it("미등록은 0명이 아니다", () => {
    const place = toPlace(
      attraction({
        visitorStats: { status: "NOT_REGISTERED", count: null, period: null, countStatus: null },
      }),
    );

    expect(place?.visitorStats.status).toBe("NOT_REGISTERED");
    expect(place?.visitorStats.count).toBeNull();
  });

  it("미적재와 미등록을 가른다 — 확인해 본 적 없는 것과 확인해 본 것은 다르다", () => {
    const place = toPlace(
      attraction({ visitorStats: { status: "NOT_IMPORTED", count: null, period: null } }),
    );

    expect(place?.visitorStats.status).toBe("NOT_IMPORTED");
  });

  it("모르는 상태는 미등록으로 읽되 수치를 만들지 않는다", () => {
    const place = toPlace(
      attraction({ visitorStats: { status: "???", count: 99, period: "202512" } }),
    );

    expect(place?.visitorStats).toEqual({
      status: "NOT_REGISTERED",
      count: null,
      period: null,
      countStatus: null,
    });
  });
});

describe("toPlace — 식별자", () => {
  it("식별자나 이름이 없으면 버린다", () => {
    expect(toPlace({ name: "이름만 있는 곳" })).toBeNull();
    expect(toPlace({ contentId: "123" })).toBeNull();
  });
});
