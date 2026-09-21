import { describe, expect, it } from "vitest";

import { boundsFromCorners, boundsOfPoints, sheetCoverHeight, visibleContainerRect } from "./map-viewport";

/**
 * 화면의 사각형은 위·경도에서는 사각형이 아니다 (#48, 실 SDK 검증에서 드러남).
 *
 * 카카오맵은 127°E 를 중심으로 한 횡축 메르카토르라, 중앙 자오선에서 멀어질수록
 * 화면의 `위` 가 정북에서 기울어진다. 강릉(128.8°E · 확대 단계 10) 에서 실제로 잰
 * 네 모서리가 아래 값이다 — 왼쪽 위가 오른쪽 위보다 0.0132°(약 1.46km) 북쪽이다.
 *
 * 마주 보는 두 모서리만 쓰면 그 띠가 조회 범위 밖으로 떨어져, **화면에 보이는데
 * 목록에 없는** 장소가 생긴다. 네 모서리를 다 감싸야 한다.
 */
const GANGNEUNG_CORNERS = [
  { lat: 37.95908, lng: 128.62318 }, // 왼쪽 위
  { lat: 37.94590, lng: 129.05512 }, // 오른쪽 위 — 왼쪽 위보다 남쪽
  { lat: 37.70710, lng: 128.62289 }, // 왼쪽 아래
  { lat: 37.69392, lng: 129.05483 }, // 오른쪽 아래
];

describe("보이는 범위의 경계 (#48)", () => {
  it("네 모서리를 전부 감싼다 — 기울어진 사각형이라도", () => {
    const bounds = boundsOfPoints(GANGNEUNG_CORNERS, 0)!;

    for (const corner of GANGNEUNG_CORNERS) {
      expect(corner.lat).toBeGreaterThanOrEqual(bounds.swLat);
      expect(corner.lat).toBeLessThanOrEqual(bounds.neLat);
      expect(corner.lng).toBeGreaterThanOrEqual(bounds.swLng);
      expect(corner.lng).toBeLessThanOrEqual(bounds.neLng);
    }
  });

  it("마주 보는 두 모서리만 쓰면 나머지 둘이 밖으로 떨어진다 — 그래서 넷을 다 본다", () => {
    const [topLeft, topRight, bottomLeft] = GANGNEUNG_CORNERS;
    const twoCorners = boundsFromCorners(bottomLeft, topRight);

    // 왼쪽 위가 북쪽 경계 밖이다 — 화면에는 보이는데 조회 범위에는 없다.
    expect(topLeft.lat).toBeGreaterThan(twoCorners.neLat);
    // 네 모서리를 보면 들어온다.
    expect(topLeft.lat).toBeLessThanOrEqual(boundsOfPoints(GANGNEUNG_CORNERS, 0)!.neLat);
  });

  it("최소 폭으로 넓히지 않는다 — 본 그대로가 조회 범위다", () => {
    const point = { lat: 37.8, lng: 128.9 };

    expect(boundsOfPoints([point], 0)).toEqual({
      swLat: 37.8,
      swLng: 128.9,
      neLat: 37.8,
      neLng: 128.9,
    });
  });
});

/**
 * 시트가 덮은 아래쪽은 조회 범위가 아니다 — 한 번도 보인 적 없는 곳이다.
 *
 * 실 SDK 로 재 보니 강릉 · 확대 단계 10 에서 컨테이너 전체와 보이는 영역의 남쪽
 * 경계가 **약 36km** 차이 났다. 잘라내지 않으면 그만큼이 조회 범위에 들어간다.
 */
describe("시트가 덮은 만큼 잘라내기", () => {
  it("모바일에서는 화면 높이의 55%를 덮는다", () => {
    expect(sheetCoverHeight(511, false)).toBe(281);
  });

  it("데스크톱에서는 시트가 옆 컬럼이라 덮지 않는다", () => {
    expect(sheetCoverHeight(511, true)).toBe(0);
  });

  it("덮은 만큼 아래를 잘라낸다", () => {
    expect(visibleContainerRect(577, 511, 281)).toEqual({
      left: 0,
      top: 0,
      right: 577,
      bottom: 230,
    });
  });

  it("남는 높이가 너무 얇으면 자르지 않는다 — 높이 0 짜리 경계로 조회하지 않는다", () => {
    expect(visibleContainerRect(577, 511, 500)).toEqual({
      left: 0,
      top: 0,
      right: 577,
      bottom: 511,
    });
  });
});
