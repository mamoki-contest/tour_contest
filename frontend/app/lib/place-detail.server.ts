import type {
  CrowdForecast,
  CurrentAccess,
  ForecastDay,
  ParkingAvailability,
  ParkingCongestion,
  ParkingLot,
  ParkingStatus,
  PlaceDetail,
  PlaceDetailResult,
  RelatedKind,
  RelatedPlace,
  RelatedPlacesGroup,
  RelatedStatus,
  RoadFlow,
  RoadStatus,
} from "./contract";
import {
  contentTypeName,
  fetchEnvelope,
  num,
  text,
  toCrowdLevel,
  toDataStatus,
  toForecastSummary,
  type BackendDataStatus,
  type BackendVisitTiming,
} from "./backend.server";

/**
 * 관광지 상세 조회 (슬라이스 #7·#8). 서버에서만 실행된다.
 *
 * 다섯 섹션이 각각 독립 상태를 가진다 — 한 섹션의 결측이나 실패가 다른 섹션을
 * 무너뜨리지 않게 계약 단계에서부터 따로 받는다.
 */

const DETAIL_DATA_NAME = "관광지 정보";

interface BackendRelatedPlace {
  name?: string | null;
  kind?: "ATTRACTION" | "RESTAURANT" | "LODGING" | "OTHER" | null;
  categoryLarge?: string | null;
  categoryMiddle?: string | null;
  categorySmall?: string | null;
  lawdCode?: string | null;
  regionName?: string | null;
  rank?: number | null;
  eligibleAsAlternative?: boolean | null;
  visitTiming?: BackendVisitTiming | null;
}

interface BackendRelatedPlacesView {
  status?: RelatedStatus | null;
  items?: (BackendRelatedPlace | null)[] | null;
  dataStatus?: BackendDataStatus | null;
  baseYm?: string | null;
  collectedAt?: string | null;
  source?: string | null;
}

interface BackendParkingLot {
  name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distanceMeters?: number | null;
  totalLots?: number | null;
  /** 점유 대수. 잔여면은 백엔드가 이미 빼서 `availableLots` 로 준다 — 여기서 다시 계산하지 않는다. */
  occupiedLots?: number | null;
  availableLots?: number | null;
  congestion?: string | null;
  observedAt?: string | null;
  source?: string | null;
}

interface BackendParking {
  status?: string | null;
  dataStatus?: BackendDataStatus | null;
  lots?: (BackendParkingLot | null)[] | null;
  observedAt?: string | null;
  source?: string | null;
}

interface BackendDetail {
  contentId?: string | null;
  name?: string | null;
  imageUrl?: string | null;
  address?: string | null;
  overview?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  contentTypeId?: string | null;
  baseAt?: string | null;
  dataStatus?: BackendDataStatus | null;
  collectedAt?: string | null;
  source?: string | null;
  visitTiming?: BackendVisitTiming | null;
  dailyForecast?: ({ date?: string | null; status?: string | null } | null)[] | null;
  currentAccess?: {
    road?: {
      status?: BackendDataStatus | null;
      averageSpeed?: number | null;
      roads?: ({ roadName?: string | null; averageSpeed?: number | null } | null)[] | null;
      observedAt?: string | null;
    } | null;
    parking?: BackendParking | null;
    checkedAt?: string | null;
    source?: string | null;
  } | null;
  alternatives?: BackendRelatedPlacesView | null;
  companions?: BackendRelatedPlacesView | null;
}

/**
 * 30일 예측 격자. 백엔드는 지원 범위 30일을 하루씩 판정해 보낸다.
 * 판정이 없는 날은 칸을 비운다 — 낮은 값으로 채우면 한산한 날로 읽힌다.
 */
function toForecast(detail: BackendDetail): CrowdForecast {
  const timing = detail.visitTiming;

  const days: ForecastDay[] = Array.isArray(detail.dailyForecast)
    ? detail.dailyForecast
        .map((entry) => {
          const date = text(entry?.date);
          return date ? { date, level: toCrowdLevel(entry?.status) } : null;
        })
        .filter((day): day is ForecastDay => day !== null)
    : [];

  return {
    days,
    quietDate: text(timing?.quietestDate),
    status: days.length === 0 ? "MISSING" : toDataStatus(timing?.dataStatus),
    source: text(timing?.source),
    observedAt: text(timing?.collectedAt),
  };
}

/**
 * 평균 통행 속도를 소통 등급으로 옮긴다.
 *
 * 백엔드는 속도만 주고 등급을 붙이지 않는다. 일반도로 기준(원활 25km/h 이상,
 * 서행 15~25km/h, 정체 15km/h 미만)을 여기서 적용하고, 화면은 등급 옆에
 * **항상 원래 속도를 함께** 보여준다 — 등급만 남기면 판단 근거가 사라진다.
 */
function toFlow(speedKph: number): RoadFlow {
  if (speedKph >= 25) return "SMOOTH";
  if (speedKph >= 15) return "SLOW";
  return "JAM";
}

/**
 * 아는 이름만 통과시킨다. 모르는 값을 기본 등급으로 떨어뜨리면 공급자가 넓힌
 * 어휘가 조용히 `여유`나 `만차`로 둔갑한다.
 */
const PARKING_CONGESTIONS: Record<string, ParkingCongestion> = {
  PLENTY: "PLENTY",
  MODERATE: "MODERATE",
  CROWDED: "CROWDED",
  FULL: "FULL",
};

const PARKING_AVAILABILITIES: Record<string, ParkingAvailability> = {
  AVAILABLE: "AVAILABLE",
  STATIC_ONLY: "STATIC_ONLY",
  NONE: "NONE",
  NO_DATA: "NO_DATA",
};

/**
 * 주차 여건.
 *
 * 두 공급자가 겹쳐 오기 때문에 **묶음의 상태와 각 주차장의 실시간 여부가 따로 논다.**
 * `AVAILABLE` 은 `반경 안에 실시간을 아는 곳이 하나라도 있다`는 뜻이지 목록이 전부
 * 실시간이라는 뜻이 아니다 — 실측에서 경포해수욕장은 여덟 곳 중 한 곳만 실시간이었다.
 * 그래서 잔여면은 묶음이 아니라 **주차장 한 곳씩** 판단한다.
 *
 * 모르는 상태 이름은 `NO_DATA` 로 받는다. `NONE`(확인했고 없다)으로 떨어뜨리면
 * 확인하지 못한 곳을 주차장이 없는 곳이라고 말하게 된다.
 */
export function toParking(raw: BackendParking | null | undefined): ParkingStatus {
  const lots: ParkingLot[] = Array.isArray(raw?.lots)
    ? raw.lots
        .map((entry): ParkingLot | null => {
          const name = text(entry?.name);
          // 이름 없는 주차장은 화면에서 가리킬 수가 없다.
          if (!name) return null;

          const latitude = num(entry?.latitude);
          const longitude = num(entry?.longitude);
          const availableLots = num(entry?.availableLots);

          return {
            name,
            coordinates:
              latitude !== null && longitude !== null ? { latitude, longitude } : null,
            distanceMeters: num(entry?.distanceMeters),
            totalLots: num(entry?.totalLots),
            availableLots,
            // 잔여면을 모르는 곳에 등급만 남기지 않는다 — 근거 없는 등급이 된다.
            congestion:
              availableLots === null
                ? null
                : (PARKING_CONGESTIONS[text(entry?.congestion) ?? ""] ?? null),
            observedAt: text(entry?.observedAt),
            source: text(entry?.source),
          };
        })
        .filter((lot): lot is ParkingLot => lot !== null)
    : [];

  return {
    availability: PARKING_AVAILABILITIES[text(raw?.status) ?? ""] ?? "NO_DATA",
    lots,
    status: raw ? toDataStatus(raw.dataStatus) : "MISSING",
    source: text(raw?.source),
    observedAt: text(raw?.observedAt),
  };
}

function toCurrentAccess(detail: BackendDetail): CurrentAccess {
  const access = detail.currentAccess;
  const road = access?.road;

  const roads: RoadStatus[] = Array.isArray(road?.roads)
    ? road.roads
        .map((entry): RoadStatus | null => {
          const label = text(entry?.roadName);
          const speedKph = num(entry?.averageSpeed);
          // 속도가 없으면 등급도 지어내지 않는다 — 그 도로를 빼는 편이 맞다.
          if (!label || speedKph === null) return null;
          return { flow: toFlow(speedKph), speedKph: Math.round(speedKph * 10) / 10, label };
        })
        .filter((entry): entry is RoadStatus => entry !== null)
    : [];

  return {
    roads,
    parking: toParking(access?.parking),
    status: roads.length === 0 ? "MISSING" : toDataStatus(road?.status),
    source: text(access?.source),
    // 도로 관측 시각이 있으면 그쪽이 맞다 — 우리가 조회한 시각이 아니라 도로의 시각이다.
    observedAt: text(road?.observedAt) ?? text(access?.checkedAt),
  };
}

const RELATED_KINDS: Record<string, RelatedKind> = {
  ATTRACTION: "ALTERNATIVE",
  RESTAURANT: "COMPANION",
  LODGING: "COMPANION",
  OTHER: "COMPANION",
};

/**
 * 연관 장소 묶음.
 *
 * 대체지 자리에는 `eligibleAsAlternative` 가 참인 관광지만 담는다 — 순위가 높다는
 * 이유로 자격 없는 곳이 흘러들지 않게 경계에서 한 번 더 막는다. 음식점이 대체지로
 * 넘어오는 일도 같은 검사에서 걸린다.
 */
function toRelatedGroup(
  view: BackendRelatedPlacesView | null | undefined,
  expected: RelatedKind,
): RelatedPlacesGroup {
  const places: RelatedPlace[] = Array.isArray(view?.items)
    ? view.items
        .map((entry) => {
          const name = text(entry?.name);
          if (!name) return null;

          const kind = RELATED_KINDS[entry?.kind ?? ""] ?? null;
          if (kind !== expected) return null;
          if (expected === "ALTERNATIVE" && entry?.eligibleAsAlternative !== true) return null;

          return {
            name,
            kind: expected,
            subtype: text(entry?.categorySmall) ?? text(entry?.categoryMiddle),
            regionName: text(entry?.regionName),
            rank: num(entry?.rank),
            forecast: toForecastSummary(entry?.visitTiming),
          };
        })
        .filter((place): place is RelatedPlace => place !== null)
    : [];

  // 담긴 곳이 없는데 백엔드가 `AVAILABLE` 이라고 했다면, 자격에서 걸러진 것이다.
  const reported = view?.status;
  const status: RelatedStatus =
    reported === "NO_RELATED_DATA"
      ? "NO_RELATED_DATA"
      : places.length === 0
        ? "NONE_QUALIFIED"
        : "AVAILABLE";

  return {
    status,
    places,
    source: text(view?.source),
    observedAt: text(view?.collectedAt),
  };
}

function toDetail(raw: unknown): PlaceDetail | null {
  const detail = (raw ?? {}) as BackendDetail;
  const placeId = text(detail.contentId);
  const name = text(detail.name);
  if (!placeId || !name) return null;

  const latitude = num(detail.latitude);
  const longitude = num(detail.longitude);

  return {
    placeId,
    name,
    photoUrl: text(detail.imageUrl),
    address: text(detail.address),
    coordinates: latitude !== null && longitude !== null ? { latitude, longitude } : null,
    category: contentTypeName(detail.contentTypeId),
    regionCenterRank: {
      // 상세에는 중심관광지 순위가 없다. 목록의 값을 물려받지 않는다 — 없는 값이다.
      value: null,
      status: "MISSING",
      source: text(detail.source),
      observedAt: text(detail.baseAt),
    },
    /*
     * 상세 응답에는 세 신호가 없다. 목록에서 본 값을 물려받지 않는다 — 없는 값이다.
     * 언급량은 `COLLECTION_FAILED`(값을 얻지 못함)이지 `0건`이 아니고, TMAP·입장객도
     * 미수록·미집계이지 낮은 순위나 `0명`이 아니다.
     */
    onlineMention: { status: "COLLECTION_FAILED", count: null, collectedAt: null, ruleVersion: null },
    tmapRank: { status: "NOT_AVAILABLE", rank: null, period: null },
    visitorStats: { status: "NOT_IMPORTED", count: null, period: null, countStatus: null },
    description: text(detail.overview),
    forecast: toForecast(detail),
    currentAccess: toCurrentAccess(detail),
    alternatives: toRelatedGroup(detail.alternatives, "ALTERNATIVE"),
    companions: toRelatedGroup(detail.companions, "COMPANION"),
    status: toDataStatus(detail.dataStatus),
    source: text(detail.source),
    observedAt: text(detail.collectedAt),
  };
}

/**
 * 없는 관광지인지, 부르지 못한 것인지.
 *
 * 백엔드는 없는 식별자에만 404(`404-1`)를 준다. 시간 초과·연결 실패는 응답을 받기
 * 전이라 상태 자체가 없고, 500 대는 다시 부르면 달라질 수 있다 — **재시도가
 * 무의미한 경우만** 참이다.
 */
export function isNotFound(status: number | undefined): boolean {
  return status === 404;
}

export async function fetchPlaceDetail(
  placeId: string,
  signal?: AbortSignal,
): Promise<PlaceDetailResult> {
  const result = await fetchEnvelope<unknown>(
    `/api/v1/attractions/${encodeURIComponent(placeId)}`,
    new URLSearchParams(),
    DETAIL_DATA_NAME,
    signal,
  );

  if (!result.ok) {
    return { ok: false, failure: { ...result.failure, notFound: isNotFound(result.failure.status) } };
  }

  const detail = toDetail(result.data);
  return detail
    ? { ok: true, data: detail }
    : {
        ok: false,
        failure: {
          dataName: DETAIL_DATA_NAME,
          cause: "응답이 계약을 벗어났습니다.",
          // 계약을 벗어난 응답은 없는 곳이 아니라 고장이다. 다시 불러 볼 값이 있다.
          notFound: false,
        },
      };
}
