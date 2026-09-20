import type { CrowdForecast, CrowdLevel } from "../lib/contract";
import type { DateMode } from "../lib/explore-params";
import { formatStatusCaption } from "../lib/data-status";
import { dayOfMonth, monthKey, monthLabel } from "../lib/forecast-window";
import { NoDataBadge } from "./badges";
import { CrowdBadge, QuietDateValue } from "./crowd-badge";

/**
 * 30일 방문 혼잡도 예측 (슬라이스 #6·#7).
 *
 * 이 격자의 색은 **이 장소 안에서만** 뜻을 가진다. 다른 관광지의 같은 색과 견주면
 * 안 되고, 그래서 캡션이 `이 장소 자체 기준`이라고 못 박는다.
 */
const LEVEL_CELL: Record<CrowdLevel, { className: string; label: string }> = {
  QUIET: { className: "bg-primary-surface text-primary-strong", label: "한산" },
  NORMAL: { className: "bg-grey-100 text-grey-700", label: "보통" },
  BUSY: { className: "bg-red-surface text-red-deep", label: "혼잡" },
};

export function ForecastGrid({
  forecast,
  dateMode,
  selectedDate,
}: {
  forecast: CrowdForecast;
  dateMode: DateMode;
  selectedDate: string | null;
}) {
  if (forecast.days.length === 0) {
    return (
      <div>
        <NoDataBadge>예측 정보 없음</NoDataBadge>
        <ForecastCaption forecast={forecast} />
      </div>
    );
  }

  const months = forecast.days.reduce<Record<string, typeof forecast.days>>((acc, day) => {
    (acc[monthKey(day.date)] ??= []).push(day);
    return acc;
  }, {});

  const selected = forecast.days.find((day) => day.date === selectedDate);

  return (
    <div>
      {/* 모드에 따라 격자 위에 오는 한 줄이 달라진다. */}
      {dateMode === "FIXED" ? (
        <div className="mb-4">
          {selected?.level ? (
            <CrowdBadge level={selected.level} />
          ) : (
            <NoDataBadge>고른 날짜의 예측 정보 없음</NoDataBadge>
          )}
        </div>
      ) : forecast.quietDate ? (
        <div className="mb-4">
          <QuietDateValue date={forecast.quietDate} />
          <p className="type-caption text-grey-600">이 장소에서 한산할 것으로 보이는 날이에요</p>
        </div>
      ) : (
        <div className="mb-4">
          <NoDataBadge>한산 예상일 없음</NoDataBadge>
        </div>
      )}

      {Object.entries(months).map(([key, days]) => (
        <section key={key} className="mt-4">
          <h4 className="type-label-md text-grey-700">{monthLabel(days[0].date)}</h4>
          <ul className="mt-2 grid grid-cols-7 gap-1">
            {days.map((day) => {
              const style = day.level ? LEVEL_CELL[day.level] : null;
              const isSelected = day.date === selectedDate;
              return (
                <li key={day.date}>
                  <div
                    title={`${day.date} · ${style?.label ?? "예측 없음"}`}
                    className={[
                      "type-label-md flex aspect-square items-center justify-center rounded-sm",
                      // 예측 없는 날은 채우지 않는다 — 채운 색은 값이 있다는 뜻이다.
                      style?.className ?? "border border-dashed border-grey-300 text-grey-700",
                      isSelected ? "ring-2 ring-primary-strong" : "",
                    ].join(" ")}
                  >
                    <span className="sr-only">
                      {day.date} {style?.label ?? "예측 없음"}
                      {isSelected ? " (고른 날짜)" : ""}
                    </span>
                    <span aria-hidden="true">{dayOfMonth(day.date)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <div className="mt-4 flex flex-wrap gap-3">
        <LegendSwatch level="QUIET" />
        <LegendSwatch level="NORMAL" />
        <LegendSwatch level="BUSY" />
        <span className="type-caption flex items-center gap-1 text-grey-600">
          <span className="size-3 rounded-[2px] border border-dashed border-grey-300" />
          예측 없음
        </span>
      </div>

      <ForecastCaption forecast={forecast} />
    </div>
  );
}

function LegendSwatch({ level }: { level: CrowdLevel }) {
  const { className, label } = LEVEL_CELL[level];
  return (
    <span className="type-caption flex items-center gap-1 text-grey-600">
      <span className={`size-3 rounded-[2px] ${className}`} />
      {label}
    </span>
  );
}

/**
 * 예측 격자의 캡션.
 *
 * 기준 시점 한 줄만 남는다 (#35). `이 장소 자체의 30일을 견준 값`이라는 설명은
 * 화면마다 되풀이하는 대신 도움말 한 자리로 옮겼다. 값이 낡았으면(`STALE`) 그 사실이
 * 시점보다 먼저 온다 (#21) — 낡은 예측을 오늘 받은 예측처럼 읽으면 헛걸음이 된다.
 */
function ForecastCaption({ forecast }: { forecast: CrowdForecast }) {
  const caption = formatStatusCaption(forecast.status, forecast.observedAt);
  if (!caption) return null;
  return <p className="type-caption mt-4 text-grey-600">{caption}</p>;
}
