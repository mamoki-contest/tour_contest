import type { OpenSheet } from "./explore-params";

/**
 * 탐색 홈이 아닌 화면에서 시트를 여닫는 주소 (#41).
 *
 * 탐색 홈은 `exploreHref` 로 상태 전체를 다시 쓰지만, 상세·저장 화면의 주소에는
 * 그 화면만 아는 값(`from` 같은)이 섞여 있다. 그래서 여기서는 **시트 열림 한 칸만**
 * 건드리고 나머지 쿼리는 손대지 않는다 — 도움말을 열었다고 들고 온 탐색 조건이
 * 사라지면, 닫고 뒤로 갔을 때 돌아갈 자리를 잃는다.
 */
function toParams(search: string): URLSearchParams {
  return new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
}

function toSearch(params: URLSearchParams): string {
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** 지금 주소에 시트 열림만 더한다. */
export function openSheetSearch(search: string, sheet: OpenSheet): string {
  const params = toParams(search);
  params.set("sheet", sheet);
  return toSearch(params);
}

/**
 * 시트 열림만 뺀다.
 *
 * 되돌릴 히스토리가 없는 첫 진입(주소를 직접 친 `?sheet=help`)에서 쓴다. 그 자리에서
 * `뒤로`를 부르면 사이트 밖으로 나가므로, 시트만 지우고 같은 화면에 남는다.
 */
export function closeSheetSearch(search: string): string {
  const params = toParams(search);
  params.delete("sheet");
  return toSearch(params);
}
