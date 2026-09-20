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
