/**
 * 한사나다 백엔드 관광지 목록 계약 (슬라이스 #2).
 *
 * 프론트엔드는 외부 관광 API를 직접 호출하지 않는다. 공급자 필드는 백엔드가
 * 이 계약으로 정규화한 뒤에만 화면에 들어온다.
 */

/** 외부 공급자 결과를 빈 값으로 위장하지 않고 그대로 전달하는 데이터 상태. */
export type DataStatus =
  /** 공급자 응답이 정상이고 최신이다. */
  | "OK"
  /** 캐시 만료 후 재조회에 실패해 최종 정상 데이터를 돌려준다. */
  | "STALE"
  /** 공급자가 해당 값을 제공하지 않는다. */
  | "MISSING"
  /** 공급자 호출이 실패했다. */
  | "UNAVAILABLE";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** 값과 그 값이 어디서 언제 왔는지를 함께 옮기는 봉투. 캡션 없이 화면에 올리지 않는다. */
export interface Sourced<T> {
  value: T | null;
  status: DataStatus;
  /** 공급자 이름. 예: `한국관광공사 KorService2`. */
  source: string | null;
  /** 기준 시점 (ISO-8601). */
  observedAt: string | null;
}

/**
 * 카드 한 장이 보여줄 만큼의 예측 (슬라이스 #6).
 *
 * 날짜 모드에 따라 둘 중 하나만 뜻을 가진다 — 고정 모드는 선택일의 수준, 유연 모드는
 * 한산 예상일. 둘 다 **그 장소 자신의 30일 분포 안에서** 나온 값이라 다른 장소와 비교하지
 * 않는다.
 */
export interface PlaceForecastSummary {
  /** 날짜 확정 탐색에서 선택일이 이 장소 기준으로 어느 수준인지. */
  selectedDateLevel: CrowdLevel | null;
  /** 날짜 유연 탐색에서 이 장소의 한산 예상일 (YYYY-MM-DD). */
  quietDate: string | null;
  status: DataStatus;
  source: string | null;
  observedAt: string | null;
}

export interface Place {
  /** 표준 관광지 식별자 — 공급자 간 매칭을 마친 한사나다 내부 식별자. */
  placeId: string;
  name: string;
  photoUrl: string | null;
  address: string | null;
  coordinates: Coordinates | null;
  /** 정규화된 분류. 예: `자연관광지`. */
  category: string | null;
  /** 시·군 내부 중심관광지 순위. 미산정이면 status가 `MISSING`이다. */
  regionCenterRank: Sourced<number>;
  /** 관광지 관심도 — 정렬용. 미산정이면 status가 `MISSING`이고 낮은 값이 아니다. */
  interest: Sourced<number>;
  forecast: PlaceForecastSummary;
}

/**
 * 목록이 검색으로 왔을 때 따라오는 정보. 무테마·무검색 목록이면 null이다.
 *
 * 결과 유형을 화면까지 들고 오는 이유는 두 유형의 **신뢰 수준이 다르기** 때문이다
 * — 지원 테마 결과만 추천 자격을 통과했다 (ADR-0003).
 */
export interface PlaceListSearch {
  resultType: SearchResultType;
  /** 적용된 지원 테마. 일반 검색이면 null. */
  appliedTheme: string | null;
  /** 백엔드가 공급자에게 실제로 보낸 검색어. 정규화 사실을 알릴 때 쓴다. */
  appliedQuery: string | null;
  /** 결과가 없을 때 제안하는 가까운 지원 테마. 억지 후보를 만들지 않는다. */
  suggestedThemes: string[];
}

export interface PlaceListResponse {
  places: Place[];
  /** 조회 범위 전체의 개수. `places`는 그중 첫 쪽이다. 모르면 null. */
  totalCount: number | null;
  /** 검색으로 온 목록이면 그 성격. 아니면 null. */
  search: PlaceListSearch | null;
  /**
   * 요청한 정렬이 실제로 적용됐는지. 거짓이면 화면이 그 사실을 밝힌다 —
   * 정렬 토글은 눌린 채로 두고 목록만 공급자 순서로 두면 거짓말이 된다.
   */
  sortApplied: boolean;
  /** 목록 전체의 데이터 상태 — 부분 결측은 각 필드의 status가 말한다. */
  status: DataStatus;
  source: string | null;
  observedAt: string | null;
}

/** 목록 조회가 실패했을 때 화면이 이름을 부를 수 있게 하는 실패 정보. */
export interface PlaceListFailure {
  /** 사용자에게 보여줄 실패한 데이터의 이름. */
  dataName: string;
  /** 개발자용 원인. 화면에 그대로 노출하지 않는다. */
  cause: string;
}

export type PlaceListResult =
  | { ok: true; data: PlaceListResponse }
  | { ok: false; failure: PlaceListFailure };

/* ─────────────────────────  방문 혼잡도 예측 (슬라이스 #6)  ───────────────────────── */

/**
 * 한 장소의 향후 30일을 **그 장소 자신의 분포 안에서** 비교한 수준.
 * 서로 다른 관광지의 값을 비교하지 않는다 — 절대 혼잡도가 아니다.
 */
export type CrowdLevel = "QUIET" | "NORMAL" | "BUSY";

export interface ForecastDay {
  /** YYYY-MM-DD. */
  date: string;
  /** 예측이 없는 날은 null이다. 낮은 값으로 대체하지 않는다. */
  level: CrowdLevel | null;
}

/** 한 장소의 30일 예측. 이 값들은 오직 같은 장소 안에서만 서로 비교된다. */
export interface CrowdForecast {
  days: ForecastDay[];
  /** 날짜 유연 탐색이 제안하는, 이 장소에서 상대적으로 한산한 예상일 (YYYY-MM-DD). */
  quietDate: string | null;
  status: DataStatus;
  source: string | null;
  observedAt: string | null;
}

/* ─────────────────────────  현재 접근 혼잡 (슬라이스 #8)  ───────────────────────── */

/** 도로 소통. 관습 문법(원활–서행–정체)을 그대로 쓴다. */
export type RoadFlow = "SMOOTH" | "SLOW" | "JAM";

export interface RoadStatus {
  flow: RoadFlow;
  /** 평균 통행 속도(km/h). 없으면 null. */
  speedKph: number | null;
  /** 어느 도로인지. 예: `주변 도로`, `진입로`. */
  label: string;
}

/**
 * 주차장 한 곳의 혼잡 등급. **잔여 비율(잔여면 ÷ 총 주차면)이다.**
 *
 * 방문 혼잡도 예측과 달리 여기서는 등급을 만들어도 된다 — 분모가 그 주차장 자신의
 * 총 주차면이라 뜻이 분명하고 공급자 기준을 추측할 필요가 없다. 그래도 이것은
 * **자리 수지 사람 수가 아니다.**
 */
export type ParkingCongestion = "PLENTY" | "MODERATE" | "CROWDED" | "FULL";

/**
 * 주차장이 있는지·실시간을 아는지를 말하는 축. `DataStatus` 와 **다른 축이다** —
 * 저쪽은 공급자 응답이 방금 받은 것인지를 말한다.
 *
 * `NONE` 과 `NO_DATA` 를 같은 문구로 표시하지 않는다. `물어봤는데 없더라` 와
 * `물어보지도 못했다` 는 다른 말이다.
 */
export type ParkingAvailability =
  /** 반경 안에 실시간 잔여면을 아는 주차장이 있다. */
  | "AVAILABLE"
  /** 주차장은 있으나 지금 자리가 있는지는 모른다 — 이름·총 주차면·거리까지. */
  | "STATIC_ONLY"
  /** 두 공급자를 확인했고 반경 안에 주차장이 없다. */
  | "NONE"
  /** 좌표가 없거나 공급자를 확인하지 못해 있다 없다를 말할 수 없다. */
  | "NO_DATA";

/**
 * 주차장 한 곳.
 *
 * 실시간을 아는 곳과 규모만 아는 곳이 **같은 목록에 섞여** 온다. 묶음의 상태가
 * `AVAILABLE` 이어도 목록의 모든 곳이 실시간인 것은 아니다 — 잔여면을 지어내지
 * 않으려면 각 곳의 `availableLots` 를 봐야 한다.
 */
export interface ParkingLot {
  name: string;
  coordinates: Coordinates | null;
  /** 관광지로부터의 거리(m). 반경 1km 안이다. */
  distanceMeters: number | null;
  /** 총 주차면. 정적 정보라 실시간 잔여면이 없어도 있을 수 있다. */
  totalLots: number | null;
  /** 실시간 잔여면. **null 이면 그 주차장은 규모만 아는 곳이다.** */
  availableLots: number | null;
  /** 잔여 비율 등급. 실시간이 없으면 null — 낮은 등급으로 대체하지 않는다. */
  congestion: ParkingCongestion | null;
  /** 실시간 값을 관측한 시각. 정적 정보뿐이면 null. */
  observedAt: string | null;
  /** 이 한 곳이 어느 공급자에서 왔는지. 묶음 전체의 출처와 다를 수 있다. */
  source: string | null;
}

export interface ParkingStatus {
  availability: ParkingAvailability;
  /** 최대 8곳. 실시간을 아는 곳이 앞에 온다. */
  lots: ParkingLot[];
  status: DataStatus;
  source: string | null;
  /** 실시간 관측 시각. 규모 정보뿐이면 null이라 `조회 시각`을 붙일 수 없다. */
  observedAt: string | null;
}

/**
 * 지금 현장에 닿는 부담. **미래 날짜의 인파도, 관광지 내부 밀집도도 아니다.**
 * 방문 혼잡도 예측과 반드시 다른 섹션·다른 형태로 표시한다 (ADR-0002).
 */
export interface CurrentAccess {
  roads: RoadStatus[];
  /** 항상 있다 — 주차를 확인하지 못한 것도 `availability` 가 말하는 한 상태다. */
  parking: ParkingStatus;
  status: DataStatus;
  source: string | null;
  /** 조회 시각 (ISO-8601). 도로·주차는 이 시각의 상태다. */
  observedAt: string | null;
}

/* ─────────────────────────  관광지 상세 (슬라이스 #7)  ───────────────────────── */

/** 연관 장소의 종류. 대체지 후보와 함께 가기 좋은 곳을 가르는 기준이다. */
export type RelatedKind =
  /** 원래 장소를 대신할 수 있는 관광지 — 추천 자격을 통과한 것만. */
  | "ALTERNATIVE"
  /** 같은 여행에서 함께 갈 음식점·숙박시설. 대체지가 아니다. */
  | "COMPANION";

/**
 * 연관 장소 한 곳.
 *
 * `Place`를 물려받지 않는다 — 공급자 연관 목록에는 **표준 관광지 식별자가 없다.**
 * 식별자가 없으니 상세로 이어지는 링크도 만들 수 없고, 지어낸 식별자로 링크를
 * 만들면 눌렀을 때 없는 장소로 간다. 이름과 종류까지만 말한다.
 */
export interface RelatedPlace {
  name: string;
  kind: RelatedKind;
  /** 음식점·숙박 등 세부 분류. 화면이 종류를 정확히 부를 수 있게 한다. */
  subtype: string | null;
  /** 어느 시·군의 장소인지. */
  regionName: string | null;
  /** 연관 순위 — 원래 장소와 얼마나 함께 언급되는지. 혼잡도가 아니다. */
  rank: number | null;
  /** 대체지 후보만 예측을 가진다 — 그것이 추천 자격이기 때문이다. */
  forecast: PlaceForecastSummary;
}

/**
 * 빈 목록의 이유. **두 이유를 같은 문구로 표시하지 않는다.**
 * 확인해 봤지만 자격을 통과한 곳이 없는 것과, 애초에 데이터를 못 얻은 것은 다르다.
 */
export type RelatedStatus =
  /** 자격을 통과한 장소가 담겼다. */
  | "AVAILABLE"
  /** 공급자 연관 데이터를 얻지 못했거나 이 관광지가 연관 목록에 없다. */
  | "NO_RELATED_DATA"
  /** 연관 장소는 받았지만 추천 자격을 통과한 곳이 없다. */
  | "NONE_QUALIFIED";

export interface RelatedPlacesGroup {
  status: RelatedStatus;
  places: RelatedPlace[];
  source: string | null;
  observedAt: string | null;
}

/**
 * 상세는 카드 요약이 아니라 **30일 전체**를 싣는다. 그래서 `forecast`의 뜻이 다르고,
 * 목록용 요약을 그대로 물려받지 않는다.
 */
export interface PlaceDetail extends Omit<Place, "forecast"> {
  description: string | null;
  forecast: CrowdForecast;
  currentAccess: CurrentAccess;
  /** 추천 자격을 통과한 관광지만 들어온다. 큐레이션이 이 경계를 우회하지 못한다. */
  alternatives: RelatedPlacesGroup;
  companions: RelatedPlacesGroup;
  status: DataStatus;
  source: string | null;
  observedAt: string | null;
}

export type PlaceDetailResult =
  | { ok: true; data: PlaceDetail }
  | { ok: false; failure: PlaceListFailure };

/* ─────────────────────────  검색 (슬라이스 #5)  ───────────────────────── */

/**
 * 결과가 어떤 성격인지. 지원 테마 결과만 추천 자격과 대체지 큐레이션을 통과했다는
 * 뜻을 가진다 — 일반 검색 결과에 그 보증을 붙이지 않는다 (ADR-0003).
 */
export type SearchResultType = "SUPPORTED_THEME" | "GENERAL_SEARCH";

export interface SearchResponse {
  resultType: SearchResultType;
  /** 적용된 지원 테마. 일반 검색이면 null. */
  appliedTheme: string | null;
  /** 사용자가 실제로 입력한 말. 정규화 사실을 문장으로 알릴 때 쓴다. */
  rawQuery: string | null;
  /** 결과가 없을 때 제안하는 가까운 지원 테마. 억지 후보를 만들지 않는다. */
  suggestedThemes: string[];
  places: Place[];
  status: DataStatus;
  source: string | null;
  observedAt: string | null;
}

export type SearchResult =
  | { ok: true; data: SearchResponse }
  | { ok: false; failure: PlaceListFailure };

/* ─────────────────────────  지역 방문 규모 (슬라이스 #3)  ───────────────────────── */

/**
 * 같은 기준 기간 안에서 **조회한 시·군끼리** 견준 상대 구간.
 *
 * 절대 등급이 아니다 — 다른 기간이나 다른 지역 집합의 구간과 비교하지 않는다.
 * 그리고 이것은 지역 단위 방문 규모지 관광지의 혼잡도가 아니다 (ADR-0006).
 */
export type RegionVisitLevel = "VERY_HIGH" | "HIGH" | "MEDIUM" | "LOW" | "VERY_LOW";

export interface RegionVisitScale {
  /** 백엔드 관광지 조회가 쓰는 시·군구 코드. 탐색 범위 조건이 되는 값이다. */
  sigunguCode: string;
  /** 행정구역 코드. 지도 경계 데이터와 잇는 값이다. */
  lawdCode: string | null;
  name: string;
  /** 외지인·외국인 방문자 수 추정치. 현지인은 빠져 있고, 실제 관광객 수가 아니다. */
  visitorCount: number | null;
  /** 값을 얻지 못한 시·군은 null이다. 최하 구간으로 칠하지 않는다. */
  level: RegionVisitLevel | null;
  rank: number | null;
  status: DataStatus;
}

export interface RegionVisitScaleResponse {
  regions: RegionVisitScale[];
  /** 기준 기간 시작 (YYYY-MM-DD). 공급자 공개가 늦어 오늘과 한 달 가까이 떨어져 있다. */
  periodStart: string | null;
  periodEnd: string | null;
  status: DataStatus;
  source: string | null;
}

export type RegionVisitScaleResult =
  | { ok: true; data: RegionVisitScaleResponse }
  | { ok: false; failure: PlaceListFailure };

/* ─────────────────────────  저장된 식별자 재조회 (슬라이스 #9)  ───────────────────────── */

/**
 * 저장해 둔 한 곳의 지금 상태.
 *
 * `UNAVAILABLE` 을 `NOT_FOUND` 처럼 다루지 않는다 — 저장한 곳이 사라진 것처럼 보이고
 * 지우라는 안내까지 받게 된다. 다시 조회하면 돌아오는 값이다.
 */
export type CollectionItemStatus =
  /** 최신 표시정보를 얻었다. */
  | "AVAILABLE"
  /** 공급자에 더 이상 없는 식별자다. 저장 목록에서 정리해도 된다. */
  | "NOT_FOUND"
  /** 공급자를 부르지 못해 **이번에는** 확인하지 못했다. 사라진 것이 아니다. */
  | "UNAVAILABLE";

export interface CollectionItem {
  placeId: string;
  status: CollectionItemStatus;
  /** 최신 표시정보. `AVAILABLE`이 아니면 null이고, 저장 당시 정보가 그 자리를 지킨다. */
  place: Place | null;
}

export interface CollectionLookupResponse {
  items: CollectionItem[];
  source: string | null;
}

export type CollectionLookupResult =
  | { ok: true; data: CollectionLookupResponse }
  | { ok: false; failure: PlaceListFailure };
