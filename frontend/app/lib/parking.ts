import type { ParkingCongestion, ParkingLot } from "./contract";

/**
 * 주차 여건을 화면에 올리기 전에 정리하는 규칙 (슬라이스 #8).
 *
 * 두 공급자가 겹쳐 오기 때문에 한 관광지의 주차장 목록에는 **실시간을 아는 곳과
 * 규모만 아는 곳이 섞여** 있다. 둘을 같은 줄 모양으로 늘어놓으면 잔여면이 없는 곳이
 * `0면`처럼 읽히므로, 화면에 올리기 전에 여기서 갈라 둔다.
 */

/**
 * 등급 이름.
 *
 * **점이 아니라 글자로 말한다.** 초록·주황·빨강 점은 도로 소통의 관습 문법이고
 * (`road-status-dot-*`), 그 색을 주차에 빌려 오면 두 신호가 한 덩어리로 읽힌다.
 * DESIGN.md 의 road-status 규칙도 `주차는 잔여면 숫자`라고 못 박는다.
 */
export const CONGESTION_LABEL: Record<ParkingCongestion, string> = {
  PLENTY: "여유",
  MODERATE: "보통",
  CROWDED: "혼잡",
  FULL: "만차",
};

/**
 * 자리 수를 그대로 적는 `규모만 아는` 주차장의 최대 수.
 *
 * 반경 1km 안에서 여덟 곳까지 오는데, 모바일 한 화면에서 여덟 줄이면 이 섹션이
 * 상세 전체를 삼킨다. 실시간을 아는 곳은 몇 곳이든 전부 적고, 나머지는 곳 수만 센다
 * — 실시간 값은 하나도 잃지 않는다.
 */
export const MAX_STATIC_LOTS = 3;

export interface ParkingLotSplit {
  /** 실시간 잔여면을 아는 곳. 전부 그대로 적는다. */
  realtime: ParkingLot[];
  /** 규모만 아는 곳 중 화면에 적을 앞쪽 몇 곳. 백엔드가 이미 가까운 순으로 준다. */
  staticLots: ParkingLot[];
  /** 적지 않고 곳 수로만 세는 나머지. 0이면 더 있다는 말을 하지 않는다. */
  hiddenStaticCount: number;
}

/**
 * 주차장 목록을 실시간을 아는 곳과 규모만 아는 곳으로 가른다.
 *
 * 가르는 기준은 묶음의 `availability` 가 아니라 **각 주차장의 `availableLots`** 다.
 * 묶음이 `AVAILABLE` 이어도 그 안의 대부분은 규모만 아는 곳일 수 있다.
 */
export function splitParkingLots(lots: ParkingLot[]): ParkingLotSplit {
  const realtime = lots.filter((lot) => lot.availableLots !== null);
  const rest = lots.filter((lot) => lot.availableLots === null);

  return {
    realtime,
    staticLots: rest.slice(0, MAX_STATIC_LOTS),
    hiddenStaticCount: Math.max(0, rest.length - MAX_STATIC_LOTS),
  };
}

/** 거리를 읽을 수 있는 단위로. 반경이 1km라 대부분 m로 남는다. */
export function formatDistance(meters: number | null): string | null {
  if (meters === null) return null;
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${Math.round(meters)}m`;
}

/**
 * 실시간을 아는 주차장 한 줄.
 *
 * **잔여면이 등급보다 앞에 온다.** 등급은 잔여 비율을 요약한 말일 뿐이고, 판단
 * 근거는 자리 수다 — 도로에서 등급 옆에 늘 원래 속도를 두는 것과 같은 이유다.
 */
export function formatRealtimeLot(lot: ParkingLot): string {
  const distance = formatDistance(lot.distanceMeters);
  const capacity = lot.totalLots !== null ? ` / 총 ${lot.totalLots}면` : "";

  return [lot.name, distance, `잔여 ${lot.availableLots}면${capacity}`]
    .filter((part): part is string => part !== null)
    .join(" · ");
}

/** 규모만 아는 주차장 한 줄. 잔여면 자리를 비워 두지 않고 없다고 쓴다. */
export function formatStaticLot(lot: ParkingLot): string {
  const distance = formatDistance(lot.distanceMeters);
  const capacity = lot.totalLots !== null ? `총 ${lot.totalLots}면` : null;

  return [lot.name, distance, capacity].filter((part): part is string => part !== null).join(" · ");
}
