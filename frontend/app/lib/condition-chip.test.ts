import { describe, expect, it } from "vitest";

import { searchConditionChip } from "./condition-chip";

describe("searchConditionChip", () => {
  it("지원 테마는 테마라고 말한다", () => {
    expect(searchConditionChip("해수욕장", null)).toEqual({ label: "테마", value: "해수욕장" });
  });

  it("자유 입력어는 테마가 아니라 검색이다 — `테마: '커피' 검색` 이 #43 의 증상이었다", () => {
    expect(searchConditionChip(null, "커피")).toEqual({ label: "검색", value: "'커피'" });
  });

  it("값에 `검색` 을 겹쳐 붙이지 않는다 — 그 말은 라벨이 한다", () => {
    expect(searchConditionChip(null, "커피").value).not.toContain("검색");
  });

  it("정규화된 테마가 있으면 입력어보다 그쪽을 말한다 — 목록이 테마 결과이기 때문이다", () => {
    // `해수용장` 입력이 해수욕장 테마로 정규화된 경우 (#26).
    expect(searchConditionChip("해수욕장", "해수용장")).toEqual({
      label: "테마",
      value: "해수욕장",
    });
  });

  it("아무 조건도 없으면 무테마다", () => {
    expect(searchConditionChip(null, null)).toEqual({ label: "테마", value: "무테마" });
  });
});
