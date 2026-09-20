import { describe, expect, it } from "vitest";

import type { PlaceListSearch } from "./contract";
import { normalizedTheme, searchNotice } from "./search-notice";

function supportedTheme(appliedTheme: string | null): PlaceListSearch {
  return {
    resultType: "SUPPORTED_THEME",
    appliedTheme,
    appliedQuery: null,
    suggestedThemes: [],
  };
}

const generalSearch: PlaceListSearch = {
  resultType: "GENERAL_SEARCH",
  appliedTheme: null,
  appliedQuery: null,
  suggestedThemes: ["벚꽃", "꽃축제", "해수욕장"],
};

describe("검색 안내 판정 (#26)", () => {
  it("오타가 지원 테마로 정규화되면 무엇으로 찾았는지 말한다", () => {
    const input = { theme: null, query: "해수용장", search: supportedTheme("해수욕장") };
    expect(normalizedTheme(input)).toBe("해수욕장");
    expect(searchNotice(input)).toEqual({
      kind: "THEME_NORMALIZED",
      rawQuery: "해수용장",
      theme: "해수욕장",
    });
  });

  it("입력어와 테마 이름이 같으면 바뀐 것이 없다", () => {
    const input = { theme: null, query: "해수욕장", search: supportedTheme("해수욕장") };
    expect(normalizedTheme(input)).toBeNull();
    expect(searchNotice(input).kind).toBe("NONE");
  });

  it("테마 칩을 직접 누른 결과에는 아무 말도 하지 않는다 — 조건 칩이 이미 말한다", () => {
    const input = { theme: "해수욕장", query: null, search: supportedTheme("해수욕장") };
    expect(normalizedTheme(input)).toBeNull();
    expect(searchNotice(input).kind).toBe("NONE");
  });

  it("일반 검색 결과는 큐레이션을 거치지 않았다고 밝힌다 (ADR-0003 · U18)", () => {
    const input = { theme: null, query: "커피", search: generalSearch };
    expect(searchNotice(input)).toEqual({ kind: "GENERAL_SEARCH", query: "커피" });
  });

  it("검색으로 온 목록이 아니면 안내가 없다", () => {
    expect(searchNotice({ theme: null, query: null, search: null }).kind).toBe("NONE");
  });

  it("테마 이름을 받지 못하면 정규화됐다고 말하지 않는다 — 없는 이름을 지어내지 않는다", () => {
    const input = { theme: null, query: "해수용장", search: supportedTheme(null) };
    expect(normalizedTheme(input)).toBeNull();
  });
});
