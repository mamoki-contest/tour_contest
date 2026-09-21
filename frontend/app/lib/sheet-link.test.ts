import { describe, expect, it } from "vitest";

import { closeSheetSearch, openSheetSearch } from "./sheet-link";

describe("openSheetSearch", () => {
  it("걸려 있던 쿼리는 그대로 두고 시트 열림만 더한다", () => {
    expect(openSheetSearch("?region=5&sort=MENTION_ASC", "help")).toBe(
      "?region=5&sort=MENTION_ASC&sheet=help",
    );
  });

  it("쿼리가 없으면 시트 열림 하나만 남는다", () => {
    expect(openSheetSearch("", "help")).toBe("?sheet=help");
  });

  it("이미 열려 있던 시트를 겹쳐 쌓지 않는다", () => {
    expect(openSheetSearch("?sheet=search", "help")).toBe("?sheet=help");
  });

  it("어디서 왔는지 표시도 지키고 간다 — 도움말을 닫으면 돌아갈 자리다", () => {
    expect(openSheetSearch("?from=saved", "help")).toBe("?from=saved&sheet=help");
  });
});

describe("closeSheetSearch", () => {
  it("시트 열림만 뺀다", () => {
    expect(closeSheetSearch("?region=5&sheet=help")).toBe("?region=5");
  });

  it("남는 것이 없으면 빈 쿼리다 — 물음표만 남은 주소를 만들지 않는다", () => {
    expect(closeSheetSearch("?sheet=help")).toBe("");
  });

  it("열려 있지 않았으면 아무것도 바뀌지 않는다", () => {
    expect(closeSheetSearch("?region=5")).toBe("?region=5");
  });
});
