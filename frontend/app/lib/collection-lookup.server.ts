import type {
  CollectionItem,
  CollectionItemStatus,
  CollectionLookupResponse,
  CollectionLookupResult,
} from "./contract";
import { fetchEnvelope, text, toPlace, type BackendAttraction } from "./backend.server";

/**
 * 저장된 식별자 일괄 재조회 (슬라이스 #9). 서버에서만 실행된다.
 *
 * 컬렉션 자체와 태그·메모·방문 예정일은 브라우저 저장소가 주인이다. 이 경계는
 * **저장된 식별자를 받아 지금 상태를 되돌려줄 뿐**이고, 사용자별 저장소나 계정,
 * 기기 간 동기화를 만들지 않는다 (ADR-0001).
 */

const LOOKUP_DATA_NAME = "저장한 곳 정보";

/** 백엔드가 한 번에 받는 상한. 넘으면 400이 오므로 여기서 잘라 보낸다. */
export const LOOKUP_BATCH_LIMIT = 50;

const STATUSES: CollectionItemStatus[] = ["AVAILABLE", "NOT_FOUND", "UNAVAILABLE"];

interface BackendCollectionItem {
  contentId?: string | null;
  status?: string | null;
  attraction?: BackendAttraction | null;
  collectedAt?: string | null;
}

interface BackendLookupResponse {
  items?: (BackendCollectionItem | null)[] | null;
  requestedCount?: number | null;
  availableCount?: number | null;
  notFoundCount?: number | null;
  unavailableCount?: number | null;
  source?: string | null;
}

function toItem(raw: BackendCollectionItem | null): CollectionItem | null {
  const placeId = text(raw?.contentId);
  if (!placeId) return null;

  // 상태를 모르면 `확인하지 못했다`로 둔다. 없어진 것으로 단정하지 않는다.
  const status = STATUSES.includes(raw?.status as CollectionItemStatus)
    ? (raw?.status as CollectionItemStatus)
    : "UNAVAILABLE";

  const place = status === "AVAILABLE" ? toPlace(raw?.attraction) : null;

  return { placeId, status: place === null && status === "AVAILABLE" ? "UNAVAILABLE" : status, place };
}

export async function fetchCollectionLookup(
  placeIds: string[],
  signal?: AbortSignal,
): Promise<CollectionLookupResult> {
  const ids = placeIds.slice(0, LOOKUP_BATCH_LIMIT);
  if (ids.length === 0) {
    return { ok: true, data: { items: [], source: null } };
  }

  const query = new URLSearchParams();
  for (const id of ids) query.append("contentIds", id);

  const result = await fetchEnvelope<BackendLookupResponse>(
    "/api/v1/attractions/batch",
    query,
    LOOKUP_DATA_NAME,
    signal,
  );

  if (!result.ok) return { ok: false, failure: result.failure };

  const items = Array.isArray(result.data.items)
    ? result.data.items.map(toItem).filter((item): item is CollectionItem => item !== null)
    : [];

  return { ok: true, data: { items, source: text(result.data.source) } };
}
