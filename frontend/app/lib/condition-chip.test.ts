import { describe, expect, it } from "vitest";

import { dateConditionValue, searchConditionChip } from "./condition-chip";

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

/**
 * 날짜 칩의 세 문구 (#53).
 *
 * 전에는 `한산한 날에 갈래요` 를 고른 화면도 첫 진입과 똑같이 `날짜 미정` 이라고
 * 말했다 — 칩이 사용자의 선택을 부정하는 동안 카드에는 그 예측이 떠 있었다.
 */
describe("dateConditionValue (#53)", () => {
  it("날짜를 고르지 않았으면 날짜 미정이다", () => {
    expect(dateConditionValue("NONE", null)).toBe("날짜 미정");
  });

  it("한산한 날에 갈래요는 `한산한 날` 이라고 말한다 — 미정과 다른 상태다", () => {
    expect(dateConditionValue("FLEXIBLE", null)).toBe("한산한 날");
    expect(dateConditionValue("FLEXIBLE", null)).not.toBe(dateConditionValue("NONE", null));
  });

  it("고른 날짜는 연도 없이 월·일로 말한다 — 칩 한 줄을 밀지 않는다", () => {
    expect(dateConditionValue("FIXED", "2026-09-24")).toBe("9월 24일");
  });

  it("확정 모드인데 날짜가 없으면 미정이라고 말한다 — 없는 날짜를 지어내지 않는다", () => {
    expect(dateConditionValue("FIXED", null)).toBe("날짜 미정");
  });
});
