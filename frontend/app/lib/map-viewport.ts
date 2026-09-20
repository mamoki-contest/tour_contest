import type { MapBounds } from "./explore-params";

/**
 * 지도 뷰포트 계산 (슬라이스 #3).
 *
 * 지도 SDK를 모르는 순수 함수만 둔다 — 시트가 가리는 만큼을 잘라낸 사각형, 좌표
 * 묶음을 감싸는 경계, 경계의 정규화. SDK 객체(`kakao.maps.Map`)를 받는 코드는
 * `map-view.tsx` 에 남기고, 여기서는 숫자만 다룬다. 지도 없이도 검증할 수 있게
 * 떼어 두는 것이 목적이다.
 */

/** 위·경도 한 점. SDK 타입에 기대지 않으려고 따로 둔다. */
export interface LatLngLiteral {
  lat: number;
  lng: number;
}

/** 지도 컨테이너 안의 사각형 (CSS 픽셀, 왼쪽 위가 원점). */
export interface ContainerRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** 모바일에서 바텀시트가 지도 아래쪽을 덮는 비율 (중간 스냅 55%). */
export const SHEET_COVER_RATIO = 0.55;

/**
 * 시트가 지도 아래쪽을 덮는 높이(px).
 *
 * 데스크톱에서는 시트가 옆 컬럼이라 지도를 가리지 않는다 — 덮는 높이는 0이다.
 * 이 값은 두 곳에 함께 쓰인다: 처음 경계를 맞출 때의 아래 여백, 그리고 `이 지도
 * 영역에서 검색`이 잘라낼 높이. 두 곳이 같은 수를 써야 보이는 것과 조회 범위가
 * 어긋나지 않는다.
 */
export function sheetCoverHeight(viewportHeight: number, isDesktop: boolean): number {
  if (isDesktop) return 0;
  if (!Number.isFinite(viewportHeight) || viewportHeight <= 0) return 0;
  return Math.round(viewportHeight * SHEET_COVER_RATIO);
}

/**
 * 시트에 가리지 않는 — 사용자가 실제로 본 — 컨테이너 사각형.
 *
 * 덮는 높이가 컨테이너보다 크면(아주 낮은 화면) 사각형이 뒤집힌다. 그럴 때는
 * 자르지 않고 컨테이너 전체를 돌려준다 — 높이 0짜리 경계로 조회하는 것보다
 * 넓게 조회하는 편이 덜 틀린다.
 */
export function visibleContainerRect(
  width: number,
  height: number,
  coverHeight: number,
): ContainerRect {
  const full: ContainerRect = { left: 0, top: 0, right: width, bottom: height };
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return full;
  }
  const bottom = height - Math.max(0, coverHeight);
  // 남는 높이가 너무 얇으면 자르지 않는다.
  if (bottom < height * 0.15) return full;
  return { left: 0, top: 0, right: width, bottom };
}

/** 두 모서리를 남서·북동으로 정규화한다 — 어느 쪽을 먼저 줘도 같은 경계가 나온다. */
export function boundsFromCorners(a: LatLngLiteral, b: LatLngLiteral): MapBounds {
  return {
    swLat: Math.min(a.lat, b.lat),
    swLng: Math.min(a.lng, b.lng),
    neLat: Math.max(a.lat, b.lat),
    neLng: Math.max(a.lng, b.lng),
  };
}
