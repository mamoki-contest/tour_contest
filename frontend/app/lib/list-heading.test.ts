import { describe, expect, it } from "vitest";

import { listHeading } from "./list-heading";

const base = {
  hasBounds: false,
  regionLabel: null,
  theme: null,
  query: null,
  count: null,
} as const;

describe("시트 헤더 문구 (#25)", () => {
  it("아무 조건도 없으면 강원 전체다", () => {
    expect(listHeading({ ...base, count: 4741 })).toBe("강원 전체 4,741곳");
  });

  it("시·군을 고르면 그 시·군을 말한다", () => {
    expect(listHeading({ ...base, regionLabel: "춘천시", count: 412 })).toBe("춘천시 412곳");
  });

  it("테마로 찾았으면 테마를 말한다", () => {
    expect(listHeading({ ...base, theme: "해수욕장", count: 113 })).toBe("해수욕장 113곳");
  });

  it("자유 검색어는 검색이라고 밝힌다", () => {
    expect(listHeading({ ...base, query: "커피", count: 53 })).toBe("'커피' 검색 53곳");
  });

  it("지도 경계가 확정됐을 때만 `이 지도 범위`라고 말한다", () => {
    expect(listHeading({ ...base, hasBounds: true, count: 37 })).toBe("이 지도 범위 37곳");
  });

  it("시·군과 테마가 함께 걸리면 둘 다 말한다", () => {
    expect(listHeading({ ...base, regionLabel: "강릉시", theme: "해수욕장", count: 12 })).toBe(
      "강릉시 해수욕장 12곳",
    );
  });

  it("지도 경계가 시·군보다 앞선다 — 두 조건은 함께 걸리지 않는다", () => {
    expect(listHeading({ ...base, hasBounds: true, regionLabel: "춘천시", count: 5 })).toBe(
      "이 지도 범위 5곳",
    );
  });

  it("개수를 모르면 범위만 말한다 — 0곳이라고 지어내지 않는다", () => {
    expect(listHeading({ ...base, regionLabel: "춘천시" })).toBe("춘천시");
  });

  it("0건도 그 조건의 0건이라고 말한다", () => {
    expect(listHeading({ ...base, query: "즐라탄", count: 0 })).toBe("'즐라탄' 검색 0곳");
  });
});
