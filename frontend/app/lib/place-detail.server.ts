import type {
  CrowdForecast,
  CrowdLevel,
  CurrentAccess,
  DataStatus,
  ForecastDay,
  ParkingStatus,
  PlaceDetail,
  PlaceDetailResult,
  RelatedKind,
  RelatedPlace,
  RoadFlow,
  RoadStatus,
} from "./contract";
import { savedDetailResponses } from "./places.fixture";
import { normalizePlaceFields, usesSavedContractResponse } from "./places.server";

/**
 * 관광지 상세 조회 (슬라이스 #7·#8). 서버에서만 실행된다.
 *
 * 다섯 섹션이 각각 독립 상태를 가진다 — 한 섹션의 결측이나 실패가 다른 섹션을
 * 무너뜨리지 않게 계약 단계에서부터 따로 받는다.
 */

const DETAIL_TIMEOUT_MS = 8_000;

const CROWD_LEVELS: CrowdLevel[] = ["QUIET", "NORMAL", "BUSY"];
const ROAD_FLOWS: RoadFlow[] = ["SMOOTH", "SLOW", "JAM"];
const DATA_STATUSES: DataStatus[] = ["OK", "STALE", "MISSING", "UNAVAILABLE"];

function asStatus(raw: unknown): DataStatus {
  return DATA_STATUSES.includes(raw as DataStatus) ? (raw as DataStatus) : "MISSING";
}

function asText(raw: unknown): string | null {
  return typeof raw === "string" && raw.trim() !== "" ? raw : null;
}

function asNumber(raw: unknown): number | null {
  return typeof raw === "number" && Number.isFinite(raw) ? raw : null;
}

function toForecast(raw: unknown): CrowdForecast {
  const record = (raw ?? {}) as Record<string, unknown>;

  const days: ForecastDay[] = Array.isArray(record.days)
    ? record.days
        .map((entry) => {
          const day = (entry ?? {}) as Record<string, unknown>;
          const date = asText(day.date);
          if (!date) return null;
          return {
            date,
            // 계약에 없는 값은 예측 없음으로 둔다. 낮은 값으로 채우지 않는다.
            level: CROWD_LEVELS.includes(day.level as CrowdLevel) ? (day.level as CrowdLevel) : null,
          };
        })
        .filter((day): day is ForecastDay => day !== null)
    : [];

  return {
    days,
    quietDate: asText(record.quietDate),
    status: record.status === undefined && days.length === 0 ? "MISSING" : asStatus(record.status),
    source: asText(record.source),
    observedAt: asText(record.observedAt),
  };
}

function toCurrentAccess(raw: unknown): CurrentAccess {
  const record = (raw ?? {}) as Record<string, unknown>;

  const roads: RoadStatus[] = Array.isArray(record.roads)
    ? record.roads
        .map((entry) => {
          const road = (entry ?? {}) as Record<string, unknown>;
          const label = asText(road.label);
          if (!label || !ROAD_FLOWS.includes(road.flow as RoadFlow)) return null;
          return { flow: road.flow as RoadFlow, speedKph: asNumber(road.speedKph), label };
        })
        .filter((road): road is RoadStatus => road !== null)
    : [];

  // 주차 정보가 없는 장소에 잔여면을 지어내지 않는다.
  let parking: ParkingStatus | null = null;
  if (record.parking) {
    const raw = record.parking as Record<string, unknown>;
    parking = { total: asNumber(raw.total), available: asNumber(raw.available) };
  }

  return {
    roads,
    parking,
    status:
      record.status === undefined && roads.length === 0 && parking === null
        ? "MISSING"
        : asStatus(record.status),
    source: asText(record.source),
    observedAt: asText(record.observedAt),
  };
}

function toRelated(raw: unknown, expected: RelatedKind): RelatedPlace[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      const base = normalizePlaceFields(entry);
      if (!base) return null;
      const record = (entry ?? {}) as Record<string, unknown>;
      // 종류가 계약과 다르면 버린다 — 음식점이 대체지 후보로 흘러들지 않게.
      if (record.kind !== expected) return null;
      return { ...base, kind: expected, subtype: asText(record.subtype) };
    })
    .filter((place): place is RelatedPlace => place !== null);
}

function toDetail(raw: unknown): PlaceDetail | null {
  const base = normalizePlaceFields(raw);
  if (!base) return null;
  const record = (raw ?? {}) as Record<string, unknown>;

  const { forecast: _summary, ...rest } = base;

  return {
    ...rest,
    description: asText(record.description),
    forecast: toForecast(record.forecast),
    currentAccess: toCurrentAccess(record.currentAccess),
    alternatives: toRelated(record.alternatives, "ALTERNATIVE"),
    companions: toRelated(record.companions, "COMPANION"),
    status: asStatus(record.status),
    source: asText(record.source),
    observedAt: asText(record.observedAt),
  };
}

export async function fetchPlaceDetail(
  placeId: string,
  signal?: AbortSignal,
): Promise<PlaceDetailResult> {
  if (usesSavedContractResponse()) {
    const saved = savedDetailResponses[placeId];
    if (!saved) {
      return { ok: false, failure: { dataName: "관광지 정보", cause: `표본에 ${placeId}가 없습니다.` } };
    }
    const detail = toDetail(saved);
    return detail
      ? { ok: true, data: detail }
      : { ok: false, failure: { dataName: "관광지 정보", cause: "표본이 계약을 벗어났습니다." } };
  }

  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) {
    return {
      ok: false,
      failure: { dataName: "관광지 정보", cause: "API_BASE_URL이 설정되지 않았습니다." },
    };
  }

  const timeout = AbortSignal.timeout(DETAIL_TIMEOUT_MS);
  try {
    const response = await fetch(
      new URL(`/api/places/${encodeURIComponent(placeId)}`, baseUrl),
      {
        headers: { accept: "application/json" },
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      },
    );

    if (!response.ok) {
      return {
        ok: false,
        failure: { dataName: "관광지 정보", cause: `백엔드 응답 ${response.status}` },
      };
    }

    const detail = toDetail(await response.json());
    return detail
      ? { ok: true, data: detail }
      : { ok: false, failure: { dataName: "관광지 정보", cause: "응답이 계약을 벗어났습니다." } };
  } catch (error) {
    return {
      ok: false,
      failure: {
        dataName: "관광지 정보",
        cause: error instanceof Error ? error.message : String(error),
      },
    };
  }
}
