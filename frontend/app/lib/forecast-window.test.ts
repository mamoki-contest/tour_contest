import { describe, expect, it } from "vitest";

import {
  formatCalendarDate,
  isWithinWindow,
  resolveWindow,
  windowDates,
  windowLabel,
} from "./forecast-window";

const now = new Date("2026-09-21T12:00:00+09:00");

describe("예측 지원 창 (#30 M3)", () => {
  it("응답이 말한 창을 그대로 쓴다 — 프론트가 센 30일보다 짧다", () => {
    expect(resolveWindow({ from: "2026-09-21", to: "2026-10-19" }, now)).toEqual({
      from: "2026-09-21",
      to: "2026-10-19",
    });
  });

  it("창을 모르면 오늘 + 30일로 되돌아간다", () => {
    expect(resolveWindow(null, now)).toEqual({ from: "2026-09-21", to: "2026-10-21" });
  });

  it("응답의 시작이 어제여도 지난 날은 고를 수 없다", () => {
    expect(resolveWindow({ from: "2026-09-10", to: "2026-10-19" }, now).from).toBe("2026-09-21");
  });

  it("끝이 시작보다 이르면 하루짜리 창으로 접는다 — 빈 달력을 그리지 않는다", () => {
    expect(resolveWindow({ from: "2026-09-01", to: "2026-09-05" }, now)).toEqual({
      from: "2026-09-21",
      to: "2026-09-21",
    });
  });

  it("창 안의 날을 하루씩 편다", () => {
    const days = windowDates({ from: "2026-09-21", to: "2026-10-19" });
    expect(days).toHaveLength(29);
    expect(days[0]).toBe("2026-09-21");
    expect(days.at(-1)).toBe("2026-10-19");
  });

  it("창 밖의 날은 고를 수 없다", () => {
    const window = { from: "2026-09-21", to: "2026-10-19" };
    expect(isWithinWindow("2026-10-19", window)).toBe(true);
    expect(isWithinWindow("2026-10-20", window)).toBe(false);
    expect(isWithinWindow("2026-09-20", window)).toBe(false);
  });

  it("고를 수 있는 날을 숫자로 말한다", () => {
    expect(windowLabel({ from: "2026-09-21", to: "2026-10-19" })).toBe("9월 21일 ~ 10월 19일");
  });

  it("저장된 달력 날짜를 읽을 수 있는 꼴로 옮긴다 (#30 M2)", () => {
    expect(formatCalendarDate("2026-09-24")).toBe("9월 24일");
  });

  it("옮길 수 없는 값은 지어내지 않고 그대로 둔다", () => {
    expect(formatCalendarDate("깨진 값")).toBe("깨진 값");
  });
});
