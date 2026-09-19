import type { CrowdLevel, DataStatus, Place, PlaceForecastSummary, Sourced } from "./contract";

/**
 * 한사나다 백엔드(`/api/v1/**`) 경계. 서버(로더)에서만 실행된다.
 *
 * 백엔드는 모든 응답을 `RsData` 봉투로 감싸고, 결측을 `null` 로, 공급자 장애를
 * `dataStatus` 로 말한다. 화면 계약(`contract.ts`)은 그보다 좁다 — 이 파일이
 * 그 둘 사이를 옮기는 **유일한** 지점이다. 화면 코드는 백엔드 필드 이름을 모른다.
 */

const REQUEST_TIMEOUT_MS = 15_000;

/** 실패를 화면이 이름으로 부를 수 있게 하는 정보. `cause` 는 서버 로그에만 남는다. */
export interface BackendFailure {
  dataName: string;
  cause: string;
  /** HTTP 상태. 응답을 받기 전에 끊겼으면 없다 — 재시도 판단에만 쓴다. */
  status?: number;
}

export type BackendResult<T> = { ok: true; data: T } | { ok: false; failure: BackendFailure };

/** `RsData` 봉투. 오류 응답도 같은 모양이라 `data` 가 null 일 수 있다. */
interface RsData<T> {
  resultCode?: string;
  statusCode?: number;
  msg?: string;
  data?: T | null;
}

export function backendBaseUrl(): string | null {
  const raw = process.env.API_BASE_URL;
  return raw && raw.trim() !== "" ? raw.trim() : null;
}

/**
 * 봉투를 벗겨 `data` 만 돌려준다.
 *
 * 공급자 장애는 오류가 아니라 200 응답의 한 상태다 — 그래서 HTTP 상태로 실패를
 * 판정하는 곳은 여기 하나뿐이고, `dataStatus` 해석은 각 매핑 함수가 맡는다.
 */
export async function fetchEnvelope<T>(
  path: string,
  query: URLSearchParams,
  dataName: string,
  signal?: AbortSignal,
): Promise<BackendResult<T>> {
  const baseUrl = backendBaseUrl();
  if (!baseUrl) {
    return { ok: false, failure: { dataName, cause: "API_BASE_URL이 설정되지 않았습니다." } };
  }

  const endpoint = new URL(path, baseUrl);
  endpoint.search = query.toString();

  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(endpoint, {
      headers: { accept: "application/json" },
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });

    const envelope = (await response.json().catch(() => null)) as RsData<T> | null;

    if (!response.ok) {
      // 백엔드가 봉투에 담아 보낸 사유가 있으면 그쪽이 더 구체적이다.
      const reason = envelope?.msg ?? `백엔드 응답 ${response.status}`;
      return {
        ok: false,
        failure: { dataName, cause: `${reason} (${response.status})`, status: response.status },
      };
    }

    if (!envelope || envelope.data == null) {
      return { ok: false, failure: { dataName, cause: "응답 봉투에 data가 없습니다." } };
    }

    return { ok: true, data: envelope.data };
  } catch (error) {
    return {
      ok: false,
      failure: { dataName, cause: error instanceof Error ? error.message : String(error) },
    };
  }
}

/* ─────────────────────────  백엔드 응답 모양  ───────────────────────── */

/** 백엔드의 데이터 상태. 화면 계약의 `DataStatus` 와 이름이 다르다. */
export type BackendDataStatus = "AVAILABLE" | "STALE" | "NO_DATA";

export interface BackendVisitTiming {
  dateMode?: "FIXED" | "FLEXIBLE" | null;
  status?: "LOW" | "NORMAL" | "HIGH" | "NO_DATA" | "OUT_OF_RANGE" | null;
  selectedDate?: string | null;
  quietestDate?: string | null;
  forecastDays?: number | null;
  supportedFrom?: string | null;
  supportedTo?: string | null;
  dataStatus?: BackendDataStatus | null;
  collectedAt?: string | null;
  source?: string | null;
}

export interface BackendAttraction {
  contentId?: string | null;
  name?: string | null;
  imageUrl?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  contentTypeId?: string | null;
  lawdCode?: string | null;
  regionName?: string | null;
  centerRank?: number | null;
  baseAt?: string | null;
  onlineMention?: {
    status?: "COLLECTED" | "AMBIGUOUS" | "UNAVAILABLE" | "COLLECTION_FAILED" | null;
    count?: number | null;
    collectedAt?: string | null;
    ruleVersion?: string | null;
    sortable?: boolean | null;
  } | null;
  tmapRank?: { status?: "AVAILABLE" | "NOT_AVAILABLE" | null; rank?: number | null; period?: string | null } | null;
  visitorStats?: { status?: string | null; count?: number | null; period?: string | null } | null;
  visitTiming?: BackendVisitTiming | null;
}

/* ─────────────────────────  값 옮기기  ───────────────────────── */

export function text(raw: unknown): string | null {
  return typeof raw === "string" && raw.trim() !== "" ? raw : null;
}

export function num(raw: unknown): number | null {
  return typeof raw === "number" && Number.isFinite(raw) ? raw : null;
}

/**
 * `AVAILABLE|STALE|NO_DATA` 를 화면 계약으로 옮긴다.
 *
 * 백엔드에는 `UNAVAILABLE` 이 없다 — 공급자를 부르지 못한 경우도 `NO_DATA` 로 온다.
 * 그래서 호출 실패(`UNAVAILABLE`)는 이 함수가 아니라 HTTP 실패 경로에서만 나온다.
 */
export function toDataStatus(raw: BackendDataStatus | null | undefined): DataStatus {
  if (raw === "AVAILABLE") return "OK";
  if (raw === "STALE") return "STALE";
  return "MISSING";
}

/**
 * 관광공사 대분류 코드를 사람이 읽는 이름으로 옮긴다.
 * 모르는 코드에 이름을 지어내지 않는다 — null 이면 카드가 분류 배지를 생략한다.
 */
const CONTENT_TYPE_NAMES: Record<string, string> = {
  "12": "관광지",
  "14": "문화시설",
  "15": "축제공연행사",
  "25": "여행코스",
  "28": "레포츠",
  "32": "숙박",
  "38": "쇼핑",
  "39": "음식점",
};

export function contentTypeName(contentTypeId: string | null | undefined): string | null {
  return contentTypeId ? (CONTENT_TYPE_NAMES[contentTypeId] ?? null) : null;
}

/** 목록·상세가 공통으로 쓰는 출처 이름. 캡션 없이는 어떤 값도 화면에 올리지 않는다. */
const ATTRACTION_SOURCE = "한국관광공사 KorService2";

/**
 * 방문 혼잡도 예측 요약.
 *
 * `LOW|NORMAL|HIGH` 는 **그 장소 자신의 30일 분포 안에서의** 상대 수준이다.
 * 이름을 `QUIET|NORMAL|BUSY` 로 바꿔 받되 뜻은 그대로다 — 장소끼리 비교하지 않는다.
 * 지원 범위 밖(`OUT_OF_RANGE`)과 예측 없음(`NO_DATA`)은 둘 다 수준이 없다.
 */
const TIMING_LEVELS: Record<string, CrowdLevel> = {
  LOW: "QUIET",
  NORMAL: "NORMAL",
  HIGH: "BUSY",
};

export function toCrowdLevel(raw: string | null | undefined): CrowdLevel | null {
  return raw ? (TIMING_LEVELS[raw] ?? null) : null;
}

export function toForecastSummary(timing: BackendVisitTiming | null | undefined): PlaceForecastSummary {
  const level = toCrowdLevel(timing?.status);
  const quietDate = text(timing?.quietestDate);

  return {
    selectedDateLevel: level,
    quietDate,
    // 예측 자체를 못 받은 것과 판정이 없는 것을 구분하지 않고 둘 다 결측으로 둔다.
    // 빈 배지 자리는 `예측이 좋다`로 읽히므로 화면이 `예측 정보 없음`을 그린다.
    status: level === null && quietDate === null ? "MISSING" : toDataStatus(timing?.dataStatus),
    source: text(timing?.source),
    observedAt: text(timing?.collectedAt),
  };
}

/**
 * 관광지 관심도 — 정렬이 쓰는 값. 백엔드의 **온라인 언급량**이다.
 *
 * `AMBIGUOUS`(이름이 모호해 집계 불가)와 `COLLECTION_FAILED` 를 0 으로 읽지 않는다.
 * 둘 다 값이 없다는 뜻이고, 낮은 관심도가 아니다 (ADR-0006).
 */
function toInterest(attraction: BackendAttraction): Sourced<number> {
  const mention = attraction.onlineMention;
  const count = mention?.status === "COLLECTED" ? num(mention.count) : null;

  return {
    value: count,
    status: count === null ? "MISSING" : "OK",
    source: count === null ? null : "온라인 언급량",
    observedAt: text(mention?.collectedAt),
  };
}

/** 시·군 내부 중심관광지 순위. 미산정이면 값이 없다 — 꼴찌로 채우지 않는다. */
function toCenterRank(attraction: BackendAttraction): Sourced<number> {
  const value = num(attraction.centerRank);
  return {
    value,
    status: value === null ? "MISSING" : "OK",
    source: ATTRACTION_SOURCE,
    observedAt: text(attraction.baseAt),
  };
}

/** 백엔드 관광지 하나를 화면 계약의 `Place` 로 옮긴다. 식별자나 이름이 없으면 버린다. */
export function toPlace(raw: unknown): Place | null {
  const attraction = (raw ?? {}) as BackendAttraction;
  const placeId = text(attraction.contentId);
  const name = text(attraction.name);
  if (!placeId || !name) return null;

  const latitude = num(attraction.latitude);
  const longitude = num(attraction.longitude);

  return {
    placeId,
    name,
    photoUrl: text(attraction.imageUrl),
    address: text(attraction.address),
    coordinates: latitude !== null && longitude !== null ? { latitude, longitude } : null,
    category: contentTypeName(attraction.contentTypeId),
    regionCenterRank: toCenterRank(attraction),
    interest: toInterest(attraction),
    forecast: toForecastSummary(attraction.visitTiming),
  };
}
