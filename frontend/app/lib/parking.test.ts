import { describe, expect, it } from "vitest";

import type { ParkingLot } from "./contract";
import {
  CONGESTION_LABEL,
  MAX_STATIC_LOTS,
  formatDistance,
  formatRealtimeLot,
  formatStaticLot,
  splitParkingLots,
} from "./parking";

function lot(overrides: Partial<ParkingLot> & { name: string }): ParkingLot {
  return {
    coordinates: null,
    distanceMeters: null,
    totalLots: null,
    availableLots: null,
    congestion: null,
    observedAt: null,
    source: null,
    ...overrides,
  };
}

describe("splitParkingLots", () => {
  it("실시간을 아는 곳과 규모만 아는 곳을 가른다", () => {
    const split = splitParkingLots([
      lot({ name: "강문제2공영주차장", totalLots: 91, availableLots: 50, congestion: "PLENTY" }),
      lot({ name: "해안로", totalLots: 111 }),
    ]);

    expect(split.realtime.map((entry) => entry.name)).toEqual(["강문제2공영주차장"]);
    expect(split.staticLots.map((entry) => entry.name)).toEqual(["해안로"]);
    expect(split.hiddenStaticCount).toBe(0);
  });

  it("잔여 0면은 실시간이다 — 값이 없는 것과 자리가 없는 것은 다르다", () => {
    const split = splitParkingLots([
      lot({ name: "만차 주차장", totalLots: 40, availableLots: 0, congestion: "FULL" }),
    ]);

    expect(split.realtime).toHaveLength(1);
    expect(split.staticLots).toHaveLength(0);
  });

  it("실시간을 아는 곳은 몇 곳이든 전부 남긴다", () => {
    const lots = Array.from({ length: 5 }, (_, index) =>
      lot({ name: `실시간 ${index}`, totalLots: 10, availableLots: index }),
    );

    expect(splitParkingLots(lots).realtime).toHaveLength(5);
  });

  it("규모만 아는 곳은 앞쪽 몇 곳만 적고 나머지는 곳 수로만 센다", () => {
    // 경포해수욕장 실측: 여덟 곳 중 한 곳만 실시간이고 일곱 곳이 규모뿐이었다.
    const lots = [
      lot({ name: "강문제2공영주차장", totalLots: 91, availableLots: 50, congestion: "PLENTY" }),
      ...Array.from({ length: 7 }, (_, index) => lot({ name: `정적 ${index}`, totalLots: 100 })),
    ];

    const split = splitParkingLots(lots);

    expect(split.realtime).toHaveLength(1);
    expect(split.staticLots).toHaveLength(MAX_STATIC_LOTS);
    expect(split.hiddenStaticCount).toBe(7 - MAX_STATIC_LOTS);
  });

  it("빈 목록에서 더 있다는 말을 만들지 않는다", () => {
    expect(splitParkingLots([])).toEqual({ realtime: [], staticLots: [], hiddenStaticCount: 0 });
  });
});

describe("formatDistance", () => {
  it("거리를 모르면 아무 말도 만들지 않는다", () => {
    expect(formatDistance(null)).toBeNull();
  });

  it("반경 안은 미터로 적는다", () => {
    expect(formatDistance(955)).toBe("955m");
  });

  it("1km부터는 킬로미터로 접는다", () => {
    expect(formatDistance(1000)).toBe("1.0km");
  });
});

describe("formatRealtimeLot", () => {
  it("잔여면이 등급보다 앞에 온다 — 판단 근거는 자리 수다", () => {
    const line = formatRealtimeLot(
      lot({
        name: "강문제2공영주차장",
        distanceMeters: 955,
        totalLots: 91,
        availableLots: 50,
        congestion: "PLENTY",
      }),
    );

    expect(line).toBe("강문제2공영주차장 · 955m · 잔여 50면 / 총 91면");
  });

  it("총 주차면을 모르면 잔여면만 적는다 — 총면을 지어내지 않는다", () => {
    expect(formatRealtimeLot(lot({ name: "이름만 아는 곳", availableLots: 7 }))).toBe(
      "이름만 아는 곳 · 잔여 7면",
    );
  });
});

describe("formatStaticLot", () => {
  it("규모만 아는 곳은 총 주차면까지만 적는다", () => {
    expect(
      formatStaticLot(lot({ name: "동명항 공영주차장", distanceMeters: 68, totalLots: 32 })),
    ).toBe("동명항 공영주차장 · 68m · 총 32면");
  });

  it("어떤 줄에도 잔여면을 만들어 넣지 않는다", () => {
    expect(formatStaticLot(lot({ name: "영금정 공영주차장" }))).toBe("영금정 공영주차장");
  });
});

describe("CONGESTION_LABEL", () => {
  it("백엔드의 네 등급을 모두 부를 수 있다", () => {
    expect(CONGESTION_LABEL).toEqual({
      PLENTY: "여유",
      MODERATE: "보통",
      CROWDED: "혼잡",
      FULL: "만차",
    });
  });
});
