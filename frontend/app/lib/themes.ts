/**
 * 지원 테마 (ADR-0003).
 *
 * 이 여덟 개만 동의어·관광지 유형·큐레이션 근거가 함께 관리되어 테마 적합성을 보장한다.
 * **동의어와 오타 정규화는 백엔드가 한다** — 프론트는 목록을 보여주고 결과 유형을 표시할 뿐,
 * 어떤 입력이 어떤 테마가 되는지 스스로 판정하지 않는다.
 */
export const SUPPORTED_THEMES = [
  "벚꽃",
  "꽃축제",
  "해수욕장",
  "계곡",
  "단풍",
  "억새",
  "눈꽃",
  "해돋이",
] as const;

export type SupportedTheme = (typeof SUPPORTED_THEMES)[number];

export function isSupportedTheme(value: string | null): value is SupportedTheme {
  return value !== null && (SUPPORTED_THEMES as readonly string[]).includes(value);
}
