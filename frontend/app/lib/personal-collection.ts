import type { Coordinates } from "./contract";

/**
 * 개인 컬렉션 (슬라이스 #9).
 *
 * 회원가입 없이 **현재 브라우저와 기기에만** 보관한다 (ADR-0001). 계정에 귀속되는
 * 영구 자산이 아니고 기기 간 동기화나 재설치 복구를 보장하지 않는다 — 화면이 이 사실을
 * 사용자에게 밝힌다.
 *
 * 서버에는 사용자 컬렉션 쓰기 계약을 만들지 않는다. 저장하는 것은 표준 관광지 식별자와
 * 최소한의 표시정보뿐이고, 최신 상세는 그 식별자로 다시 조회한다.
 */

const STORAGE_KEY = "hansanada.collection.v1";

/** 스키마가 바뀌면 올린다. 읽을 때 이 값과 다르면 그 항목은 건너뛴다. */
export const COLLECTION_SCHEMA_VERSION = 1;

export interface SavedPlace {
  schemaVersion: number;
  placeId: string;
  /** 저장 당시의 표시정보. 최신 정보는 placeId로 다시 조회한다. */
  name: string;
  address: string | null;
  photoUrl: string | null;
  coordinates: Coordinates | null;
  tags: string[];
  memo: string;
  /** 방문 예정일 (YYYY-MM-DD). 선택 사항이다. */
  plannedDate: string | null;
  savedAt: string;
}

export interface CollectionSnapshot {
  places: SavedPlace[];
  /**
   * 읽지 못하고 버린 항목 수. 0보다 크면 화면이 한 줄로 알린다 —
   * **손상된 데이터가 화면 전체를 중단시키지 않는다** (슬라이스 #9 AC).
   */
  droppedCount: number;
  /**
   * 저장값을 **통째로** 읽지 못했는지 (#28).
   *
   * 일부 항목이 상한 것과 다르다. 일부라면 나머지가 남아 화면이 설 수 있지만,
   * 통째로 상하면 남는 것이 없어 `아직 저장한 곳이 없어요`와 `불러오지 못했어요`가
   * 동시에 뜬다 — 서로 어긋나는 두 문장이고, 사용자가 되돌릴 방법도 없다.
   * 그 두 경우를 여기서 갈라 화면이 복구 버튼을 줄 수 있게 한다.
   */
  corrupted: boolean;
}

const EMPTY: CollectionSnapshot = { places: [], droppedCount: 0, corrupted: false };

function storage(): Storage | null {
  // 서버 렌더 중이거나 저장소가 막힌 브라우저(사생활 보호 모드 등)에서는 조용히 비운다.
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

function toSavedPlace(raw: unknown): SavedPlace | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;

  const placeId = typeof record.placeId === "string" ? record.placeId : null;
  const name = typeof record.name === "string" ? record.name : null;
  if (!placeId || !name) return null;
  if (record.schemaVersion !== COLLECTION_SCHEMA_VERSION) return null;

  const coordinates = record.coordinates as Record<string, unknown> | null | undefined;
  const latitude = coordinates && typeof coordinates.latitude === "number" ? coordinates.latitude : null;
  const longitude = coordinates && typeof coordinates.longitude === "number" ? coordinates.longitude : null;

  return {
    schemaVersion: COLLECTION_SCHEMA_VERSION,
    placeId,
    name,
    address: typeof record.address === "string" ? record.address : null,
    photoUrl: typeof record.photoUrl === "string" ? record.photoUrl : null,
    coordinates: latitude !== null && longitude !== null ? { latitude, longitude } : null,
    tags: Array.isArray(record.tags) ? record.tags.filter((tag): tag is string => typeof tag === "string") : [],
    memo: typeof record.memo === "string" ? record.memo : "",
    plannedDate: typeof record.plannedDate === "string" ? record.plannedDate : null,
    savedAt: typeof record.savedAt === "string" ? record.savedAt : new Date().toISOString(),
  };
}

/**
 * 저장된 컬렉션을 읽는다. **깨진 항목은 버리고 나머지는 살린다** — 하나가 상했다고
 * 전부 잃지 않게.
 */
export function readCollection(): CollectionSnapshot {
  const store = storage();
  if (!store) return EMPTY;

  const raw = store.getItem(STORAGE_KEY);
  if (!raw) return EMPTY;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // 통째로 깨졌다. 스스로 지우지 않는다 — 지우는 것은 사용자가 확인하고 고를 일이다.
    return { places: [], droppedCount: 1, corrupted: true };
  }

  if (!Array.isArray(parsed)) return { places: [], droppedCount: 1, corrupted: true };

  const places: SavedPlace[] = [];
  let droppedCount = 0;
  for (const entry of parsed) {
    const place = toSavedPlace(entry);
    if (place) places.push(place);
    else droppedCount += 1;
  }

  return { places, droppedCount, corrupted: false };
}

/**
 * 읽을 수 없게 된 저장값을 지우고 빈 컬렉션에서 다시 시작한다 (#28).
 *
 * 화면이 확인을 받은 뒤에만 부른다. 이 함수는 되돌릴 수 없으므로 스스로 판단해
 * 부르는 자리를 만들지 않는다 — 읽지 못한다는 것과 버려도 된다는 것은 다른 말이다.
 */
export function clearCollection(): CollectionSnapshot {
  const store = storage();
  try {
    store?.removeItem(STORAGE_KEY);
  } catch {
    // 지우지 못해도 화면은 빈 상태로 선다. 다음 읽기에서 같은 안내를 다시 만난다.
  }
  return EMPTY;
}

function write(places: SavedPlace[]): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(places));
  } catch {
    // 용량 초과 등으로 쓰지 못하면 조용히 넘어간다. 화면은 이전 상태를 유지한다.
  }
}

export function isSaved(placeId: string): boolean {
  return readCollection().places.some((place) => place.placeId === placeId);
}

export function savePlace(
  input: Omit<SavedPlace, "schemaVersion" | "savedAt" | "tags" | "memo" | "plannedDate"> &
    Partial<Pick<SavedPlace, "tags" | "memo" | "plannedDate">>,
): CollectionSnapshot {
  const snapshot = readCollection();
  const existing = snapshot.places.find((place) => place.placeId === input.placeId);

  const next: SavedPlace = {
    schemaVersion: COLLECTION_SCHEMA_VERSION,
    placeId: input.placeId,
    name: input.name,
    address: input.address,
    photoUrl: input.photoUrl,
    coordinates: input.coordinates,
    tags: input.tags ?? existing?.tags ?? [],
    memo: input.memo ?? existing?.memo ?? "",
    plannedDate: input.plannedDate ?? existing?.plannedDate ?? null,
    savedAt: existing?.savedAt ?? new Date().toISOString(),
  };

  const places = existing
    ? snapshot.places.map((place) => (place.placeId === next.placeId ? next : place))
    : [next, ...snapshot.places];

  write(places);
  return { places, droppedCount: snapshot.droppedCount, corrupted: false };
}

export function removePlace(placeId: string): CollectionSnapshot {
  const snapshot = readCollection();
  const places = snapshot.places.filter((place) => place.placeId !== placeId);
  write(places);
  return { places, droppedCount: snapshot.droppedCount, corrupted: snapshot.corrupted };
}
