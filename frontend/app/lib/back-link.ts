import { DEFAULT_EXPLORE_STATE, toSearchParams, type ExploreState } from "./explore-params";

/**
 * 상세의 `← 뒤로` 비상구 (WIREFRAME U9 · H3).
 *
 * `<Link to={-1}>` 하나로는 두 가지를 동시에 만족시킬 수 없다. 히스토리 뒤로가기는
 * **렌더할 주소가 없어서** href 가 현재 경로로 남고, 그러면 가운데 클릭·새 탭·링크
 * 복사·JS가 없는 첫 페인트가 전부 제자리를 가리킨다. 그래서 여기서 둘을 갈라 둔다
 * — href 는 언제나 앱 안의 실제 주소, 히스토리는 클릭에서만.
 */

/**
 * 카드가 상세로 가는 주소 — **지금 걸린 탐색 조건을 함께 들고 간다** (#42).
 *
 * 전에는 카드가 쿼리 없이 `/places/:id` 로 갔다. 그러면 상세에 조건이 없으니
 * `backHref` 가 언제나 `/` 를 내놨고, 위에 적어 둔 `href 와 클릭을 가른다`는 장치가
 * 통째로 헛돌았다 — 클릭만 `navigate(-1)` 로 제자리를 찾고, 새 탭·가운데 클릭·링크
 * 복사·JS 없는 첫 페인트는 전부 조건이 풀린 탐색 홈으로 떨어졌다.
 *
 * 화면 상태(`sheet`·`snap`)는 빼고 조회 조건만 넘긴다. 열려 있던 시트와 시트 높이는
 * 탐색 홈의 사정이라 상세가 들고 다닐 이유가 없고, 상세에서 도움말을 열면 그 자리에
 * 다른 `sheet` 값이 들어온다.
 */
export function exploreDetailHref(placeId: string, state: ExploreState): string {
  const params = toSearchParams({ ...state, sheet: null, snap: DEFAULT_EXPLORE_STATE.snap });
  const query = params.toString();
  const path = `/places/${encodeURIComponent(placeId)}`;
  return query ? `${path}?${query}` : path;
}

/**
 * 어디서 온 카드인지 적는 자리. 탐색 조건이 아니므로 `ExploreState` 에 넣지 않는다 —
 * 조건 칩이 말할 것이 없고, 조회에도 쓰이지 않는다.
 */
const ORIGIN_PARAM = "from";
const SAVED_ORIGIN = "saved";

/**
 * 나만의 지도에서 상세로 가는 주소 (#42).
 *
 * 저장 목록에는 탐색 조건이 없다. 조건 없는 쿼리를 넘기면 `backHref` 가 탐색 홈을
 * 가리키는데, 사용자가 온 곳은 저장 목록이다 — 돌아갈 자리를 적어 둔다.
 */
export function savedDetailHref(placeId: string): string {
  return `/places/${encodeURIComponent(placeId)}?${ORIGIN_PARAM}=${SAVED_ORIGIN}`;
}

/**
 * 뒤로 링크가 렌더할 href.
 *
 * 탐색 조건을 쥐고 있는 쿼리는 그대로 들고 돌아간다. 상세에서 뒤로 왔을 때 지도
 * 위치·필터가 초기화되면 탐색이 통째로 무너진다 (U6). 쿼리가 없으면 탐색 홈이다.
 *
 * 두 가지만 걸러 낸다. 저장 목록에서 왔다는 표시(`from`)는 **주소가 아니라 방향**이라
 * 탐색 홈의 쿼리로 넘기지 않고, 상세에서 연 도움말(`sheet`)은 돌아갈 화면의 조건이
 * 아니다 — 남겨 두면 뒤로 간 탐색 홈에서 도움말이 다시 열린다.
 */
export function backHref(search: string): string {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);

  if (params.get(ORIGIN_PARAM) === SAVED_ORIGIN) return "/saved";

  params.delete(ORIGIN_PARAM);
  params.delete("sheet");

  const query = params.toString();
  return query ? `/?${query}` : "/";
}

/**
 * 이 화면에 **앱 안에서** 들어왔는지. 그럴 때만 `navigate(-1)` 이 안전하다.
 *
 * 링크로 곧장 들어온 첫 진입에서 뒤로가기를 부르면, 히스토리가 비었으면 아무 일도
 * 일어나지 않고 바깥에서 왔으면 사이트를 떠난다 — 비상구가 출구가 되는 셈이다.
 * 그래서 그 경우에는 링크가 href(`/`)를 그대로 따라가게 둔다.
 *
 * 판정은 react-router 가 `history.state` 에 들고 다니는 `idx` 로 한다. 이것은
 * **앱이 만든 히스토리 스택 안에서의 자리**라 첫 진입(링크로 곧장 열기·새 탭·
 * 새로고침)은 언제나 0이고, 앱 안에서 한 번이라도 이동하면 1 이상이 된다.
 * `history.length` 는 앱 밖에서 쌓인 것까지 세기 때문에 쓰지 않는다 — 다른
 * 사이트에서 들어온 경우까지 참이 되어 바로 그 사이트로 되돌아가게 된다.
 *
 * 값을 읽지 못하면 거짓이다. 틀려도 href(`/`)를 따라가 앱 안에 남는다.
 */
export function shouldUseHistoryBack(historyState: unknown): boolean {
  if (typeof historyState !== "object" || historyState === null) return false;

  const { idx } = historyState as { idx?: unknown };
  return typeof idx === "number" && idx > 0;
}
