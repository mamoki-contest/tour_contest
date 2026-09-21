import type { CrowdLevel, Place, PlaceForecastSummary } from "./contract";
import type { DateMode } from "./explore-params";

/**
 * 목록 카드가 화면에 내놓는 것 전부 (#49).
 *
 * 카드는 **이름·주소·분류**만 말한다. 온라인 언급량·TMAP 검색순위·입장객 수·중심관광지
 * 순위는 계속 응답에 오고 정렬과 상세가 계속 쓰지만, 카드에는 오지 않는다 — 셋을 다
 * 적으면 카드 한 장이 여섯 줄이 되고, 사용자가 목록에서 실제로 하는 일(어디를 눌러
 * 볼지 고르기)에 그 여섯 줄이 도움이 되지 않았다.
 *
 * **이 타입이 그 규칙의 집행자다.** 카드가 그릴 수 있는 것은 여기 있는 필드뿐이고,
 * 입력도 `Pick` 으로 좁혀 두어 함수가 제거된 신호에 손을 뻗을 수조차 없다. 규칙이
 * 주석이 아니라 타입에 있어야, 다음 사람이 카드에 한 줄 더 얹는 일이 눈에 띈다.
 */
export interface CardFacts {
  photoUrl: string | null;
  name: string;
  address: string | null;
  /** 정규화된 분류 태그. 예: `레포츠` · `쇼핑` · `음식점`. */
  category: string | null;
  /** 날짜 조건이 걸렸을 때만 생긴다. 예측이 없으면 null이고, 카드는 그 자리를 비운다. */
  dateBadge: CardDateBadge | null;
}

/**
 * 날짜 조건이 붙은 카드의 유일한 예측 표시.
 *
 * 두 모드가 **다른 것을 묻기 때문에** 모양도 둘이다: 확정 모드는 고른 날 하루가 이
 * 장소 기준 어느 수준인지, 유연 모드는 이 장소가 언제 한산할 것으로 보이는지.
 */
export type CardDateBadge =
  | { kind: "LEVEL"; level: CrowdLevel }
  | { kind: "QUIET_DATE"; date: string };

/**
 * 카드가 무엇을 렌더할지 정하는 순수 함수.
 *
 * 입력이 `Place` 전체가 아니라 다섯 필드인 것이 의도다 — 지워 낸 신호는 타입에
 * 없으므로 여기서 다시 꺼낼 수 없다.
 */
export function cardFacts(
  place: Pick<Place, "photoUrl" | "name" | "address" | "category" | "forecast">,
  dateMode: DateMode,
): CardFacts {
  return {
    photoUrl: place.photoUrl,
    name: place.name,
    address: place.address,
    category: place.category,
    dateBadge: dateBadge(place.forecast, dateMode),
  };
}

/**
 * 날짜를 묻지 않았으면 예측도 내놓지 않는다 (#53).
 *
 * `NONE` 은 첫 진입의 상태다. 이 자리에서 한산 예상일을 그리면, 사용자가 고르지도
 * 않은 조건의 결과를 카드가 사실처럼 말하게 된다 — 조건 칩은 `날짜 미정` 이라고
 * 말하는데 카드만 다른 이야기를 하던 것이 #53의 증상이었다.
 *
 * 예측이 없으면 **배지 자체를 그리지 않는다** — `예측 정보 없음` 점선 배지도 두지 않는다.
 *
 * 전에는 빈자리가 `예측이 좋다`로 읽힐까 봐 자리를 지켰다. 그 걱정은 카드가 배지를
 * 여섯 개씩 달고 있을 때의 것이다. 지금 카드에서 예측 배지는 **날짜 조건이 걸렸을 때
 * 생기는 단 하나**라서, 없으면 아무 색도 아무 글자도 없다 — `보통`(회색 면에 글자)
 * 으로도 `한산`(파랑 틴트)으로도 읽히지 않는다. 대신 빈 카드가 `모른다`는 뜻이라는
 * 사실은 도움말이 말한다.
 *
 * 두 모드의 값을 서로 대신 쓰지 않는다. 확정 모드에서 예측이 없다고 한산 예상일을
 * 대신 띄우면, 사용자가 고른 날짜가 아닌 다른 날의 이야기가 슬쩍 끼어든다.
 */
function dateBadge(forecast: PlaceForecastSummary, dateMode: DateMode): CardDateBadge | null {
  if (dateMode === "NONE") return null;

  if (dateMode === "FIXED") {
    return forecast.selectedDateLevel === null
      ? null
      : { kind: "LEVEL", level: forecast.selectedDateLevel };
  }

  return forecast.quietDate === null ? null : { kind: "QUIET_DATE", date: forecast.quietDate };
}
