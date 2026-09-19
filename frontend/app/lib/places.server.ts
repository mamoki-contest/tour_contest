import type {
  CrowdLevel,
  DataStatus,
  Place,
  PlaceForecastSummary,
  PlaceListResponse,
  PlaceListResult,
  Sourced,
} from "./contract";
import { DEFAULT_EXPLORE_STATE, type ExploreState } from "./explore-params";
import { savedContractResponse } from "./places.fixture";

/**
 * 관광지 목록 조회. 브라우저가 아니라 서버(로더)에서만 실행된다 — 백엔드 주소와
 * 자격 정보가 클라이언트 번들에 들어가지 않게 하기 위해서다.
 */

const LIST_TIMEOUT_MS = 8_000;

const DATA_STATUSES: DataStatus[] = ["OK", "STALE", "MISSING", "UNAVAILABLE"];

function asStatus(raw: unknown): DataStatus {
  return DATA_STATUSES.includes(raw as DataStatus) ? (raw as DataStatus) : "MISSING";
}

function asText(raw: unknown): string | null {
  return typeof raw === "string" && raw.trim() !== "" ? raw : null;
}

function asSourcedNumber(raw: unknown): Sourced<number> {
  const record = (raw ?? {}) as Record<string, unknown>;
  const value = typeof record.value === "number" ? record.value : null;
  return {
    value,
    // 값이 없는데 status가 없으면 결측이다. 낮은 값으로 해석하지 않는다.
    status: record.status === undefined && value === null ? "MISSING" : asStatus(record.status),
    source: asText(record.source),
    observedAt: asText(record.observedAt),
  };
}

const CROWD_LEVELS: CrowdLevel[] = ["QUIET", "NORMAL", "BUSY"];

function asForecastSummary(raw: unknown): PlaceForecastSummary {
  const record = (raw ?? {}) as Record<string, unknown>;
  const level = CROWD_LEVELS.includes(record.selectedDateLevel as CrowdLevel)
    ? (record.selectedDateLevel as CrowdLevel)
    : null;
  const quietDate = asText(record.quietDate);

  return {
    selectedDateLevel: level,
    quietDate,
    // 둘 다 없는데 status가 없으면 결측이다. 예측이 좋다는 뜻으로 읽히지 않게 한다.
    status:
      record.status === undefined && level === null && quietDate === null
        ? "MISSING"
        : asStatus(record.status),
    source: asText(record.source),
    observedAt: asText(record.observedAt),
  };
}

/**
 * 공급자 응답이 계약을 벗어나도 화면이 값을 지어내지 않도록 좁혀서 받는다.
 * 상세와 연관 장소도 같은 규칙으로 읽으라고 밖으로 연다.
 */
export function normalizePlaceFields(raw: unknown): Place | null {
  const record = (raw ?? {}) as Record<string, unknown>;
  const placeId = asText(record.placeId);
  const name = asText(record.name);
  if (!placeId || !name) return null;

  const coordinates = (record.coordinates ?? null) as Record<string, unknown> | null;
  const latitude = coordinates && typeof coordinates.latitude === "number" ? coordinates.latitude : null;
  const longitude = coordinates && typeof coordinates.longitude === "number" ? coordinates.longitude : null;

  return {
    placeId,
    name,
    photoUrl: asText(record.photoUrl),
    address: asText(record.address),
    coordinates: latitude !== null && longitude !== null ? { latitude, longitude } : null,
    category: asText(record.category),
    regionCenterRank: asSourcedNumber(record.regionCenterRank),
    interest: asSourcedNumber(record.interest),
    forecast: asForecastSummary(record.forecast),
  };
}

function toListResponse(raw: unknown): PlaceListResponse {
  const record = (raw ?? {}) as Record<string, unknown>;
  const places = Array.isArray(record.places)
    ? record.places.map(normalizePlaceFields).filter((place): place is Place => place !== null)
    : [];

  return {
    places,
    status: asStatus(record.status),
    source: asText(record.source),
    observedAt: asText(record.observedAt),
  };
}

/**
 * 백엔드가 아직 배포되지 않은 환경에서 카드 구조를 확인하기 위한 경로.
 * 저장된 계약 응답임을 화면이 사용자에게 밝힌다 — 실제 데이터로 위장하지 않는다.
 */
export function usesSavedContractResponse(): boolean {
  return !process.env.API_BASE_URL && process.env.PLACES_SAVED_CONTRACT === "true";
}

/** 탐색 조건을 백엔드 질의로 옮긴다. 시트 스냅 같은 화면 상태는 보내지 않는다. */
function toQuery(state: ExploreState): URLSearchParams {
  const query = new URLSearchParams();
  if (state.regionCode) query.set("region", state.regionCode);
  if (state.theme) query.set("theme", state.theme);
  if (state.query) query.set("q", state.query);
  query.set("dateMode", state.dateMode);
  if (state.dateMode === "FIXED" && state.date) query.set("date", state.date);
  query.set("sort", state.sort);
  return query;
}

export async function fetchPlaceList(
  signal?: AbortSignal,
  state: ExploreState = DEFAULT_EXPLORE_STATE,
): Promise<PlaceListResult> {
  if (usesSavedContractResponse()) {
    return { ok: true, data: toListResponse(savedContractResponse) };
  }

  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) {
    return {
      ok: false,
      failure: { dataName: "관광지 목록", cause: "API_BASE_URL이 설정되지 않았습니다." },
    };
  }

  const endpoint = new URL("/api/places", baseUrl);
  endpoint.search = toQuery(state).toString();

  const timeout = AbortSignal.timeout(LIST_TIMEOUT_MS);
  try {
    const response = await fetch(endpoint, {
      headers: { accept: "application/json" },
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });

    if (!response.ok) {
      return {
        ok: false,
        failure: { dataName: "관광지 목록", cause: `백엔드 응답 ${response.status}` },
      };
    }

    return { ok: true, data: toListResponse(await response.json()) };
  } catch (error) {
    return {
      ok: false,
      failure: {
        dataName: "관광지 목록",
        cause: error instanceof Error ? error.message : String(error),
      },
    };
  }
}
