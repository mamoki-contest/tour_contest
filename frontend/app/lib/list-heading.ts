/**
 * 시트 헤더 문구 (#25).
 *
 * 헤더는 **지금 걸린 조회 범위**를 말한다. 오래 `이 지도 범위 N곳` 하나로 고정돼
 * 있어서, 춘천시를 골라도 테마로 찾아도 지도가 아예 안 떠도 같은 문장이었다 —
 * 조건 칩이 말하는 범위와 목록이 말하는 범위가 달라 어느 쪽을 믿을지 알 수 없었다.
 */

export interface ListHeadingInput {
  /** 지도 경계가 확정돼 있는지. 확정됐을 때만 `이 지도 범위`라고 말할 수 있다. */
  hasBounds: boolean;
  /** 선택된 시·군 이름. null이면 강원 전체. */
  regionLabel: string | null;
  /** 적용된 테마 이름 — 사용자가 고른 칩이거나 백엔드가 정규화한 테마. */
  theme: string | null;
  /** 테마로 정규화되지 않은 자유 검색어. */
  query: string | null;
  /** 조회 범위 전체의 개수. 모르면 null이고 헤더는 범위만 말한다. */
  count: number | null;
}

/** 어디에서 찾았는지. 강원 전체는 다른 조건과 겹칠 때 생략된다. */
function scopeLabel(input: ListHeadingInput): string | null {
  if (input.hasBounds) return "이 지도 범위";
  return input.regionLabel;
}

/** 무엇을 찾았는지. 테마가 있으면 테마, 없으면 검색어, 둘 다 없으면 없다. */
function subjectLabel(input: ListHeadingInput): string | null {
  if (input.theme) return input.theme;
  return input.query ? `'${input.query}' 검색` : null;
}

export function listHeading(input: ListHeadingInput): string {
  const scope = scopeLabel(input);
  const subject = subjectLabel(input);

  // 무엇을 찾았는지가 있으면 그것이 주어다. 어디에서 찾았는지는 기본값(강원 전체)이
  // 아닐 때만 앞에 붙는다 — `강원 전체 해수욕장`은 아무것도 좁히지 않은 말이다.
  const label = subject ? [scope, subject].filter(Boolean).join(" ") : (scope ?? "강원 전체");

  return input.count === null ? label : `${label} ${input.count.toLocaleString("ko-KR")}곳`;
}
