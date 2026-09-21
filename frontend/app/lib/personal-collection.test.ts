import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  COLLECTION_SCHEMA_VERSION,
  clearCollection,
  readCollection,
  savePlace,
} from "./personal-collection";

const STORAGE_KEY = "hansanada.collection.v1";

/** 브라우저 저장소를 흉내 낸다 — 이 모듈이 보는 것은 `window.localStorage` 하나뿐이다. */
function fakeStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
    clear: () => map.clear(),
    key: () => null,
    length: 0,
  } as unknown as Storage;
}

let store: Storage;

beforeEach(() => {
  store = fakeStorage();
  (globalThis as { window?: unknown }).window = { localStorage: store };
});

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

function saved(placeId: string) {
  return {
    schemaVersion: COLLECTION_SCHEMA_VERSION,
    placeId,
    name: `장소 ${placeId}`,
    address: null,
    photoUrl: null,
    coordinates: null,
    tags: [],
    memo: "",
    plannedDate: null,
    savedAt: "2026-09-21T00:00:00.000Z",
  };
}

describe("저장 손상 판정 (#28)", () => {
  it("저장한 적이 없으면 손상이 아니다", () => {
    expect(readCollection()).toEqual({ places: [], droppedCount: 0, corrupted: false });
  });

  it("JSON 자체가 깨지면 통째로 손상이다", () => {
    store.setItem(STORAGE_KEY, "{깨진 값");
    expect(readCollection()).toEqual({ places: [], droppedCount: 1, corrupted: true });
  });

  it("배열이 아닌 값도 통째로 손상이다", () => {
    store.setItem(STORAGE_KEY, JSON.stringify({ places: [] }));
    expect(readCollection().corrupted).toBe(true);
  });

  it("일부 항목만 상한 것은 손상이 아니다 — 나머지가 목록을 세운다", () => {
    store.setItem(STORAGE_KEY, JSON.stringify([saved("1"), { placeId: "2" }, null]));
    const snapshot = readCollection();
    expect(snapshot.corrupted).toBe(false);
    expect(snapshot.places).toHaveLength(1);
    expect(snapshot.droppedCount).toBe(2);
  });

  it("읽지 못했다고 스스로 지우지 않는다 — 지우는 것은 사용자가 고를 일이다", () => {
    store.setItem(STORAGE_KEY, "{깨진 값");
    readCollection();
    expect(store.getItem(STORAGE_KEY)).toBe("{깨진 값");
  });

  it("확인을 받고 지우면 빈 컬렉션에서 다시 시작한다", () => {
    store.setItem(STORAGE_KEY, "{깨진 값");
    expect(clearCollection()).toEqual({ places: [], droppedCount: 0, corrupted: false });
    expect(store.getItem(STORAGE_KEY)).toBeNull();
    expect(readCollection().corrupted).toBe(false);
  });

  it("저장하면 손상 표시가 풀린다", () => {
    const snapshot = savePlace({
      placeId: "1",
      name: "경포해수욕장",
      address: null,
      photoUrl: null,
      coordinates: null,
    });
    expect(snapshot.corrupted).toBe(false);
    expect(snapshot.places).toHaveLength(1);
  });

  it("저장소를 쓸 수 없는 브라우저에서도 화면이 선다", () => {
    delete (globalThis as { window?: unknown }).window;
    expect(readCollection()).toEqual({ places: [], droppedCount: 0, corrupted: false });
  });
});
