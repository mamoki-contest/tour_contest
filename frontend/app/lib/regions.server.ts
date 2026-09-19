import type {
  DataStatus,
  RegionVisitLevel,
  RegionVisitScale,
  RegionVisitScaleResponse,
  RegionVisitScaleResult,
} from "./contract";
import {
  fetchEnvelope,
  num,
  text,
  toDataStatus,
  type BackendDataStatus,
} from "./backend.server";

/**
 * 지역 방문 규모 조회 (슬라이스 #3). 서버에서만 실행된다.
 *
 * 강원 18개 시·군을 **같은 기준 기간**으로 받는다. 그래서 시·군끼리는 그대로
 * 비교할 수 있고, 다른 기간·다른 지역 집합의 구간과는 비교할 수 없다.
 */

const REGION_DATA_NAME = "지역 방문 규모";

const LEVELS: RegionVisitLevel[] = ["VERY_HIGH", "HIGH", "MEDIUM", "LOW", "VERY_LOW"];

interface BackendRegion {
  lawdCode?: string | null;
  sigunguCode?: string | null;
  name?: string | null;
  visitorCount?: number | null;
  level?: string | null;
  rank?: number | null;
  dayCount?: number | null;
  dataStatus?: BackendDataStatus | null;
}

interface BackendRegionResponse {
  items?: (BackendRegion | null)[] | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  totalRegions?: number | null;
  availableRegions?: number | null;
  dataStatus?: BackendDataStatus | null;
  collectedAt?: string | null;
  source?: string | null;
}

function toRegion(raw: BackendRegion | null): RegionVisitScale | null {
  const sigunguCode = text(raw?.sigunguCode);
  const name = text(raw?.name);
  if (!sigunguCode || !name) return null;

  const level = LEVELS.includes(raw?.level as RegionVisitLevel)
    ? (raw?.level as RegionVisitLevel)
    : null;
  const visitorCount = num(raw?.visitorCount);

  // 값이 없는 시·군도 목록에 남는다 — 지우면 그 시·군을 고를 수 없게 된다.
  const status: DataStatus =
    visitorCount === null || level === null ? "MISSING" : toDataStatus(raw?.dataStatus);

  return {
    sigunguCode,
    lawdCode: text(raw?.lawdCode),
    name,
    visitorCount,
    level,
    rank: num(raw?.rank),
    status,
  };
}

function toResponse(data: BackendRegionResponse): RegionVisitScaleResponse {
  const regions = Array.isArray(data.items)
    ? data.items.map(toRegion).filter((region): region is RegionVisitScale => region !== null)
    : [];

  return {
    // 순위가 있는 시·군을 앞에 둔다. 미산정은 낮은 값이 아니라 순서 밖이다.
    regions: regions.sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity)),
    periodStart: text(data.periodStart),
    periodEnd: text(data.periodEnd),
    status: toDataStatus(data.dataStatus),
    source: text(data.source),
  };
}

export async function fetchRegionVisitScale(
  signal?: AbortSignal,
): Promise<RegionVisitScaleResult> {
  const result = await fetchEnvelope<BackendRegionResponse>(
    "/api/v1/regions/visit-scale",
    new URLSearchParams(),
    REGION_DATA_NAME,
    signal,
  );

  return result.ok
    ? { ok: true, data: toResponse(result.data) }
    : { ok: false, failure: result.failure };
}

