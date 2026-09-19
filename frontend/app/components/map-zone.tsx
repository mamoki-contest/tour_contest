import { ErrorState, SecondaryButton } from "./states";

/**
 * 방문 규모 지도 영역 (슬라이스 #3).
 *
 * 지도는 지역 방문 규모만 말한다. 목록 정렬이 쓰는 관광지 관심도와 같은 시각 블록에
 * 절대 넣지 않는다 (U15, ADR-0002·0006) — 범례는 지도 영역에, 관심도 캡션은 시트 헤더에 산다.
 */

export type MapStatus =
  /** 지도 SDK와 방문 규모 색상이 모두 정상. */
  | "READY"
  /** 지도는 살아 있고 방문 규모 색상만 실패 — 목록은 그대로 산다. */
  | "REGION_FILL_FAILED"
  /** 지도 자체를 띄우지 못함. 시트를 펼침으로 올려 목록만으로 탐색하게 한다 (U8). */
  | "MAP_FAILED";

export function MapZone({
  status,
  onRetry,
  children,
}: {
  status: MapStatus;
  onRetry?: () => void;
  /** 지도 위에 뜨는 것들 — 상단 컴팩트 바, 이 지도 영역에서 검색 버튼. */
  children?: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0 bg-grey-100 lg:static lg:h-full">
      {/* 조건 요약 줄이 먼저 온다 — 모바일에서는 지도 위에 떠 있고, 데스크톱에서는 맨 위에 흐른다. */}
      {children}
      {status === "MAP_FAILED" ? (
        // 시트가 아래 절반을 덮으므로 위쪽(조건 요약 줄 아래)에 붙인다 — 가운데 정렬하면 시트 뒤로 숨는다.
        <div className="px-gutter pt-[calc(env(safe-area-inset-top)+72px)] lg:pt-24">
          <ErrorState
            dataName="지도"
            action={onRetry ? <SecondaryButton onClick={onRetry}>다시 시도</SecondaryButton> : null}
          />
          <p className="type-caption mt-4 text-grey-600">
            지도 없이도 아래 목록으로 관광지를 둘러볼 수 있어요.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * 방문 규모 범례 — 접히지 않는다.
 *
 * 색 구간·사선(정보 없음)·기준 기간·출처가 모두 들어간다. 사선 스와치를 상시 포함하는
 * 이유는 작은 지도에서 해칭이 잘 안 보이기 때문이다 (U16).
 */
export function MapLegend({
  status,
  periodLabel,
  source,
  /** 지도 확대가 읍·면·동에 닿으면 색을 만들지 않는다 — 그 사실을 범례가 말한다. */
  belowRegionLevel = false,
}: {
  status: MapStatus;
  periodLabel: string | null;
  source: string | null;
  belowRegionLevel?: boolean;
}) {
  return (
    <div className="rounded-lg bg-surface p-3 shadow-float">
      {status === "REGION_FILL_FAILED" ? (
        <p className="type-caption text-grey-700">방문 규모를 불러오지 못했어요</p>
      ) : belowRegionLevel ? (
        <p className="type-caption text-grey-700">
          이 확대 단계에는 방문 규모 색이 없어요 — 관광지 마커만 보여드려요
        </p>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span className="type-caption text-grey-600">적음</span>
            <span className="h-3 w-5 rounded-[2px] bg-primary-surface" />
            <span className="h-3 w-5 rounded-[2px] bg-primary-soft" />
            <span className="h-3 w-5 rounded-[2px] bg-primary" />
            <span className="h-3 w-5 rounded-[2px] bg-primary-strong" />
            <span className="type-caption text-grey-600">많음</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            {/* 결측은 램프 밖의 표현 — 가장 옅은 색이 아니라 사선 해칭이다. */}
            <span
              className="h-3 w-5 rounded-[2px] bg-grey-200"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent 0 2px, rgba(107,118,132,.55) 2px 3px)",
              }}
            />
            <span className="type-caption text-grey-600">정보 없음</span>
          </div>
        </>
      )}
      <p className="type-caption mt-2 text-grey-600">
        {[source ?? "출처 없음", periodLabel ?? "기준 기간 없음"].join(" · ")}
      </p>
      <p className="type-caption text-grey-600">지역을 방문한 규모예요. 지금 사람 수가 아니에요.</p>
    </div>
  );
}
