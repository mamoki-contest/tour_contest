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
  /**
   * 방문 규모 값은 받았지만 행정구역 경계 데이터가 없어 면을 칠할 수 없다.
   * 실패와 구분한다 — 다시 시도해서 될 일이 아니고, 값은 탐색 범위 시트에 살아 있다.
   */
  | "REGION_FILL_UNSUPPORTED"
  /** 지도 자체를 띄우지 못함. 시트를 펼침으로 올려 목록만으로 탐색하게 한다 (U8). */
  | "MAP_FAILED";

export function MapZone({
  status,
  onRetry,
  legend,
  children,
}: {
  status: MapStatus;
  onRetry?: () => void;
  /**
   * 방문 규모 범례 — **데스크톱 자리**.
   *
   * 모바일에서는 시트 바로 위에 붙어 함께 올라간다(U1, `bottom-sheet.tsx`). 데스크톱에는
   * 시트가 없어 그 자리도 사라졌으므로 지도 좌하단에 고정한다. 지도가 실패해도 남는다 —
   * 기준 기간과 시·군 방문 규모로 가는 입구는 지도와 함께 죽을 이유가 없다 (#24).
   */
  legend?: React.ReactNode;
  /** 지도 위에 뜨는 것들 — 상단 컴팩트 바, 이 지도 영역에서 검색 버튼. */
  children?: React.ReactNode;
}) {
  return (
    // 데스크톱에서도 위치 기준을 유지한다. static 으로 두면 안쪽 지도의 `absolute
    // inset-0` 이 그리드 전체를 기준으로 삼아 우측 목록 컬럼까지 덮는다.
    <div className="absolute inset-0 bg-grey-100 lg:relative lg:inset-auto lg:h-full">
      {/* 조건 요약 줄이 먼저 온다 — 모바일에서는 지도 위에 떠 있고, 데스크톱에서는 맨 위에 흐른다. */}
      {children}

      {legend ? (
        // 하단 내비(고정 64px)가 데스크톱에서도 살아 있으므로 그 위에 앉힌다.
        <div className="absolute bottom-[calc(64px+env(safe-area-inset-bottom)+24px)] left-6 z-10 hidden w-[280px] max-w-[calc(100%-3rem)] lg:block">
          {legend}
        </div>
      ) : null}

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
 * 두 줄만 남긴다: 무엇의 규모인지 한 줄, 언제를 센 값인지 한 줄. 출처 이름과
 * `지금 사람 수가 아니에요` 같은 해명은 화면마다 반복하지 않고 시·군 시트에서 한 번
 * 말한다 (사용자 확정, 2026-09-21).
 *
 * 색 레이어가 없는 동안에는 카드가 **시·군 방문 규모로 가는 입구** 노릇을 한다 —
 * 값은 탐색 범위 시트에 살아 있으므로 설명 대신 거기로 보낸다. 색 구간과 사선
 * 스와치(U16)는 지도에 실제로 색이 깔릴 때만 그린다 — 없는 색의 설명은 설명이 아니다.
 */
export function MapLegend({
  status,
  periodLabel,
  onOpenRegions,
}: {
  status: MapStatus;
  /** `2026.08.16 ~ 08.22 기준`. 모르면 줄을 만들지 않는다 — 빈 자리를 문구로 메우지 않는다. */
  periodLabel: string | null;
  /** 탐색 범위 시트를 여는 동작. 없으면 카드가 값만 말하는 표시로 남는다. */
  onOpenRegions?: () => void;
}) {
  const hasFill = status === "READY";
  const shell = "block w-full rounded-lg bg-surface p-3 text-left shadow-float";

  const body = (
    <>
      {hasFill ? (
        <>
          <div className="flex items-center gap-2">
            <span className="type-caption text-grey-600">적음</span>
            <span className="h-3 w-5 rounded-[2px] bg-primary-surface" />
            <span className="h-3 w-5 rounded-[2px] bg-primary-soft" />
            <span className="h-3 w-5 rounded-[2px] bg-primary" />
            <span className="h-3 w-5 rounded-[2px] bg-primary-strong" />
            <span className="type-caption text-grey-600">많음</span>
          </div>
          <div className="mt-2 mb-2 flex items-center gap-2">
            {/* 결측은 램프 밖의 표현 — 가장 옅은 색이 아니라 사선 해칭이다 (U16). */}
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
      ) : null}

      <p className="type-label-md text-grey-800">
        {hasFill || !onOpenRegions ? "시·군 방문 규모" : "시·군 방문 규모 보기"}
      </p>
      {periodLabel ? <p className="type-caption mt-1 text-grey-600">{periodLabel}</p> : null}
    </>
  );

  if (!onOpenRegions) return <div className={shell}>{body}</div>;

  return (
    <button
      type="button"
      onClick={onOpenRegions}
      className={`${shell} transition-colors duration-200 hover:bg-grey-50`}
    >
      {body}
    </button>
  );
}
