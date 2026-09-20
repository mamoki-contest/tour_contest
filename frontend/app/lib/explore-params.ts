import { isWithinForecastWindow } from "./forecast-window";

/**
 * 탐색 상태는 URL 쿼리에 산다 (WIREFRAME U6, 심각도 4).
 *
 * 상세에서 뒤로 왔을 때 지도 위치·필터·정렬이 초기화되면 F1·F2·F3가 통째로
 * 무너진다. 컴포넌트 상태가 아니라 URL을 진실로 삼아 뒤로가기가 탐색을 복원하게 한다.
 */

/** 관광지 관심도 정렬 방향. `혼잡한 순`·`한산한 순`이라는 이름을 쓰지 않는다 — 인기도는 혼잡이 아니다. */
export type SortOrder = "INTEREST_DESC" | "INTEREST_ASC";

/** 날짜 모드. 고정 모드에서만 선택일을 받는다. */
export type DateMode = "FLEXIBLE" | "FIXED";

/** 시트 스냅 세 단계. 첫 진입은 중간(D4 사용자 확정). */
export type SheetSnap = "peek" | "middle" | "full";

/**
 * 열려 있는 오버레이 시트.
 *
 * WIREFRAME은 `/?q=`·`/?date=`로 적었지만 그 두 이름은 이미 검색어와 선택일이라는
 * **값**을 담고 있다. 열림 여부를 값에 겹쳐 실으면 `날짜 시트를 열었지만 날짜는 아직
 * 안 골랐다`를 표현할 수 없다. 그래서 열림 상태만 따로 `sheet`에 둔다 — 요구사항의
 * 핵심(히스토리 엔트리를 가져 뒤로가기가 한 겹씩 닫는다)은 그대로다.
 */
export type OpenSheet = "region" | "search" | "date" | "help";

/** 지도 경계 — 목록 조회의 탐색 범위. 사용자가 `이 지도 영역에서 검색`을 눌러야 확정된다. */
export interface MapBounds {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

/**
 * 지도가 지금 보고 있는 자리 — 중심과 확대 단계.
 *
 * 조회 조건이 아니라 **화면 위치**다. 그런데도 URL에 싣는 이유는 U6 때문이다:
 * 상세로 들어갔다 뒤로 오면 `MapView` 가 언마운트됐다가 다시 마운트되므로,
 * 위치가 URL에 없으면 축척이 강원 전체로 되돌아간다. `bbox` 만으로는 모자란다 —
 * 사용자가 확대만 하고 `이 지도 영역에서 검색` 을 누르지 않았을 때는 `bbox` 가
 * 아예 없기 때문이다.
 */
export interface MapViewport {
  lat: number;
  lng: number;
  /** 카카오맵 확대 단계. 작을수록 확대. */
  level: number;
}

export interface ExploreState {
  /** 선택된 시·군 행정구역 코드. null이면 강원 전체. */
  regionCode: string | null;
  /** 확정된 지도 경계. null이면 시·군 선택 또는 강원 전체가 범위다. */
  bounds: MapBounds | null;
  /** 지도가 보고 있는 자리. 조회에는 쓰지 않는다 — 뒤로가기가 축척을 되살리기 위한 것이다. */
  viewport: MapViewport | null;
  /** 적용된 지원 테마. null이면 무테마. */
  theme: string | null;
  /** 자유 검색어 — 지원 테마로 정규화되지 않은 입력. */
  query: string | null;
  dateMode: DateMode;
  /** 고정 모드의 선택일 (YYYY-MM-DD). 유연 모드에서는 항상 null. */
  date: string | null;
  sort: SortOrder;
  /**
   * 지금까지 불러온 쪽 수 (#30 M4).
   *
   * 한 쪽이 아니라 **누적**이다 — `더 보기`는 21번째부터 따로 보여주는 것이 아니라
   * 읽던 목록을 늘리는 동작이고, 그래야 뒤로가기가 읽던 자리로 돌아온다.
   */
  page: number;
  snap: SheetSnap;
  /** 열려 있는 오버레이 시트. null이면 닫힘. */
  sheet: OpenSheet | null;
}

/** 첫 진입 기본 상태 — 강원 전체 · 무테마 · 날짜 미정 · 인기 많은 순 (ADR-0005). */
export const DEFAULT_EXPLORE_STATE: ExploreState = {
  regionCode: null,
  bounds: null,
  viewport: null,
  theme: null,
  query: null,
  dateMode: "FLEXIBLE",
  date: null,
  sort: "INTEREST_DESC",
  page: 1,
  snap: "middle",
  sheet: null,
};

const SORTS: SortOrder[] = ["INTEREST_DESC", "INTEREST_ASC"];
const SNAPS: SheetSnap[] = ["peek", "middle", "full"];
const SHEETS: OpenSheet[] = ["region", "search", "date", "help"];

/** 누적해 부를 수 있는 쪽 수의 끝. 백엔드 한 번 조회의 최대 개수(100)가 정한다. */
export const MAX_PAGE = 5;

/** `page=3`. 정수가 아니거나 범위 밖이면 첫 쪽으로 되돌린다 — 주소를 손댄 값이다. */
function parsePage(raw: string | null): number {
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return Math.min(parsed, MAX_PAGE);
}

function text(params: URLSearchParams, key: string): string | null {
  const raw = params.get(key);
  return raw !== null && raw.trim() !== "" ? raw.trim() : null;
}

/** `YYYY-MM-DD`만 통과시킨다. 형식이 어긋나면 날짜 없음으로 되돌린다 — 임의 값을 만들지 않는다. */
function isCalendarDate(raw: string | null): raw is string {
  return raw !== null && /^\d{4}-\d{2}-\d{2}$/.test(raw) && !Number.isNaN(Date.parse(raw));
}

/**
 * 예측이 닿는 날인지까지 본다.
 *
 * 형식만 보면 지난 날짜가 그대로 백엔드로 간다. 백엔드는 과거 날짜를 400으로
 * 거절하므로 **목록 전체를 잃는다** — 어긋난 조건 하나 때문에 화면이 통째로 죽고,
 * `다시 시도`는 같은 조건으로 다시 부르니 벗어날 길도 없다.
 *
 * 날짜 시트가 창 밖을 고르지 못하게 막고 있어도 이 검사가 필요하다. 날짜가 걸린
 * 링크는 **공유되고 북마크된다** — 25일을 고른 링크를 26일에 열면 그 날짜는 과거다.
 */
function isUsableDate(raw: string | null, now: Date): raw is string {
  return isCalendarDate(raw) && isWithinForecastWindow(raw, now);
}

/**
 * 쿼리에서 탐색 상태를 읽는다.
 *
 * 로더와 컴포넌트가 **같은 함수로 같은 URL을 읽는다.** 컴포넌트가 로더 데이터의
 * 상태를 쓰면 안 되는 이유는, 시트 스냅처럼 재조회가 필요 없는 조건은 로더가
 * 다시 돌지 않아 값이 낡기 때문이다.
 */
/** `swLat,swLng,neLat,neLng`. 넷 다 유한수여야 통과한다 — 반쯤 깨진 경계로 조회하지 않는다. */
function parseBounds(raw: string | null): MapBounds | null {
  if (!raw) return null;
  const parts = raw.split(",").map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null;
  const [swLat, swLng, neLat, neLng] = parts;
  if (swLat > neLat || swLng > neLng) return null;
  return { swLat, swLng, neLat, neLng };
}

export function formatBounds(bounds: MapBounds): string {
  return [bounds.swLat, bounds.swLng, bounds.neLat, bounds.neLng]
    .map((n) => n.toFixed(5))
    .join(",");
}

/** 카카오맵이 실제로 쓰는 확대 단계 범위. 밖의 값은 주소를 손댄 것이므로 버린다. */
const MIN_MAP_LEVEL = 1;
const MAX_MAP_LEVEL = 14;

/** `c=lat,lng` 와 `z=level` 을 함께 읽는다. 하나라도 깨져 있으면 통째로 버린다. */
export function parseViewport(center: string | null, level: string | null): MapViewport | null {
  if (!center || !level) return null;
  const parts = center.split(",").map(Number);
  const parsedLevel = Number(level);
  if (parts.length !== 2 || parts.some((n) => !Number.isFinite(n))) return null;
  if (!Number.isInteger(parsedLevel) || parsedLevel < MIN_MAP_LEVEL || parsedLevel > MAX_MAP_LEVEL) {
    return null;
  }
  const [lat, lng] = parts;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng, level: parsedLevel };
}

export function formatViewportCenter(viewport: MapViewport): string {
  return `${viewport.lat.toFixed(6)},${viewport.lng.toFixed(6)}`;
}

/**
 * `이 지도 영역에서 검색` 이 확정하는 상태.
 *
 * 시·군 조건을 함께 지운다. 둘을 같이 두면 백엔드에서 AND 로 걸려 조회 범위가
 * 어느 쪽도 아니게 되는데, 조건 칩은 시·군 이름만 말해 사용자가 그 사실을 알 수
 * 없다. 반대 방향(`withRegionCode`)과 대칭이다.
 */
export function withMapBounds(state: ExploreState, bounds: MapBounds): ExploreState {
  // 범위가 바뀌면 지금까지 늘려 둔 쪽은 다른 목록의 쪽이다 — 첫 쪽으로 되돌린다.
  return { ...state, bounds, regionCode: null, page: 1 };
}

/**
 * 시·군을 고르면 지도 경계 조건은 지운다 — `withMapBounds` 의 반대 방향.
 *
 * 새 시·군을 고르면 지도가 그리로 옮겨 가므로, 주소에 적어 둔 **옛 위치는 버린다.**
 * 남겨 두면 상세에서 뒤로 왔을 때 고른 시·군이 아니라 고르기 전 자리로 되돌아간다.
 * 강원 전체로 되돌릴 때는 지도를 움직이지 않으니 보던 자리도 그대로 둔다.
 */
export function withRegionCode(state: ExploreState, regionCode: string | null): ExploreState {
  return {
    ...state,
    regionCode,
    bounds: null,
    page: 1,
    viewport: regionCode === null ? state.viewport : null,
  };
}

export function parseExploreState(params: URLSearchParams, now: Date = new Date()): ExploreState {
  const sortRaw = params.get("sort");
  const snapRaw = params.get("snap");
  const sheetRaw = params.get("sheet");
  const requestedMode: DateMode = params.get("dateMode") === "FIXED" ? "FIXED" : "FLEXIBLE";
  const rawDate = text(params, "date");

  // 유연 모드에 남은 날짜는 무시한다 — 두 모드가 같은 화면에서 섞이지 않게 한다.
  const date = requestedMode === "FIXED" && isUsableDate(rawDate, now) ? rawDate : null;

  /*
   * 쓸 수 없는 날짜를 버릴 때 모드도 함께 되돌린다. 모드만 `FIXED` 로 남으면 카드가
   * 있지도 않은 선택일 수준을 찾다가 전부 `예측 정보 없음` 이 된다 — 날짜를 고르지
   * 않은 것과 예측이 없는 것은 다른 말이다.
   */
  const dateMode: DateMode = requestedMode === "FIXED" && date === null ? "FLEXIBLE" : requestedMode;

  return {
    regionCode: text(params, "region"),
    bounds: parseBounds(text(params, "bbox")),
    viewport: parseViewport(text(params, "c"), text(params, "z")),
    theme: text(params, "theme"),
    query: text(params, "q"),
    dateMode,
    date,
    sort: SORTS.includes(sortRaw as SortOrder) ? (sortRaw as SortOrder) : DEFAULT_EXPLORE_STATE.sort,
    page: parsePage(params.get("page")),
    snap: SNAPS.includes(snapRaw as SheetSnap) ? (snapRaw as SheetSnap) : DEFAULT_EXPLORE_STATE.snap,
    sheet: SHEETS.includes(sheetRaw as OpenSheet) ? (sheetRaw as OpenSheet) : null,
  };
}

/** 기본값과 같은 항목은 URL에 쓰지 않는다 — 주소가 실제로 걸린 조건만 말하게 한다. */
export function toSearchParams(state: ExploreState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.regionCode) params.set("region", state.regionCode);
  if (state.bounds) params.set("bbox", formatBounds(state.bounds));
  if (state.viewport) {
    params.set("c", formatViewportCenter(state.viewport));
    params.set("z", String(state.viewport.level));
  }
  if (state.theme) params.set("theme", state.theme);
  if (state.query) params.set("q", state.query);
  if (state.dateMode !== DEFAULT_EXPLORE_STATE.dateMode) params.set("dateMode", state.dateMode);
  if (state.dateMode === "FIXED" && state.date) params.set("date", state.date);
  if (state.sort !== DEFAULT_EXPLORE_STATE.sort) params.set("sort", state.sort);
  if (state.page > 1) params.set("page", String(state.page));
  if (state.snap !== DEFAULT_EXPLORE_STATE.snap) params.set("snap", state.snap);
  if (state.sheet) params.set("sheet", state.sheet);
  return params;
}

export function exploreHref(state: ExploreState): string {
  const query = toSearchParams(state).toString();
  return query ? `/?${query}` : "/";
}

/**
 * 조건이 하나라도 걸려 있는지 — `초기화` 칩을 보일지 정한다.
 *
 * 지도 뷰포트(`viewport`)는 세지 않는다. 지도를 움직인 것은 조회 조건을 건 것이
 * 아니어서, 그것만으로 `초기화` 가 나타나면 지울 조건이 없는데도 지우라고 권하는 셈이 된다.
 */
export function hasActiveConditions(state: ExploreState): boolean {
  return (
    state.regionCode !== null ||
    state.bounds !== null ||
    state.theme !== null ||
    state.query !== null ||
    state.dateMode !== DEFAULT_EXPLORE_STATE.dateMode ||
    state.sort !== DEFAULT_EXPLORE_STATE.sort
  );
}

/**
 * URL이 날짜를 요청했지만 예측이 닿지 않아 버렸는지.
 *
 * 버렸다는 사실을 화면이 말해야 한다 — 고른 날짜가 조용히 사라지면 사용자는
 * 자기가 무엇으로 보고 있는지 모른 채 다른 조건의 결과를 읽는다.
 */
export function hasDroppedDate(params: URLSearchParams, now: Date = new Date()): boolean {
  const raw = text(params, "date");
  return params.get("dateMode") === "FIXED" && raw !== null && !isUsableDate(raw, now);
}
