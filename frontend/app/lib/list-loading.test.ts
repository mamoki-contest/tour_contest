import { describe, expect, it } from "vitest";

import {
  isListQueryNavigation,
  isMapMoveNavigation,
  isPageNavigation,
  listQuerySignature,
} from "./list-loading";

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

describe("지도 이동이 부른 재조회 (#48)", () => {
  it("지도를 움직여 범위가 바뀐 이동이다", () => {
    expect(isMapMoveNavigation(home(""), home("?bbox=37,128,38,129"))).toBe(true);
    expect(isMapMoveNavigation(home("?bbox=37,128,38,129"), home("?bbox=37.5,128.2,37.9,128.7"))).toBe(
      true,
    );
  });

  it("목록을 바꾸는 이동이면서도 스켈레톤은 켜지 않는다 — 읽던 목록을 남긴다", () => {
    const from = home("");
    const to = home("?bbox=37,128,38,129");

    expect(isListQueryNavigation(from, to)).toBe(true);
    expect(isMapMoveNavigation(from, to)).toBe(true);
  });

  it("시·군이 풀리고 지도 범위가 들어서는 것도 지도 이동이다", () => {
    expect(isMapMoveNavigation(home("?region=51110"), home("?bbox=37,128,38,129"))).toBe(true);
  });

  it("시·군을 고른 이동은 지도 이동이 아니다 — 새 범위를 고른 것이라 스켈레톤이 맞다", () => {
    expect(isMapMoveNavigation(home(""), home("?region=51110"))).toBe(false);
    expect(isMapMoveNavigation(home("?bbox=37,128,38,129"), home("?region=51110"))).toBe(false);
  });

  it("범위와 함께 다른 조건이 바뀌면 지도 이동이 아니다", () => {
    expect(isMapMoveNavigation(home(""), home("?bbox=37,128,38,129&sort=MENTION_ASC"))).toBe(false);
    expect(isMapMoveNavigation(home("?q=커피"), home("?bbox=37,128,38,129"))).toBe(false);
  });

  it("범위가 그대로면 지도가 움직인 것이 아니다", () => {
    const search = "?bbox=37,128,38,129";
    expect(isMapMoveNavigation(home(search), home(`${search}&snap=full`))).toBe(false);
    expect(isMapMoveNavigation(home(search), home(`${search}&page=2`))).toBe(false);
  });

  it("지도 위치(`c`·`z`)만 바뀐 이동은 조회 자체가 없다", () => {
    expect(isMapMoveNavigation(home(""), home("?c=37.8,128.9&z=7"))).toBe(false);
  });

  it("다른 화면으로 떠나거나 이동 중이 아니면 지도 이동이 아니다", () => {
    expect(isMapMoveNavigation(home(""), { pathname: "/places/1", search: "?bbox=37,128,38,129" })).toBe(
      false,
    );
    expect(isMapMoveNavigation(home(""), null)).toBe(false);
  });
});
