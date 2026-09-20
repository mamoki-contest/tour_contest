import { describe, expect, it } from "vitest";

import { isListQueryNavigation, isPageNavigation, listQuerySignature } from "./list-loading";

const home = (search: string) => ({ pathname: "/", search });

describe("목록 로딩 판정 (#20)", () => {
  it("정렬을 뒤집으면 목록을 다시 부르는 이동이다", () => {
    expect(isListQueryNavigation(home(""), home("?sort=INTEREST_ASC"))).toBe(true);
  });

  it("시·군·테마·검색어·날짜·지도 범위 변경도 목록을 다시 부른다", () => {
    expect(isListQueryNavigation(home(""), home("?region=51110"))).toBe(true);
    expect(isListQueryNavigation(home(""), home("?theme=해수욕장"))).toBe(true);
    expect(isListQueryNavigation(home(""), home("?q=커피"))).toBe(true);
    expect(isListQueryNavigation(home(""), home("?dateMode=FIXED&date=2026-09-24"))).toBe(true);
    expect(isListQueryNavigation(home(""), home("?bbox=1,2,3,4"))).toBe(true);
  });

  it("시트를 열고 닫는 이동에는 켜지 않는다 — 읽던 목록이 사라지면 안 된다", () => {
    expect(isListQueryNavigation(home("?q=커피"), home("?q=커피&sheet=search"))).toBe(false);
  });

  it("시트 스냅과 지도 위치 변경에도 켜지 않는다", () => {
    expect(isListQueryNavigation(home(""), home("?snap=full"))).toBe(false);
    expect(isListQueryNavigation(home(""), home("?c=37.8,128.9&z=7"))).toBe(false);
  });

  it("`더 보기`는 목록 스켈레톤을 켜지 않는다 — 버튼이 진행 중임을 말한다", () => {
    expect(isListQueryNavigation(home(""), home("?page=2"))).toBe(false);
    expect(isPageNavigation(home(""), home("?page=2"))).toBe(true);
  });

  it("다른 화면으로 떠나는 이동은 목록 로딩이 아니다", () => {
    expect(isListQueryNavigation(home("?q=커피"), { pathname: "/places/1", search: "" })).toBe(false);
  });

  it("이동 중이 아니면(next 없음) 로딩이 아니다", () => {
    expect(isListQueryNavigation(home(""), null)).toBe(false);
    expect(isPageNavigation(home(""), undefined)).toBe(false);
  });

  it("조건의 적힌 순서가 달라도 같은 목록이다", () => {
    expect(listQuerySignature("?sort=INTEREST_ASC&region=51110")).toBe(
      listQuerySignature("?region=51110&sort=INTEREST_ASC"),
    );
  });
});
