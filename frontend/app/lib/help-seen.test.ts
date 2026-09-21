import { afterEach, describe, expect, it, vi } from "vitest";

import { markHelpSeen, readHelpSeen } from "./help-seen";
import { parseExploreState } from "./explore-params";

/** 브라우저 저장소 대역. 값은 이 객체 안에만 산다. */
function fakeStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
    clear: () => values.clear(),
    key: () => null,
    length: 0,
  } as unknown as Storage;
}

function withStorage(storage: Storage | null) {
  vi.stubGlobal("window", storage === null ? {} : { localStorage: storage });
}

afterEach(() => vi.unstubAllGlobals());

describe("help-seen", () => {
  it("한 번 적어 두면 다음에 읽힌다", () => {
    withStorage(fakeStorage());
    expect(readHelpSeen()).toBe(false);

    markHelpSeen();
    expect(readHelpSeen()).toBe(true);
  });

  it("저장소가 막혀 있으면 `아직 안 봤다`로 읽고 멈추지 않는다", () => {
    withStorage(null);
    expect(() => markHelpSeen()).not.toThrow();
    expect(readHelpSeen()).toBe(false);
  });

  /*
   * #41 의 본체. 도움말이 열렸다는 사실은 **주소**가 말하고, 기록은 그 사실을 보고
   * 일어난다 — 클릭 핸들러가 아니라. 링크로 열든 주소를 직접 치든 같은 길이다.
   */
  it("`?sheet=help` 로 들어온 화면은 도움말이 열린 상태다 — 클릭이 없어도", () => {
    const storage = fakeStorage();
    withStorage(storage);

    const state = parseExploreState(new URLSearchParams("?sheet=help"));
    expect(state.sheet).toBe("help");

    // 화면이 관찰하는 조건(`state.sheet === "help"`)이 참이면 기록한다.
    if (state.sheet === "help") markHelpSeen();
    expect(readHelpSeen()).toBe(true);
  });

  it("상세 주소가 탐색 조건을 함께 들고 와도 도움말 열림은 따로 읽힌다", () => {
    withStorage(fakeStorage());

    const open = parseExploreState(new URLSearchParams("?region=5&sort=MENTION_ASC&sheet=help"));
    expect(open.sheet).toBe("help");

    const other = parseExploreState(new URLSearchParams("?region=5&sheet=search"));
    expect(other.sheet).toBe("search");

    const none = parseExploreState(new URLSearchParams("?region=5"));
    expect(none.sheet).toBe(null);
  });

  it("도움말이 아닌 시트는 기록하지 않는다", () => {
    withStorage(fakeStorage());

    for (const search of ["", "?sheet=search", "?sheet=date", "?sheet=region"]) {
      const state = parseExploreState(new URLSearchParams(search));
      if (state.sheet === "help") markHelpSeen();
    }

    expect(readHelpSeen()).toBe(false);
  });
});
