/**
 * 저장된 계약 응답 — 백엔드 배포 전에 카드 구조와 네 상태를 확인하기 위한 표본이다.
 * `PLACES_SAVED_CONTRACT=true`일 때만 쓰이고, 화면은 이것이 실제 조회 결과가
 * 아니라는 사실을 사용자에게 밝힌다. 실제 관측값이 아니므로 어떤 판단에도 쓰지 않는다.
 *
 * 표본은 **부분 결측을 일부러 섞는다** — 이 제품에서 가장 흔한 상태이기 때문이다.
 */

const KOR_SERVICE = "한국관광공사 KorService2";
const TMAP_INTEREST = "티맵 관광지 관심지점 집계";
const FORECAST_SOURCE = "한국관광콘텐츠랩 TatsCnctrRateService";

/** 오늘 기준 상대 날짜로 만든다 — 30일 창 밖으로 밀려 나가지 않게. */
function inDays(days: number): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days))
    .toISOString()
    .slice(0, 10);
}

const OBSERVED_AT = "2026-09-01T00:00:00+09:00";

export const savedContractResponse = {
  status: "OK",
  source: TMAP_INTEREST,
  observedAt: OBSERVED_AT,
  places: [
    {
      placeId: "hsnd-sample-1",
      name: "주문진 해수욕장",
      photoUrl: null,
      address: "강원특별자치도 강릉시 주문진읍",
      coordinates: { latitude: 37.9, longitude: 128.83 },
      category: "자연관광지",
      regionCenterRank: { value: 3, status: "OK", source: KOR_SERVICE, observedAt: OBSERVED_AT },
      interest: { value: 8200, status: "OK", source: TMAP_INTEREST, observedAt: OBSERVED_AT },
      forecast: {
        selectedDateLevel: "QUIET",
        quietDate: inDays(9),
        status: "OK",
        source: FORECAST_SOURCE,
        observedAt: OBSERVED_AT,
      },
    },
    {
      placeId: "hsnd-sample-2",
      name: "정동진 모래시계공원",
      photoUrl: null,
      address: "강원특별자치도 강릉시 강동면",
      coordinates: { latitude: 37.69, longitude: 129.03 },
      category: "관광지",
      regionCenterRank: { value: 7, status: "OK", source: KOR_SERVICE, observedAt: OBSERVED_AT },
      interest: { value: 5100, status: "OK", source: TMAP_INTEREST, observedAt: OBSERVED_AT },
      forecast: {
        selectedDateLevel: "BUSY",
        quietDate: inDays(16),
        status: "OK",
        source: FORECAST_SOURCE,
        observedAt: OBSERVED_AT,
      },
    },
    {
      placeId: "hsnd-sample-3",
      name: "삼척 장호항",
      photoUrl: null,
      address: "강원특별자치도 삼척시 근덕면",
      coordinates: { latitude: 37.32, longitude: 129.26 },
      category: "자연관광지",
      // 미산정 — 값이 없다는 사실 자체를 계약으로 전달한다
      regionCenterRank: { value: null, status: "MISSING", source: KOR_SERVICE, observedAt: OBSERVED_AT },
      interest: { value: null, status: "MISSING", source: TMAP_INTEREST, observedAt: OBSERVED_AT },
      // 예측도 없다 — 카드는 뜨고 배지만 `예측 정보 없음`인 상태가 정상이다
      forecast: {
        selectedDateLevel: null,
        quietDate: null,
        status: "MISSING",
        source: FORECAST_SOURCE,
        observedAt: OBSERVED_AT,
      },
    },
  ],
};

/** 관광지 상세 표본 (슬라이스 #7·#8). 섹션마다 다른 상태를 섞어 격리를 확인한다. */
export const savedDetailResponses: Record<string, unknown> = {
  "hsnd-sample-1": {
    placeId: "hsnd-sample-1",
    name: "주문진 해수욕장",
    photoUrl: null,
    address: "강원특별자치도 강릉시 주문진읍",
    coordinates: { latitude: 37.9, longitude: 128.83 },
    category: "자연관광지",
    description:
      "동해안 북부의 넓은 백사장과 완만한 수심으로 알려진 해수욕장이에요. 주문진항이 가까워 회센터와 함께 들르기 좋아요.",
    regionCenterRank: { value: 3, status: "OK", source: KOR_SERVICE, observedAt: OBSERVED_AT },
    interest: { value: 8200, status: "OK", source: TMAP_INTEREST, observedAt: OBSERVED_AT },
    status: "OK",
    source: KOR_SERVICE,
    observedAt: OBSERVED_AT,
    forecast: {
      days: [
        ...Array.from({ length: 31 }, (_, index) => ({
          date: inDays(index),
          // 주말을 혼잡, 그 앞뒤를 보통, 나머지를 한산으로 둔 표본
          level: [0, 6].includes((new Date(inDays(index)).getUTCDay() + 7) % 7)
            ? "BUSY"
            : index % 5 === 0
              ? "NORMAL"
              : "QUIET",
        })),
      ],
      quietDate: inDays(9),
      status: "OK",
      source: FORECAST_SOURCE,
      observedAt: OBSERVED_AT,
    },
    currentAccess: {
      roads: [
        { flow: "SMOOTH", speedKph: 48, label: "주변 도로" },
        { flow: "SLOW", speedKph: 21, label: "진입로" },
      ],
      // 주차 실시간 정보가 없는 장소 — 잔여면을 지어내지 않는다
      parking: null,
      status: "OK",
      source: "국가교통정보센터",
      observedAt: "2026-09-04T14:20:00+09:00",
    },
    alternatives: [
      {
        placeId: "hsnd-sample-3",
        name: "삼척 장호항",
        photoUrl: null,
        address: "강원특별자치도 삼척시 근덕면",
        coordinates: { latitude: 37.32, longitude: 129.26 },
        category: "자연관광지",
        kind: "ALTERNATIVE",
        subtype: null,
        regionCenterRank: { value: null, status: "MISSING", source: KOR_SERVICE, observedAt: OBSERVED_AT },
        interest: { value: null, status: "MISSING", source: TMAP_INTEREST, observedAt: OBSERVED_AT },
        forecast: {
          selectedDateLevel: "QUIET",
          quietDate: inDays(4),
          status: "OK",
          source: FORECAST_SOURCE,
          observedAt: OBSERVED_AT,
        },
      },
    ],
    companions: [
      {
        placeId: "hsnd-companion-1",
        name: "주문진 수산시장",
        photoUrl: null,
        address: "강원특별자치도 강릉시 주문진읍",
        coordinates: { latitude: 37.9, longitude: 128.82 },
        category: "음식점",
        kind: "COMPANION",
        subtype: "음식점",
        regionCenterRank: { value: null, status: "MISSING", source: KOR_SERVICE, observedAt: OBSERVED_AT },
        interest: { value: null, status: "MISSING", source: TMAP_INTEREST, observedAt: OBSERVED_AT },
        forecast: { selectedDateLevel: null, quietDate: null, status: "MISSING", source: null, observedAt: null },
      },
    ],
  },
};
