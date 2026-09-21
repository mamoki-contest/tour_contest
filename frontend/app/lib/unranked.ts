import type { Place } from "./contract";

/**
 * 온라인 언급 미산정 구역의 경계 (#27, WIREFRAME U17 · D7).
 *
 * 백엔드는 정렬할 때 미산정(이름이 모호해 집계 불가·수집 실패·집계 대상 아님) 항목을
 * 뒤쪽에 이름순으로 모아 준다. 프론트가 그 경계를 그리지 않으면 마지막 쪽에서 **정상
 * 순위의 꼴찌처럼** 보인다 — 미산정은 낮은 언급량이 아니다 (PRD v4 §신호 결합).
 */

/**
 * 정렬에 들어가지 못한 장소인지.
 *
 * **0건은 미산정이 아니다.** `COLLECTED` 로 0건을 센 것은 정상 수집의 정상 값이고,
 * 그것까지 구역 아래로 내리면 확인된 사실을 확인하지 못한 것으로 바꾸는 셈이 된다.
 */
export function isUnranked(place: Place): boolean {
  const mention = place.onlineMention;
  return mention.status !== "COLLECTED" || mention.count === null;
}

/**
 * 미산정 구역이 시작하는 자리. 구역이 없으면 null.
 *
 * **뒤가 전부 미산정일 때만** 경계로 인정한다. 중간에 섞여 있다면 그것은 우리가
 * 아는 경계가 아니라 받은 순서일 뿐이고, 거기에 선을 그으면 없는 구조를 지어내는
 * 셈이 된다. 그럴 때는 선을 그리지 않는다.
 */
export function unrankedBoundary(places: Place[]): number | null {
  const first = places.findIndex(isUnranked);
  if (first === -1) return null;
  return places.slice(first).every(isUnranked) ? first : null;
}
