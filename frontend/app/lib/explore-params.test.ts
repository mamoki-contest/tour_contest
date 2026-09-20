import { describe, expect, it } from "vitest";

import {
  DEFAULT_EXPLORE_STATE,
  exploreHref,
  parseExploreState,
  parseSortOrder,
  toSearchParams,
} from "./explore-params";

/**
 * PRD v4가 `인기 많은 순`을 `온라인 언급 많은 순`으로 바꿨을 때 주소에 남은 문제 하나:
 * `sort=INTEREST_ASC` 가 걸린 링크는 이미 공유되고 북마크됐다. 받는 입은 넓게, 내는
 * 입은 좁게 — 옛 값을 받아 주되 새로 만드는 주소에는 쓰지 않는다.
 */

describe("parseSortOrder", () => {
  it("새 값을 그대로 읽는다", () => {
    expect(parseSortOrder("MENTION_DESC")).toBe("MENTION_DESC");
    expect(parseSortOrder("MENTION_ASC")).toBe("MENTION_ASC");
  });

  it("PRD v2 어휘로 공유된 옛 값도 같은 방향으로 읽는다", () => {
    expect(parseSortOrder("INTEREST_DESC")).toBe("MENTION_DESC");
    expect(parseSortOrder("INTEREST_ASC")).toBe("MENTION_ASC");
  });

  it("모르는 값과 빈 값은 기본 정렬로 돌린다", () => {
    expect(parseSortOrder("POPULARITY")).toBe(DEFAULT_EXPLORE_STATE.sort);
    expect(parseSortOrder(null)).toBe(DEFAULT_EXPLORE_STATE.sort);
  });

  it("첫 진입 기본은 온라인 언급 많은 순이다", () => {
    expect(DEFAULT_EXPLORE_STATE.sort).toBe("MENTION_DESC");
  });
});

describe("parseExploreState — 정렬", () => {
  it("옛 값이 걸린 링크가 기본 정렬로 조용히 떨어지지 않는다", () => {
    const state = parseExploreState(new URLSearchParams("sort=INTEREST_ASC"));

    expect(state.sort).toBe("MENTION_ASC");
  });

  it("새 값이 걸린 링크도 같은 자리로 온다", () => {
    expect(parseExploreState(new URLSearchParams("sort=MENTION_ASC")).sort).toBe("MENTION_ASC");
  });
});

describe("toSearchParams — 정렬", () => {
  it("새로 만드는 주소에는 새 값만 쓴다 — 폐기된 어휘를 다시 찍어 내지 않는다", () => {
    const params = toSearchParams({ ...DEFAULT_EXPLORE_STATE, sort: "MENTION_ASC" });

    expect(params.get("sort")).toBe("MENTION_ASC");
  });

  it("기본 정렬은 주소에 쓰지 않는다", () => {
    expect(toSearchParams(DEFAULT_EXPLORE_STATE).get("sort")).toBeNull();
  });

  it("옛 값으로 들어와도 나갈 때는 새 값이다", () => {
    const state = parseExploreState(new URLSearchParams("sort=INTEREST_ASC"));

    expect(exploreHref(state)).toBe("/?sort=MENTION_ASC");
  });
});
