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
