import { describe, expect, it } from "vitest";

import { cardFacts } from "./card-facts";
import type { Place, PlaceForecastSummary } from "./contract";

function place(forecast: Partial<PlaceForecastSummary> = {}): Place {
  return {
    placeId: "P1",
    name: "주문진 해수욕장",
    photoUrl: "https://example.test/p1.jpg",
    address: "강원특별자치도 강릉시 주문진읍",
    coordinates: null,
    category: "레포츠",
    // 아래 넷은 정렬·상세가 쓰는 값이다. 카드가 이것들을 다시 집어 오지 않는지 본다.
    regionCenterRank: { value: 3, status: "OK", source: "제공처", observedAt: "2026-09-19" },
    onlineMention: {
      status: "COLLECTED",
      count: 374_649,
      collectedAt: "2026-09-01T00:00:00+09:00",
      ruleVersion: "v1",
    },
    tmapRank: { status: "AVAILABLE", rank: 2, period: "202508-202607" },
    visitorStats: { status: "AVAILABLE", count: 12_345, period: "202512", countStatus: "PROVISIONAL" },
    forecast: {
      selectedDateLevel: null,
      quietDate: null,
      status: "OK",
      source: null,
      observedAt: null,
      ...forecast,
    },
  };
}

describe("cardFacts — 카드가 내놓는 것 (#49)", () => {
  it("카드의 사실은 다섯 자리뿐이다 — 신호가 되돌아오면 여기서 깨진다", () => {
    expect(Object.keys(cardFacts(place(), "FLEXIBLE")).sort()).toEqual([
      "address",
      "category",
      "dateBadge",
      "name",
      "photoUrl",
    ]);
  });

  it("이름·주소·분류·사진은 그대로 옮긴다", () => {
    const facts = cardFacts(place(), "FLEXIBLE");

    expect(facts.name).toBe("주문진 해수욕장");
    expect(facts.address).toBe("강원특별자치도 강릉시 주문진읍");
    expect(facts.category).toBe("레포츠");
    expect(facts.photoUrl).toBe("https://example.test/p1.jpg");
  });

  it("없는 값을 문구로 메우지 않는다 — 무엇을 적을지는 화면이 정한다", () => {
    const bare = { ...place(), photoUrl: null, address: null, category: null };
    const facts = cardFacts(bare, "FLEXIBLE");

    expect(facts.photoUrl).toBeNull();
    expect(facts.address).toBeNull();
    expect(facts.category).toBeNull();
  });
});

describe("cardFacts — 날짜 배지 (#49 예외)", () => {
  it("확정 모드 · 예측 있음 → 그 날의 수준", () => {
    const facts = cardFacts(place({ selectedDateLevel: "BUSY" }), "FIXED");

    expect(facts.dateBadge).toEqual({ kind: "LEVEL", level: "BUSY" });
  });

  it("확정 모드 · 예측 없음 → 배지 없음 (`예측 정보 없음`도 그리지 않는다)", () => {
    expect(cardFacts(place(), "FIXED").dateBadge).toBeNull();
  });

  it("확정 모드는 한산 예상일을 대신 쓰지 않는다 — 고른 날짜가 아닌 날의 이야기다", () => {
    const facts = cardFacts(place({ quietDate: "2026-09-24" }), "FIXED");

    expect(facts.dateBadge).toBeNull();
  });

  it("유연 모드 · 한산 예상일 있음 → 그 날짜", () => {
    const facts = cardFacts(place({ quietDate: "2026-09-24" }), "FLEXIBLE");

    expect(facts.dateBadge).toEqual({ kind: "QUIET_DATE", date: "2026-09-24" });
  });

  it("유연 모드 · 한산 예상일 없음 → 배지 없음", () => {
    expect(cardFacts(place(), "FLEXIBLE").dateBadge).toBeNull();
  });

  it("유연 모드는 선택일 수준을 쓰지 않는다 — 고른 날짜가 없는 모드다", () => {
    const facts = cardFacts(place({ selectedDateLevel: "QUIET" }), "FLEXIBLE");

    expect(facts.dateBadge).toBeNull();
  });

  it("낡은 예측도 같은 배지다 — 카드는 낡았다는 사실을 더 적지 않는다 (#49)", () => {
    const fresh = cardFacts(place({ selectedDateLevel: "QUIET", status: "OK" }), "FIXED");
    const stale = cardFacts(place({ selectedDateLevel: "QUIET", status: "STALE" }), "FIXED");

    expect(stale.dateBadge).toEqual(fresh.dateBadge);
  });
});
