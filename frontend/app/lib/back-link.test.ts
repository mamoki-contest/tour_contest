import { describe, expect, it } from "vitest";

import { backHref, shouldUseHistoryBack } from "./back-link";

describe("backHref", () => {
  it("쿼리가 없으면 탐색 홈이다", () => {
    expect(backHref("")).toBe("/");
  });

  it("탐색 조건을 그대로 들고 돌아간다 — 뒤로 왔을 때 조건이 풀리면 탐색이 무너진다", () => {
    expect(backHref("?dateMode=FIXED&date=2026-09-23")).toBe("/?dateMode=FIXED&date=2026-09-23");
  });

  it("물음표가 없는 쿼리도 같은 주소가 된다", () => {
    expect(backHref("region=13")).toBe("/?region=13");
  });

  it("물음표만 남은 주소를 빈 쿼리로 되돌린다", () => {
    expect(backHref("?")).toBe("/");
  });

  it("어떤 경우에도 현재 상세 경로를 가리키지 않는다 — 제자리 링크가 #22 의 증상이었다", () => {
    for (const search of ["", "?", "?date=2026-09-23", "region=13"]) {
      expect(backHref(search).startsWith("/places/")).toBe(false);
    }
  });
});

describe("shouldUseHistoryBack", () => {
  it("링크로 곧장 들어온 첫 진입에서는 히스토리를 쓰지 않는다", () => {
    // 새 탭·새로고침·링크 직접 열기는 앱이 만든 스택의 맨 처음이라 idx 가 0이다.
    expect(shouldUseHistoryBack({ key: "l8nv4e2olkc", idx: 0 })).toBe(false);
  });

  it("앱 안에서 이동해 왔으면 히스토리 한 겹을 되돌린다", () => {
    expect(shouldUseHistoryBack({ key: "z7x1k9", idx: 1 })).toBe(true);
    expect(shouldUseHistoryBack({ key: "z7x1k9", idx: 4 })).toBe(true);
  });

  it("히스토리 상태를 읽지 못하면 거짓이다 — 틀려도 앱 안에 남는 쪽이다", () => {
    for (const state of [null, undefined, "idx", 3, {}, { idx: null }, { idx: "1" }]) {
      expect(shouldUseHistoryBack(state)).toBe(false);
    }
  });

  it("뒤로 갈 자리가 없다는 뜻의 음수 idx 도 거짓이다", () => {
    expect(shouldUseHistoryBack({ idx: -1 })).toBe(false);
  });
});
