import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_EXPLORE_STATE } from "./explore-params";
import { fetchPlaceList } from "./places.server";

/**
 * 목록 조회의 경계 (#21 · #25 · #30 M4).
 *
 * 백엔드를 실제로 부르지 않는다 — `STALE` 은 캐시가 만료된 뒤 공급자가 실패해야
 * 나오는 상태라 로컬에서 만들 수 없다. 봉투를 흉내 내 **화면까지 그 상태가 살아서
 * 오는지**만 본다.
 */

const attraction = (contentId: string, mention: number | null) => ({
  contentId,
  name: `장소 ${contentId}`,
  onlineMention:
    mention === null
      ? { status: "AMBIGUOUS", count: null }
      : { status: "COLLECTED", count: mention, collectedAt: "2026-09-19T23:56:32" },
  visitTiming: {
    dateMode: "FLEXIBLE",
    supportedFrom: "2026-09-21",
    supportedTo: "2026-10-19",
    dataStatus: "AVAILABLE",
  },
});

/** 부른 주소를 순서대로 모아 둔다 — 무엇을 보냈는지가 이 테스트의 절반이다. */
let requested: string[] = [];

beforeEach(() => {
  process.env.API_BASE_URL = "http://backend.test";
  requested = [];
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.API_BASE_URL;
});

function install(body: Record<string, unknown>) {
  vi.stubGlobal("fetch", async (input: unknown) => {
    requested.push(String(input));
    return new Response(JSON.stringify({ resultCode: "200-1", statusCode: 200, data: body }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
}

function requestedQuery(): URLSearchParams {
  return new URL(requested[0]).searchParams;
}

describe("목록 조회", () => {
  it("STALE 응답을 화면까지 그대로 들고 온다 (#21)", async () => {
    install({
      items: [attraction("1", 10)],
      totalCount: 1,
      sort: "ONLINE_MENTION_DESC",
      dataStatus: "STALE",
      collectedAt: "2026-09-21T09:00:00",
    });

    const result = await fetchPlaceList(undefined, DEFAULT_EXPLORE_STATE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.status).toBe("STALE");
    expect(result.data.observedAt).toBe("2026-09-21T09:00:00");
  });

  it("NO_DATA 는 STALE 과 다른 상태로 온다", async () => {
    install({ items: [], totalCount: 0, dataStatus: "NO_DATA" });
    const result = await fetchPlaceList(undefined, DEFAULT_EXPLORE_STATE);
    expect(result.ok && result.data.status).toBe("MISSING");
  });

  it("응답이 말하는 예측 지원 창을 들고 온다 (#30 M3)", async () => {
    install({ items: [attraction("1", 10)], totalCount: 1 });
    const result = await fetchPlaceList(undefined, DEFAULT_EXPLORE_STATE);
    expect(result.ok && result.data.forecastWindow).toEqual({
      from: "2026-09-21",
      to: "2026-10-19",
    });
  });

  it("창을 말해 주지 않으면 없다고 한다 — 30일을 지어내지 않는다", async () => {
    install({ items: [{ contentId: "1", name: "장소" }], totalCount: 1 });
    const result = await fetchPlaceList(undefined, DEFAULT_EXPLORE_STATE);
    expect(result.ok && result.data.forecastWindow).toBeNull();
  });

  it("남은 항목이 있으면 더 부를 수 있다 (#30 M4)", async () => {
    install({ items: [attraction("1", 10)], totalCount: 4741 });
    const result = await fetchPlaceList(undefined, DEFAULT_EXPLORE_STATE);
    expect(result.ok && result.data.hasMore).toBe(true);
    expect(result.ok && result.data.reachedLimit).toBe(false);
    expect(requestedQuery().get("size")).toBe("20");
  });

  it("쪽을 늘리면 누적해서 더 크게 부른다", async () => {
    install({ items: [attraction("1", 10)], totalCount: 4741 });
    await fetchPlaceList(undefined, { ...DEFAULT_EXPLORE_STATE, page: 3 });
    expect(requestedQuery().get("size")).toBe("60");
  });

  it("한 번에 받을 수 있는 끝에 닿으면 그 사실을 말한다 — 버튼만 조용히 지우지 않는다", async () => {
    install({ items: [attraction("1", 10)], totalCount: 4741 });
    const result = await fetchPlaceList(undefined, { ...DEFAULT_EXPLORE_STATE, page: 5 });
    expect(requestedQuery().get("size")).toBe("100");
    expect(result.ok && result.data.hasMore).toBe(false);
    expect(result.ok && result.data.reachedLimit).toBe(true);
  });

  it("다 받았으면 더 보기가 없다", async () => {
    install({ items: [attraction("1", 10)], totalCount: 1 });
    const result = await fetchPlaceList(undefined, DEFAULT_EXPLORE_STATE);
    expect(result.ok && result.data.hasMore).toBe(false);
    expect(result.ok && result.data.reachedLimit).toBe(false);
  });

  it("미산정 항목은 값이 없는 채로 온다 — 0으로 읽지 않는다 (#27)", async () => {
    install({ items: [attraction("1", 10), attraction("2", null)], totalCount: 2 });
    const result = await fetchPlaceList(undefined, DEFAULT_EXPLORE_STATE);
    expect(
      result.ok &&
        result.data.places.map((place) => [place.onlineMention.status, place.onlineMention.count]),
    ).toEqual([
      ["COLLECTED", 10],
      ["AMBIGUOUS", null],
    ]);
  });

  it("검색 입구에는 날짜 파라미터를 보내지 않는다 — 받지 않는 값이다 (tour_backend#98)", async () => {
    install({ items: [], totalCount: 0, resultType: "GENERAL_SEARCH" });
    await fetchPlaceList(undefined, {
      ...DEFAULT_EXPLORE_STATE,
      query: "커피",
      dateMode: "FIXED",
      date: "2026-09-24",
    });

    const query = requestedQuery();
    expect(requested[0]).toContain("/attractions/search");
    expect(query.get("query")).toBe("커피");
    expect(query.get("dateMode")).toBeNull();
    expect(query.get("visitDate")).toBeNull();
  });
});
