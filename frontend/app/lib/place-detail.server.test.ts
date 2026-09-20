import { describe, expect, it } from "vitest";

import { toParking } from "./place-detail.server";

/**
 * 입력은 로컬 백엔드(`/api/v1/attractions/…`)의 실제 응답 모양을 줄인 것이다 —
 * 경포해수욕장 128758(AVAILABLE) · 속초 동명항 129454(STATIC_ONLY) · 치악산 125587(NONE).
 */

describe("toParking", () => {
  it("실시간 주차장을 잔여면·등급·조회 시각·출처까지 옮긴다", () => {
    const parking = toParking({
      status: "AVAILABLE",
      dataStatus: "AVAILABLE",
      lots: [
        {
          name: "강문제2공영주차장",
          latitude: 37.7961674,
          longitude: 128.9160675,
          distanceMeters: 955,
          totalLots: 91,
          occupiedLots: 41,
          availableLots: 50,
          congestion: "PLENTY",
          observedAt: "2026-09-21T03:16:02.051604",
          source: "강릉시 교통정보 조회서비스",
        },
      ],
      observedAt: "2026-09-21T03:16:02.051604",
      source: "강릉시 교통정보 조회서비스 · 전국주차장정보표준데이터",
    });

    expect(parking.availability).toBe("AVAILABLE");
    expect(parking.status).toBe("OK");
    expect(parking.lots[0]).toEqual({
      name: "강문제2공영주차장",
      coordinates: { latitude: 37.7961674, longitude: 128.9160675 },
      distanceMeters: 955,
      totalLots: 91,
      availableLots: 50,
      congestion: "PLENTY",
      observedAt: "2026-09-21T03:16:02.051604",
      source: "강릉시 교통정보 조회서비스",
    });
  });

  it("AVAILABLE 묶음 안에도 규모만 아는 곳이 섞여 온다 — 잔여면을 묶음으로 판단하지 않는다", () => {
    const parking = toParking({
      status: "AVAILABLE",
      dataStatus: "AVAILABLE",
      lots: [
        { name: "강문제2공영주차장", totalLots: 91, availableLots: 50, congestion: "PLENTY" },
        { name: "해안로(창해로-경포생태길)", totalLots: 111, availableLots: null, congestion: null },
      ],
    });

    expect(parking.lots.map((lot) => lot.availableLots)).toEqual([50, null]);
  });

  it("STATIC_ONLY 는 총 주차면까지만 담고 잔여면을 만들지 않는다", () => {
    const parking = toParking({
      status: "STATIC_ONLY",
      dataStatus: "AVAILABLE",
      lots: [
        {
          name: "동명항 공영주차장",
          distanceMeters: 68,
          totalLots: 32,
          availableLots: null,
          congestion: null,
          observedAt: null,
          source: "전국주차장정보표준데이터",
        },
      ],
      observedAt: null,
      source: "전국주차장정보표준데이터",
    });

    expect(parking.availability).toBe("STATIC_ONLY");
    expect(parking.lots[0].totalLots).toBe(32);
    expect(parking.lots[0].availableLots).toBeNull();
    expect(parking.observedAt).toBeNull();
  });

  it("NONE 은 확인이 끝난 사실이다 — 목록이 비어도 NO_DATA 로 바뀌지 않는다", () => {
    const parking = toParking({
      status: "NONE",
      dataStatus: "AVAILABLE",
      lots: [],
      observedAt: null,
      source: "강릉시 교통정보 조회서비스 · 전국주차장정보표준데이터",
    });

    expect(parking.availability).toBe("NONE");
    expect(parking.lots).toEqual([]);
  });

  it("주차 정보가 통째로 없으면 NO_DATA 다 — NONE 으로 떨어뜨리지 않는다", () => {
    expect(toParking(null)).toEqual({
      availability: "NO_DATA",
      lots: [],
      status: "MISSING",
      source: null,
      observedAt: null,
    });
  });

  it("모르는 상태 이름도 NO_DATA 다 — 확인하지 못한 것을 없다고 말하지 않는다", () => {
    expect(toParking({ status: "SOMETHING_NEW", dataStatus: "AVAILABLE" }).availability).toBe(
      "NO_DATA",
    );
  });

  it("모르는 등급 이름을 기본 등급으로 떨어뜨리지 않는다", () => {
    const parking = toParking({
      status: "AVAILABLE",
      lots: [{ name: "새 등급", totalLots: 10, availableLots: 3, congestion: "SOMEWHAT_BUSY" }],
    });

    expect(parking.lots[0].congestion).toBeNull();
    expect(parking.lots[0].availableLots).toBe(3);
  });

  it("잔여면을 모르는 곳에 등급만 남기지 않는다 — 근거 없는 등급이 된다", () => {
    const parking = toParking({
      status: "STATIC_ONLY",
      lots: [{ name: "등급만 온 곳", totalLots: 10, availableLots: null, congestion: "PLENTY" }],
    });

    expect(parking.lots[0].congestion).toBeNull();
  });

  it("이름 없는 주차장은 뺀다 — 화면에서 가리킬 수가 없다", () => {
    const parking = toParking({
      status: "STATIC_ONLY",
      lots: [{ name: "  ", totalLots: 10 }, null, { name: "이름 있는 곳", totalLots: 20 }],
    });

    expect(parking.lots.map((lot) => lot.name)).toEqual(["이름 있는 곳"]);
  });

  it("좌표가 한쪽만 오면 좌표를 만들지 않는다", () => {
    const parking = toParking({
      status: "STATIC_ONLY",
      lots: [{ name: "위도만", latitude: 37.8, longitude: null }],
    });

    expect(parking.lots[0].coordinates).toBeNull();
  });

  it("갱신에 실패한 실시간 값은 STALE 로 남는다 — 방금 받은 값처럼 말하지 않는다", () => {
    expect(toParking({ status: "AVAILABLE", dataStatus: "STALE", lots: [] }).status).toBe("STALE");
  });
});
