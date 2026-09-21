import { describe, expect, it } from "vitest";

import { backHref, exploreDetailHref, savedDetailHref, shouldUseHistoryBack } from "./back-link";
import { DEFAULT_EXPLORE_STATE, exploreHref, type ExploreState } from "./explore-params";

/** 상세 주소에서 상세 화면이 실제로 보게 될 쿼리만 떼어 낸다 — `location.search` 와 같은 값이다. */
function searchOf(href: string): string {
  const index = href.indexOf("?");
  return index === -1 ? "" : href.slice(index);
}

function exploring(overrides: Partial<ExploreState> = {}): ExploreState {
  return { ...DEFAULT_EXPLORE_STATE, ...overrides };
}

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

  it("상세에서 연 도움말은 돌아갈 탐색 화면의 조건이 아니다", () => {
    expect(backHref("?region=5&sheet=help")).toBe("/?region=5");
  });
});

/*
 * #42 의 구멍이 있던 자리.
 *
 * `backHref` 자체는 처음부터 쿼리를 잘 다뤘다. 그런데 테스트가 쿼리를 **직접 손으로
 * 넣어** 검사해서, 정작 그 쿼리를 만들어 주는 쪽이 아무것도 넣지 않는다는 사실을 못
 * 봤다. 그래서 여기서는 손으로 쓰지 않고 **카드 링크가 만든 주소를 그대로 태운다** —
 * 카드 → 상세 → 뒤로가 한 줄로 이어지는지 본다.
 */
describe("카드 링크가 만든 href 로 상세에 들어왔을 때", () => {
  const state = exploring({ regionCode: "5", sort: "MENTION_ASC", page: 2 });

  it("카드 링크가 지금 걸린 탐색 조건을 상세로 들고 간다", () => {
    expect(exploreDetailHref("128758", state)).toBe(
      "/places/128758?region=5&sort=MENTION_ASC&page=2",
    );
  });

  it("그 주소로 들어온 상세의 뒤로 href 가 조건을 가진 탐색 홈이다", () => {
    const search = searchOf(exploreDetailHref("128758", state));
    expect(backHref(search)).toBe("/?region=5&sort=MENTION_ASC&page=2");
    // 조건이 살아 있다는 말은 곧 탐색 홈이 만들었을 주소와 같다는 뜻이다.
    expect(backHref(search)).toBe(exploreHref(state));
  });

  it("새 탭·링크 복사로 열어도 갈 곳이 있다 — 제자리도, 조건 풀린 홈도 아니다", () => {
    const back = backHref(searchOf(exploreDetailHref("128758", state)));
    expect(back.startsWith("/places/")).toBe(false);
    expect(back).not.toBe("/");
  });

  it("화면 상태는 넘기지 않는다 — 열려 있던 시트와 시트 높이는 상세의 사정이 아니다", () => {
    const withSheet = exploring({ regionCode: "5", sheet: "search", snap: "full" });
    const href = exploreDetailHref("128758", withSheet);
    expect(href).toBe("/places/128758?region=5");
    expect(backHref(searchOf(href))).toBe("/?region=5");
  });

  it("걸린 조건이 없으면 쿼리 없이 가고 뒤로는 탐색 홈이다", () => {
    const href = exploreDetailHref("128758", exploring());
    expect(href).toBe("/places/128758");
    expect(backHref(searchOf(href))).toBe("/");
  });

  it("식별자에 섞인 특수문자는 경로에서 벗어나지 않는다", () => {
    expect(exploreDetailHref("a/b?c", exploring())).toBe("/places/a%2Fb%3Fc");
  });
});

describe("나만의 지도에서 온 카드", () => {
  it("뒤로가 탐색 홈이 아니라 저장 목록이다 — 사용자가 온 곳이 거기다", () => {
    const href = savedDetailHref("128758");
    expect(href).toBe("/places/128758?from=saved");
    expect(backHref(searchOf(href))).toBe("/saved");
  });

  it("저장 목록에서 도움말을 거쳐 들어와도 돌아갈 곳은 그대로다", () => {
    expect(backHref("?from=saved&sheet=help")).toBe("/saved");
  });

  it("어디서 왔는지 표시는 탐색 홈의 쿼리로 새어 나가지 않는다", () => {
    // 아는 값이 아니면 방향으로 읽지 않고, 탐색 조건에도 섞지 않는다.
    expect(backHref("?from=elsewhere&region=5")).toBe("/?region=5");
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
