import type {
  Place,
  PlaceListFailure,
  PlaceListResponse,
  PlaceListSearch,
  SearchResultType,
} from "./contract";
import { DEFAULT_EXPLORE_STATE, MAX_PAGE, type ExploreState } from "./explore-params";
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
/** 백엔드 한 번 조회의 최대 개수. `더 보기`가 닿을 수 있는 끝을 이 값이 정한다. */
const MAX_SIZE = PAGE_SIZE * MAX_PAGE;
const LIST_DATA_NAME = "관광지 목록";

/**
 * 예측이 실제로 닿는 날의 범위.
 *
 * 프론트는 오래 `오늘 + 30일`을 스스로 계산했지만 백엔드가 가진 창은 그보다 짧다.
 * 고를 수 있다고 그려 놓고 조회에서 되돌리는 대신, 응답이 말하는 창을 그대로 쓴다 (#30 M3).
 */
export interface SupportedWindow {
  /** YYYY-MM-DD. */
  from: string;
  to: string;
}

/**
 * 한 쪽이 아니라 **지금까지 누적해 받은 목록**.
 *
 * 화면 계약의 응답에 쪽 정보를 얹는다 — 21번째부터를 따로 보여주는 화면이 아니라
 * 읽던 목록을 늘리는 화면이라서, 화면은 `몇 쪽인가`가 아니라 `더 있는가`를 묻는다.
 */
export interface PlaceListPage extends PlaceListResponse {
  /** 지금까지 누적한 쪽 수. */
  page: number;
  /** 아직 못 받은 항목이 남았고, 한 번 더 부를 수 있는지. */
  hasMore: boolean;
  /**
   * 끝에 닿았는지 — 남은 항목은 있지만 한 번에 받을 수 있는 한계를 넘었다.
   * 버튼을 조용히 지우는 대신 화면이 조건을 좁히도록 권한다.
   */
  reachedLimit: boolean;
  /** 응답이 말하는 예측 지원 창. 날짜를 보내지 않은 조회에서는 null. */
  forecastWindow: SupportedWindow | null;
}

export type PlaceListPageResult =
  | { ok: true; data: PlaceListPage }
  | { ok: false; failure: PlaceListFailure };

interface BackendListResponse {
  items?: BackendAttraction[] | null;
  totalCount?: number | null;
  page?: number | null;
  size?: number | null;
  sort?: string | null;
  /** 요청한 정렬을 **실제로 적용했는지**. 백엔드가 직접 말한다 — 프론트가 추측하지 않는다. */
  sortApplied?: boolean | null;
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

/** 정렬 방향을 백엔드 이름으로 옮긴다. */
function toBackendSort(sort: ExploreState["sort"]): string {
  return sort === "MENTION_ASC" ? "ONLINE_MENTION_ASC" : "ONLINE_MENTION_DESC";
}

/**
 * 누적해 받을 개수. `더 보기`를 누른 만큼 한 번에 더 크게 받는다 — 쪽을 나눠 따로
 * 부르면 읽던 앞쪽을 화면이 직접 들고 있어야 하고, 뒤로가기가 그 자리를 잃는다.
 */
function sizeFor(page: number): number {
  return Math.min(PAGE_SIZE * page, MAX_SIZE);
}

/** 탐색 조건을 목록 질의로 옮긴다. 시트 스냅 같은 화면 상태는 보내지 않는다. */
function toListQuery(state: ExploreState): URLSearchParams {
  const query = new URLSearchParams();
  if (state.regionCode) query.set("sigunguCode", state.regionCode);
  query.set("size", String(sizeFor(state.page)));
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
 * 이 입구는 날짜 탐색과 정렬을 받지 않는다 — `dateMode`·`visitDate` 파라미터가
 * 아예 없다(mamoki-contest/tour_backend#98). 받지 않는 값을 보내면 조용히 버려질 뿐이라
 * 보내지 않고, 검색 결과 카드의 빈 예측 자리는 화면이 `예측 정보 없음`으로 채운다.
 */
function toSearchQuery(state: ExploreState, term: string): URLSearchParams {
  const query = new URLSearchParams();
  query.set("query", term);
  if (state.regionCode) query.set("sigunguCode", state.regionCode);
  query.set("size", String(sizeFor(state.page)));
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

/**
 * 응답이 말하는 예측 지원 창을 찾는다.
 *
 * 항목마다 실려 오고 값은 모두 같다. 날짜를 보내지 않은 조회에는 아예 없으므로,
 * 없으면 없다고 말한다 — 화면이 스스로 30일을 지어내던 자리를 이 값이 대신한다.
 */
function toForecastWindow(items: BackendAttraction[] | null | undefined): SupportedWindow | null {
  if (!Array.isArray(items)) return null;
  for (const item of items) {
    const from = text(item?.visitTiming?.supportedFrom);
    const to = text(item?.visitTiming?.supportedTo);
    if (from && to) return { from, to };
  }
  return null;
}

function toListResponse(
  data: BackendListResponse,
  search: PlaceListSearch | null,
  page: number,
): PlaceListPage {
  const places = toPlaces(data.items);
  const totalCount = num(data.totalCount);
  const size = sizeFor(page);
  /*
   * 아직 못 받은 항목이 남았는지. 전체 개수를 알면 그것과 견주고, 모르면 부른 만큼
   * 꽉 채워 왔는지로 짐작한다 — 모자라게 왔다면 그것이 끝이다.
   */
  const hasRemaining = totalCount !== null ? places.length < totalCount : places.length >= size;

  return {
    places,
    totalCount,
    search,
    /*
     * 응답의 `sort` 는 **요청한** 기준을 그대로 되비칠 뿐이라 요청과 비교해 봐야 늘 같다.
     * 적용 여부는 `sortApplied` 만 안다 — 언급량 스냅샷이 비어 이름 오름차순으로 온
     * 목록이 `언급 많은 순`으로 읽히던 것이 그 차이다.
     */
    sortApplied: data.sortApplied === true,
    status: toDataStatus(data.dataStatus),
    source: text(data.source),
    observedAt: text(data.collectedAt),
    page,
    hasMore: hasRemaining && size < MAX_SIZE,
    reachedLimit: hasRemaining && size >= MAX_SIZE,
    forecastWindow: toForecastWindow(data.items),
  };
}

export async function fetchPlaceList(
  signal?: AbortSignal,
  state: ExploreState = DEFAULT_EXPLORE_STATE,
): Promise<PlaceListPageResult> {
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
      ? { ok: true, data: toListResponse(result.data, toSearchInfo(result.data), state.page) }
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
    return { ok: true, data: toListResponse(result.data, null, state.page) };
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
    ? { ok: true, data: toListResponse(retried.data, null, state.page) }
    : { ok: false, failure: retried.failure };
}

/**
 * 예측 지원 창만 따로 묻는다 (#30 M3).
 *
 * 나만의 지도에는 관광지 목록이 없어 창을 함께 받을 자리가 없다. 방문 예정일을
 * 고르는 자리가 거기라, 한 곳만 부르는 가장 싼 조회로 창을 받아 온다. 실패하면
 * null — 그때만 화면이 스스로 계산한 30일로 되돌아간다.
 */
export async function fetchForecastWindow(signal?: AbortSignal): Promise<SupportedWindow | null> {
  const query = new URLSearchParams({ size: "1", dateMode: "FLEXIBLE" });
  const result = await fetchEnvelope<BackendListResponse>(
    "/api/v1/attractions",
    query,
    LIST_DATA_NAME,
    signal,
  );
  return result.ok ? toForecastWindow(result.data.items) : null;
}
