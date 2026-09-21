/**
 * 목록을 다시 불러오는 중인지 판정한다 (#20).
 *
 * 조건 변경은 전부 `<Link>`·`navigate()` 라 `useRevalidator()` 를 건드리지 않는다.
 * 그래서 재검증 상태만 보면 사용자가 겪는 **모든** 조건 변경에서 로딩 표시가 켜지지
 * 않는다. 여기서는 내비게이션도 함께 보되, 목록 조회 조건이 실제로 바뀐 이동만
 * 로딩으로 친다 — 시트를 열고 닫거나 지도를 민 것까지 스켈레톤으로 덮으면
 * 읽고 있던 목록이 이유 없이 사라진다.
 */

/**
 * 목록 조회를 다시 하게 만드는 조건들.
 *
 * `page` 는 일부러 뺐다. `더 보기` 는 이미 읽고 있는 목록을 늘리는 동작이라,
 * 그 자리를 스켈레톤으로 덮으면 읽던 줄을 잃는다 — 버튼 자신이 진행 중임을 말한다.
 */
export const LIST_QUERY_KEYS = ["region", "bbox", "theme", "q", "dateMode", "date", "sort"] as const;

/** 조회 조건만 뽑아 한 줄로 만든다. 두 주소의 이 줄이 같으면 같은 목록이다. */
export function listQuerySignature(search: string): string {
  const params = new URLSearchParams(search);
  return LIST_QUERY_KEYS.map((key) => `${key}=${params.get(key) ?? ""}`).join("&");
}

/**
 * 지금 진행 중인 이동이 **목록을 바꾸는** 이동인지.
 *
 * 경로가 다르면(상세로 들어가는 길) 목록 스켈레톤을 띄우지 않는다 — 떠나는 화면을
 * 로딩으로 만들 이유가 없다.
 */
export function isListQueryNavigation(
  current: { pathname: string; search: string },
  next: { pathname: string; search: string } | null | undefined,
): boolean {
  if (!next) return false;
  if (next.pathname !== current.pathname) return false;
  return listQuerySignature(next.search) !== listQuerySignature(current.search);
}

/**
 * 지도를 움직여서 일어난 이동인지 (#48).
 *
 * 조회 조건은 분명히 바뀌었다 — 그래서 `isListQueryNavigation` 은 참이다. 그런데도
 * 스켈레톤으로 덮지 않는다. 지도를 미는 동안 목록이 400ms 마다 세 장의 회색 카드로
 * 바뀌었다 사라지면, 사용자는 방금 무엇을 보고 있었는지 잃는다. 이전 목록을 그대로
 * 두고 헤더의 `N곳` 이 갱신되는 것으로 바뀌었음을 말한다.
 *
 * 시·군이 함께 풀리는 것도 지도 이동의 일부다 — 지도 범위가 시·군을 이기는 순간이
 * 곧 이 이동이므로, `region` 이 사라진 것만으로 다른 종류의 이동이 되지는 않는다.
 * 반대로 **새 `region` 이 붙은 이동**은 시·군을 고른 것이므로 여기 들지 않는다.
 */
export function isMapMoveNavigation(
  current: { pathname: string; search: string },
  next: { pathname: string; search: string } | null | undefined,
): boolean {
  if (!next) return false;
  if (next.pathname !== current.pathname) return false;

  const from = new URLSearchParams(current.search);
  const to = new URLSearchParams(next.search);

  const nextBounds = to.get("bbox");
  // 지도 범위로 **들어가는** 이동만 센다. 범위가 그대로면 지도가 움직인 것이 아니다.
  if (!nextBounds || nextBounds === from.get("bbox")) return false;
  // 지도 범위와 시·군은 함께 서지 않는다 — 둘 다 있으면 지도 이동이 아니다.
  if (to.get("region")) return false;

  return LIST_QUERY_KEYS.every(
    (key) =>
      key === "bbox" || key === "region" || (to.get(key) ?? "") === (from.get(key) ?? ""),
  );
}

/** `더 보기` 가 부른 이동인지 — 조건은 그대로고 쪽만 늘어난 경우다. */
export function isPageNavigation(
  current: { pathname: string; search: string },
  next: { pathname: string; search: string } | null | undefined,
): boolean {
  if (!next) return false;
  if (next.pathname !== current.pathname) return false;
  if (listQuerySignature(next.search) !== listQuerySignature(current.search)) return false;
  return new URLSearchParams(next.search).get("page") !== new URLSearchParams(current.search).get("page");
}
