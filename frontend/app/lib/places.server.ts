import type {
  Place,
  PlaceListResponse,
  PlaceListResult,
  PlaceListSearch,
  SearchResultType,
} from "./contract";
import { DEFAULT_EXPLORE_STATE, type ExploreState } from "./explore-params";
import {
  fetchEnvelope,
  toDataStatus,
  toPlace,
  text,
  num,
  type BackendAttraction,
  type BackendDataStatus,
} from "./backend.server";

/**
 * 관광지 목록 조회. 브라우저가 아니라 서버(로더)에서만 실행된다 — 백엔드 주소와
 * 자격 정보가 클라이언트 번들에 들어가지 않게 하기 위해서다.
 *
 * 탐색 조건에 테마나 검색어가 있으면 검색 입구(`/attractions/search`)로,
 * 없으면 목록 입구(`/attractions`)로 간다. 두 입구는 **같은 화면을 그리지만
 * 보증이 다르다** — 그래서 결과 유형을 지우지 않고 그대로 들고 온다 (ADR-0003).
 */

const PAGE_SIZE = 20;
const LIST_DATA_NAME = "관광지 목록";

interface BackendListResponse {
  items?: BackendAttraction[] | null;
  totalCount?: number | null;
  page?: number | null;
  size?: number | null;
  sort?: string | null;
  dataStatus?: BackendDataStatus | null;
  collectedAt?: string | null;
  source?: string | null;
}

interface BackendSearchResponse extends BackendListResponse {
  resultType?: SearchResultType | null;
  appliedTheme?: { code?: string | null; name?: string | null } | null;
  appliedQuery?: string | null;
  suggestedThemes?: ({ code?: string | null; name?: string | null } | null)[] | null;
}

function toPlaces(items: BackendAttraction[] | null | undefined): Place[] {
  return Array.isArray(items)
    ? items.map(toPlace).filter((place): place is Place => place !== null)
    : [];
}

/** 정렬 방향을 백엔드 이름으로 옮긴다. 화면은 `인기 많은 순`, 백엔드는 온라인 언급량이다. */
function toBackendSort(sort: ExploreState["sort"]): string {
  return sort === "INTEREST_ASC" ? "ONLINE_MENTION_ASC" : "ONLINE_MENTION_DESC";
}

/** 탐색 조건을 목록 질의로 옮긴다. 시트 스냅 같은 화면 상태는 보내지 않는다. */
function toListQuery(state: ExploreState): URLSearchParams {
  const query = new URLSearchParams();
  if (state.regionCode) query.set("sigunguCode", state.regionCode);
  query.set("size", String(PAGE_SIZE));
  query.set("sort", toBackendSort(state.sort));

  // 날짜 모드를 보내야 항목마다 `visitTiming` 이 따라온다. 확정 모드만 날짜를 함께 보낸다.
  if (state.dateMode === "FIXED" && state.date) {
    query.set("dateMode", "FIXED");
    query.set("visitDate", state.date);
  } else {
    query.set("dateMode", "FLEXIBLE");
  }

  // 지도 경계는 네 값이 함께여야 뜻을 가진다 — 반쯤 보내지 않는다.
  if (state.bounds) {
    query.set("minLatitude", String(state.bounds.swLat));
    query.set("maxLatitude", String(state.bounds.neLat));
    query.set("minLongitude", String(state.bounds.swLng));
    query.set("maxLongitude", String(state.bounds.neLng));
  }

  return query;
}

/**
 * 검색은 테마와 자유 검색어를 **같은 입구**로 받는다. 어느 쪽이 적용됐는지는
 * 프론트가 판정하지 않고 백엔드의 `resultType` 이 말한다 — 동의어·오타 정규화가
 * 백엔드에 있기 때문이다 (themes.ts).
 *
 * 이 입구는 날짜 탐색과 정렬을 받지 않는다. 그래서 검색 결과 카드에는
 * 예측 요약이 비어 있고, 화면은 그 자리를 `예측 정보 없음`으로 채운다.
 */
function toSearchQuery(state: ExploreState, term: string): URLSearchParams {
  const query = new URLSearchParams();
  query.set("query", term);
  if (state.regionCode) query.set("sigunguCode", state.regionCode);
  query.set("size", String(PAGE_SIZE));
  return query;
}

function themeName(theme: { name?: string | null } | null | undefined): string | null {
  return text(theme?.name);
}

function toSearchInfo(data: BackendSearchResponse): PlaceListSearch {
  return {
    // 유형을 모르면 보증이 약한 쪽으로 읽는다 — 없는 자격을 붙이지 않는다.
    resultType: data.resultType === "SUPPORTED_THEME" ? "SUPPORTED_THEME" : "GENERAL_SEARCH",
    appliedTheme: themeName(data.appliedTheme),
    appliedQuery: text(data.appliedQuery),
    suggestedThemes: Array.isArray(data.suggestedThemes)
      ? data.suggestedThemes.map(themeName).filter((name): name is string => name !== null)
      : [],
  };
}

function toListResponse(
  data: BackendListResponse,
  search: PlaceListSearch | null,
  requestedSort: string | null,
): PlaceListResponse {
  return {
    places: toPlaces(data.items),
    totalCount: num(data.totalCount),
    search,
    // 백엔드가 적용한 정렬을 그대로 되돌려준다. 요청과 다르면 적용되지 않은 것이다.
    sortApplied: requestedSort !== null && data.sort === requestedSort,
    status: toDataStatus(data.dataStatus),
    source: text(data.source),
    observedAt: text(data.collectedAt),
  };
}

export async function fetchPlaceList(
  signal?: AbortSignal,
  state: ExploreState = DEFAULT_EXPLORE_STATE,
): Promise<PlaceListResult> {
  // 테마가 우선이다 — 시트가 테마를 적용할 때 검색어를 비우므로 둘이 함께 오지 않는다.
  const term = state.theme ?? state.query;

  if (term) {
    // 검색 입구는 정렬을 받지 않는다 — 요청하지 않았으니 적용 여부를 따질 것도 없다.
    const result = await fetchEnvelope<BackendSearchResponse>(
      "/api/v1/attractions/search",
      toSearchQuery(state, term),
      LIST_DATA_NAME,
      signal,
    );
    return result.ok
      ? { ok: true, data: toListResponse(result.data, toSearchInfo(result.data), null) }
      : { ok: false, failure: result.failure };
  }

  const query = toListQuery(state);
  const sort = query.get("sort");

  const result = await fetchEnvelope<BackendListResponse>(
    "/api/v1/attractions",
    query,
    LIST_DATA_NAME,
    signal,
  );
  if (result.ok) {
    return { ok: true, data: toListResponse(result.data, null, sort) };
  }

  /*
   * 정렬은 온라인 언급량 집계에 기대는 값이라, 그 집계가 흔들리면 목록 전체가
   * 500 으로 넘어온다. 둘 중 하나를 포기해야 한다면 정렬이다 — 예측이 이 제품의
   * 이유이고, 정렬은 없어도 목록이 선다. 정렬을 떼고 한 번 더 부른 뒤, 정렬이
   * 빠졌다는 사실을 `sortApplied` 로 화면까지 들고 간다. 조용히 공급자 순서를
   * 보여주면 사용자는 정렬이 걸린 목록으로 읽는다.
   */
  if (result.failure.status !== 500 || sort === null) {
    return { ok: false, failure: result.failure };
  }

  console.error(`[places] 정렬 포함 조회 실패, 정렬 없이 재시도합니다: ${result.failure.cause}`);
  query.delete("sort");

  const retried = await fetchEnvelope<BackendListResponse>(
    "/api/v1/attractions",
    query,
    LIST_DATA_NAME,
    signal,
  );
  return retried.ok
    ? { ok: true, data: toListResponse(retried.data, null, null) }
    : { ok: false, failure: retried.failure };
}
