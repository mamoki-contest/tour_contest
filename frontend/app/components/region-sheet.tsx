import type { RegionVisitLevel, RegionVisitScale, RegionVisitScaleResponse } from "../lib/contract";
import { formatVisitPeriod } from "../lib/format";
import { formatStaleCaption, isStale } from "../lib/data-status";
import { OverlaySheet } from "./overlay-sheet";
import { NoDataBadge } from "./badges";
import { ErrorState, StaleNote } from "./states";

/**
 * 탐색 범위 시트 (슬라이스 #3).
 *
 * 방문 규모는 원래 지도 색으로 말하는 값이지만, 행정구역 경계 데이터가 아직 없어
 * 면을 칠할 수 없다. 색을 못 칠한다고 데이터를 버리지 않고 **고르는 자리에서**
 * 보여준다 — 시·군을 고를 때 알고 싶은 것이 바로 이 값이기 때문이다.
 *
 * 순위와 색 농도는 **조회한 18개 시·군 사이의 상대 순서**다. 절대 등급이 아니고,
 * 지금 그 지역에 사람이 얼마나 있는지도 아니다 (ADR-0006).
 */
const LEVEL_SWATCH: Record<RegionVisitLevel, string> = {
  VERY_HIGH: "bg-primary-strong",
  HIGH: "bg-primary",
  MEDIUM: "bg-primary-soft",
  LOW: "bg-primary-surface",
  VERY_LOW: "bg-primary-surface",
};

export function RegionSheet({
  selected,
  data,
  onClose,
  onSelect,
}: {
  /** 선택된 시·군구 코드. null이면 강원 전체. */
  selected: string | null;
  /** 조회에 실패했으면 null — 그래도 시트는 열린다. 범위 해제는 늘 할 수 있어야 한다. */
  data: RegionVisitScaleResponse | null;
  onClose: () => void;
  onSelect: (sigunguCode: string | null) => void;
}) {
  return (
    <OverlaySheet title="어디에서 찾으세요" onClose={onClose}>
      <button
        type="button"
        onClick={() => onSelect(null)}
        aria-pressed={selected === null}
        className={[
          "type-label-lg flex h-12 w-full items-center rounded-lg px-4 transition-colors duration-200",
          selected === null
            ? "bg-primary-surface text-primary-strong"
            : "bg-grey-100 text-grey-700 hover:bg-grey-200",
        ].join(" ")}
      >
        강원 전체
      </button>

      {data === null ? (
        <div className="mt-6">
          <ErrorState dataName="지역 방문 규모" />
          <p className="type-caption mt-4 text-grey-600">
            방문 규모를 못 불러와도 시·군을 고를 수는 있어야 하는데, 목록 자체가 이 값에서
            와요. 다시 시도하거나 강원 전체로 둘러보세요.
          </p>
        </div>
      ) : (
        <section className="mt-6">
          <h3 className="type-title-md text-grey-800">시·군별 방문 규모</h3>
          {/*
            기준 기간 한 줄만 남긴다 (#35). 무엇을 센 값이고 무엇이 아닌지는 화면마다
            되풀이하지 않고 도움말 한 자리로 옮겼다.
          */}
          {formatVisitPeriod(data.periodStart, data.periodEnd) ? (
            <p className="type-caption mt-2 text-grey-600">
              {formatVisitPeriod(data.periodStart, data.periodEnd)}
            </p>
          ) : null}
          {/* 최종 정상 데이터로 돌아온 값은 그 사실을 말한다 (#21). */}
          {isStale(data.status) ? <StaleNote caption={formatStaleCaption(null)} /> : null}

          <ul className="mt-4 grid gap-2">
            {data.regions.map((region) => (
              <li key={region.sigunguCode}>
                <RegionRow
                  region={region}
                  selected={selected === region.sigunguCode}
                  onSelect={() => onSelect(region.sigunguCode)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </OverlaySheet>
  );
}

function RegionRow({
  region,
  selected,
  onSelect,
}: {
  region: RegionVisitScale;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        "flex h-12 w-full items-center gap-3 rounded-lg px-4 text-left transition-colors duration-200",
        selected ? "bg-primary-surface" : "bg-grey-50 hover:bg-grey-100",
      ].join(" ")}
    >
      {/* 결측은 램프 밖의 표현 — 가장 옅은 색이 아니라 사선 해칭이다 (U16). */}
      {region.level ? (
        <span
          className={`size-3 shrink-0 rounded-[2px] ${LEVEL_SWATCH[region.level]}`}
          aria-hidden="true"
        />
      ) : (
        <span
          className="size-3 shrink-0 rounded-[2px] bg-grey-200"
          aria-hidden="true"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent 0 2px, rgba(107,118,132,.55) 2px 3px)",
          }}
        />
      )}

      <span className={`type-label-lg grow ${selected ? "text-primary-strong" : "text-grey-800"}`}>
        {region.name}
      </span>

      {region.rank !== null ? (
        <span className="type-caption shrink-0 text-grey-600">방문 규모 {region.rank}위</span>
      ) : (
        <NoDataBadge>방문 규모 정보 없음</NoDataBadge>
      )}
    </button>
  );
}

