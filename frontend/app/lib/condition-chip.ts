import { formatCalendarDate } from "./forecast-window";
import type { DateMode } from "./explore-params";

/**
 * 검색 조건 칩이 무엇이라고 말할지 (#43).
 *
 * 칩에는 두 겹이 있다 — 눈에 보이는 값과, 화면 낭독기만 읽는 숨은 라벨. 둘이 같은
 * 것을 가리켜야 한다. 그런데 라벨이 `테마` 로 고정돼 있어서 `커피` 를 찾아 본
 * 사람에게는 `테마: '커피' 검색` 으로 읽혔다. 커피는 지원 테마 8개 중 하나가 아니고,
 * 일반 검색 결과는 테마 결과와 신뢰 수준이 다르다 (ADR-0003) — 목록 위 안내문은
 * 그 차이를 이미 말하고 있는데 칩만 테마라고 우기는 셈이었다.
 *
 * 그래서 라벨까지 함께 정한다. 테마인 것과 그냥 찾아 본 말은 칩에서도 갈라 둔다.
 */
export interface ConditionChipText {
  /** 화면 낭독기가 값 앞에 읽는 숨은 라벨. */
  label: string;
  /** 칩에 보이는 값. */
  value: string;
}

/**
 * @param theme 적용된 지원 테마 — 입력을 정규화해 얻은 것도 포함한다. 없으면 null.
 * @param query 정규화되지 않은 자유 입력어. 없으면 null.
 */
export function searchConditionChip(theme: string | null, query: string | null): ConditionChipText {
  if (theme) return { label: "테마", value: theme };
  // 값에 `검색` 을 붙이지 않는다 — 그 말은 이미 라벨이 하고 있다.
  if (query) return { label: "검색", value: `'${query}'` };
  return { label: "테마", value: "무테마" };
}

/**
 * 날짜 칩이 무엇이라고 말할지 (#53).
 *
 * 세 상태가 **칩에서 서로 달라야 한다.** 전에는 `한산한 날에 갈래요` 를 고른 화면도
 * 첫 진입과 똑같이 `날짜 미정` 이라고 말했다 — 사용자가 고른 것을 칩이 부정하는데
 * 카드에는 그 예측이 떠 있으니, 어느 쪽이 지금 걸린 조건인지 알 길이 없었다.
 *
 * @param date 확정 모드의 선택일 (YYYY-MM-DD). 다른 모드에서는 쓰지 않는다.
 */
export function dateConditionValue(dateMode: DateMode, date: string | null): string {
  if (dateMode === "FIXED" && date) return formatCalendarDate(date);
  if (dateMode === "FLEXIBLE") return "한산한 날";
  return "날짜 미정";
}
