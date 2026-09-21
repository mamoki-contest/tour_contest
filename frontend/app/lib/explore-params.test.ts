import { describe, expect, it } from "vitest";

import {
  DEFAULT_EXPLORE_STATE,
  exploreHref,
  parseExploreState,
  parseSortOrder,
  toSearchParams,
  withMapBounds,
  withRegionCode,
  type MapBounds,
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

/**
 * 지도 범위와 시·군은 서로를 지운다 (WIREFRAME 「지도와 URL 상태」).
 *
 * 둘을 같이 두면 백엔드에서 AND 로 걸려 조회 범위가 어느 쪽도 아니게 되는데, 조건
 * 칩은 시·군 이름만 말해 사용자가 그 사실을 알 수 없다. 지도가 움직일 때마다 이
 * 전환이 일어나게 된 뒤로는(#48) 더 자주 지나가는 길이다.
 */
describe("지도 범위 ⇄ 시·군 (#48)", () => {
  const bounds: MapBounds = { swLat: 37.7, swLng: 128.8, neLat: 37.9, neLng: 129.0 };

  it("지도 범위가 확정되면 시·군 조건은 풀린다 — 칩이 `이 지도 범위`를 말할 수 있게", () => {
    const next = withMapBounds({ ...DEFAULT_EXPLORE_STATE, regionCode: "51110" }, bounds);

    expect(next.bounds).toEqual(bounds);
    expect(next.regionCode).toBeNull();
  });

  it("시·군을 고르면 지도 범위 조건은 풀린다 — 반대 방향도 대칭이다", () => {
    const next = withRegionCode({ ...DEFAULT_EXPLORE_STATE, bounds }, "51110");

    expect(next.regionCode).toBe("51110");
    expect(next.bounds).toBeNull();
  });

  it("어느 쪽으로 바뀌든 쪽 수는 첫 쪽으로 돌아간다 — 늘려 둔 쪽은 다른 목록의 쪽이다", () => {
    const read = { ...DEFAULT_EXPLORE_STATE, page: 3 };

    expect(withMapBounds(read, bounds).page).toBe(1);
    expect(withRegionCode({ ...read, bounds }, "51110").page).toBe(1);
  });

  it("지도 범위는 주소에 소수점 다섯 자리로 적힌다", () => {
    expect(toSearchParams(withMapBounds(DEFAULT_EXPLORE_STATE, bounds)).get("bbox")).toBe(
      "37.70000,128.80000,37.90000,129.00000",
    );
  });

  it("주소에 적힌 범위는 그대로 되살아난다 — 새로고침·뒤로가 같은 범위를 본다", () => {
    const href = exploreHref(withMapBounds(DEFAULT_EXPLORE_STATE, bounds));
    const restored = parseExploreState(new URLSearchParams(href.slice(2)));

    expect(restored.bounds).toEqual({
      swLat: 37.7,
      swLng: 128.8,
      neLat: 37.9,
      neLng: 129,
    });
  });

  it("시·군을 고르면 보던 자리도 버린다 — 지도가 그리로 옮겨 가기 때문이다", () => {
    const viewing = {
      ...DEFAULT_EXPLORE_STATE,
      viewport: { lat: 37.8, lng: 128.9, level: 7 },
    };

    expect(withRegionCode(viewing, "51110").viewport).toBeNull();
    // 강원 전체로 되돌릴 때는 지도를 움직이지 않으니 보던 자리도 그대로 둔다.
    expect(withRegionCode(viewing, null).viewport).toEqual(viewing.viewport);
  });
});
