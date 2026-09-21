import type { PlaceListSearch } from "./contract";

/**
 * 검색 결과 위에 무엇을 말할지 (#26 · #29 · U18).
 *
 * 백엔드는 오타·동의어를 지원 테마로 정규화한다. `해수용장`을 치면 해수욕장 테마
 * 결과 113곳이 오는데, 화면이 그 사실을 말하지 않으면 사용자는 자기가 친 말이 그대로
 * 통한 줄 안다 — 조건 칩까지 `'해수용장' 검색`이라 말하면 어긋남이 굳어진다.
 *
 * 판정을 화면 밖으로 꺼낸 이유는 이 결정이 **세 자리에 동시에 걸리기** 때문이다:
 * 조건 칩 · 목록 위 안내 · 시트 헤더. 세 곳이 각자 판정하면 언젠가 서로 다른 말을 한다.
 */

export type SearchNotice =
  /** 입력어가 지원 테마로 바뀌어 조회됐다. */
  | { kind: "THEME_NORMALIZED"; rawQuery: string; theme: string }
  /** 테마로 바뀌지 않은 자유 검색 — 큐레이션을 거치지 않은 결과다 (ADR-0003). */
  | { kind: "GENERAL_SEARCH"; query: string | null }
  /** 말할 것이 없다 — 검색으로 온 목록이 아니거나, 사용자가 테마 칩을 직접 눌렀다. */
  | { kind: "NONE" };

export interface SearchNoticeInput {
  /** 사용자가 직접 고른 테마. 있으면 바뀐 것이 없으므로 알릴 것도 없다. */
  theme: string | null;
  /** 사용자가 친 말. */
  query: string | null;
  /** 검색으로 온 목록이면 그 성격. 아니면 null. */
  search: PlaceListSearch | null;
}

/**
 * 정규화로 실제 적용된 테마 이름. 정규화가 아니면 null.
 *
 * 입력어와 테마 이름이 **같으면** 바뀐 것이 없다 — `해수욕장`을 친 사람에게
 * `해수욕장 테마로 찾았어요`라고 말하는 것은 아무 정보도 아니다.
 */
export function normalizedTheme(input: SearchNoticeInput): string | null {
  const { theme, query, search } = input;
  if (theme !== null || query === null || search === null) return null;
  if (search.resultType !== "SUPPORTED_THEME") return null;
  if (search.appliedTheme === null || search.appliedTheme === query) return null;
  return search.appliedTheme;
}

export function searchNotice(input: SearchNoticeInput): SearchNotice {
  if (input.search === null) return { kind: "NONE" };

  const theme = normalizedTheme(input);
  if (theme !== null && input.query !== null) {
    return { kind: "THEME_NORMALIZED", rawQuery: input.query, theme };
  }

  if (input.search.resultType === "GENERAL_SEARCH") {
    return { kind: "GENERAL_SEARCH", query: input.query };
  }

  // 테마 칩을 눌러 온 지원 테마 결과. 조건 칩이 이미 테마 이름을 말하고 있다.
  return { kind: "NONE" };
}
