import { useState } from "react";

import { OverlaySheet, PrimaryButton } from "./overlay-sheet";
import type { DateMode, ExploreState } from "../lib/explore-params";
import {
  FORECAST_WINDOW_DAYS,
  dayOfMonth,
  forecastWindow,
  leadingBlankCount,
  monthKey,
  monthLabel,
  todayInSeoul,
} from "../lib/forecast-window";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 날짜 시트 (슬라이스 #6).
 *
 * 두 모드가 묻는 것이 다르다:
 * - `날짜가 정해졌어요` — 방문일을 고정하고, 각 장소가 **그 날짜를 자기 기준으로** 어떻게
 *   보는지 확인한다. 장소 추천이 사용자의 날짜를 바꾸지 않는다.
 * - `한산한 날에 갈래요` — 장소를 먼저 보고, 장소마다 상대적으로 한산한 예상일을 받는다.
 *
 * 30일 밖은 아예 그리지 않는다 — 고를 수 없는 것을 보여주고 나중에 막지 않는다 (U10).
 */
export function DateSheet({
  state,
  onClose,
  onApply,
}: {
  state: ExploreState;
  onClose: () => void;
  onApply: (mode: DateMode, date: string | null) => void;
}) {
  const [mode, setMode] = useState<DateMode>(state.dateMode);
  const [date, setDate] = useState<string | null>(state.date);

  const days = forecastWindow();
  const today = todayInSeoul();

  // 달이 바뀌는 지점에서 끊어 그린다 — 30일 창이 두 달에 걸치는 것이 보통이다.
  const months = days.reduce<Record<string, string[]>>((acc, day) => {
    (acc[monthKey(day)] ??= []).push(day);
    return acc;
  }, {});

  return (
    <OverlaySheet
      title="언제 갈까요"
      onClose={onClose}
      footer={
        <PrimaryButton
          onClick={() => onApply(mode, mode === "FIXED" ? date : null)}
          disabled={mode === "FIXED" && date === null}
        >
          {mode === "FIXED" && date === null ? "날짜를 골라주세요" : "적용"}
        </PrimaryButton>
      }
    >
      <div role="group" aria-label="날짜 모드" className="flex gap-1 rounded-sm bg-grey-100 p-1">
        <ModeOption selected={mode === "FIXED"} onSelect={() => setMode("FIXED")}>
          날짜가 정해졌어요
        </ModeOption>
        <ModeOption selected={mode === "FLEXIBLE"} onSelect={() => setMode("FLEXIBLE")}>
          한산한 날에 갈래요
        </ModeOption>
      </div>

      {mode === "FLEXIBLE" ? (
        <div className="mt-6 rounded-xl bg-grey-50 p-5">
          <p className="type-body-lg text-grey-700">
            장소마다 앞으로 {FORECAST_WINDOW_DAYS}일 중 상대적으로 한산한 예상일을 알려드려요.
          </p>
          <p className="type-caption mt-2 text-grey-600">
            각 장소 자체의 예측 안에서 비교한 날짜예요. 장소끼리 견주는 값이 아니에요.
          </p>
        </div>
      ) : (
        <>
          <p className="type-caption mt-6 text-grey-600">
            오늘부터 {FORECAST_WINDOW_DAYS}일까지 고를 수 있어요. 그 뒤 날짜는 예측이 없어요.
          </p>

          {Object.entries(months).map(([key, monthDays]) => (
            <section key={key} className="mt-6">
              <h3 className="type-title-md text-grey-800">{monthLabel(monthDays[0])}</h3>
              <div
                role="grid"
                aria-label={monthLabel(monthDays[0])}
                className="mt-2 grid grid-cols-7 gap-1"
              >
                {WEEKDAYS.map((weekday) => (
                  <div key={weekday} className="type-caption py-1 text-center text-grey-600">
                    {weekday}
                  </div>
                ))}
                {/* 첫 주는 요일에 맞춰 비운다. */}
                {Array.from({ length: leadingBlankCount(monthDays[0]) }, (_, index) => (
                  <div key={`blank-${index}`} aria-hidden="true" />
                ))}
                {monthDays.map((day) => (
                  <DayCell
                    key={day}
                    day={day}
                    today={day === today}
                    selected={day === date}
                    onSelect={() => setDate(day)}
                  />
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </OverlaySheet>
  );
}

function ModeOption({
  selected,
  onSelect,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        "type-label-md h-10 flex-1 rounded-sm transition-colors duration-200",
        selected ? "bg-surface text-grey-900" : "text-grey-700",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function DayCell({
  day,
  today,
  selected,
  onSelect,
}: {
  day: string;
  today: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${day}${today ? " (오늘)" : ""}`}
      className={[
        "type-label-md flex aspect-square items-center justify-center rounded-sm transition-colors duration-200",
        selected ? "bg-primary-strong text-surface" : "text-grey-800 hover:bg-grey-100",
      ].join(" ")}
    >
      <span className="flex flex-col items-center">
        {dayOfMonth(day)}
        {today && !selected ? (
          <span className="mt-0.5 block size-1 rounded-full bg-primary-strong" />
        ) : null}
      </span>
    </button>
  );
}
