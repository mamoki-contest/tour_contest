import { useState } from "react";

import { OverlaySheet, PrimaryButton } from "./overlay-sheet";
import type { DateMode, ExploreState } from "../lib/explore-params";
import {
  dayOfMonth,
  leadingBlankCount,
  monthKey,
  monthLabel,
  resolveWindow,
  todayInSeoul,
  windowDates,
  windowLabel,
  type SupportedWindow,
} from "../lib/forecast-window";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 날짜 시트 (슬라이스 #6 · #53).
 *
 * 고를 수 있는 것이 셋이고, 셋이 묻는 것이 다르다:
 * - `날짜가 정해졌어요` — 방문일을 고정하고, 각 장소가 **그 날짜를 자기 기준으로** 어떻게
 *   보는지 확인한다. 장소 추천이 사용자의 날짜를 바꾸지 않는다.
 * - `한산한 날에 갈래요` — 장소를 먼저 보고, 장소마다 상대적으로 한산한 예상일을 받는다.
 * - `날짜 조건 없이 볼래요` — **첫 진입의 상태이자 돌아올 자리**다 (#53). 예측을 묻지
 *   않으므로 카드에 배지가 없다. 이 선택지를 시트 안에 두는 이유는, 한 번 모드를 고른
 *   뒤에 날짜 조건만 푸는 길이 `초기화`(다른 조건까지 함께 지운다)밖에 없었기 때문이다.
 *
 * 셋을 한 줄짜리 탭 셋으로 묶지 않았다. `날짜가 정해졌어요`·`한산한 날에 갈래요` 는
 * 둘 다 **예측을 받는** 모드라 나란히 견주는 것이 맞지만, 조건 없음은 그 둘과 같은
 * 층위가 아니다. 모바일 폭에서 8~9자 라벨 셋을 한 줄에 넣으면 글자가 접히기도 한다.
 *
 * 예측이 닿지 않는 날은 아예 그리지 않는다 — 고를 수 없는 것을 보여주고 나중에 막지
 * 않는다 (U10). 창의 끝은 **응답이 말한 날**이다 (#30 M3): 프론트가 혼자 센 30일은
 * 백엔드가 가진 창보다 길어서, 고를 수 있다고 그려 놓고 조회에서 되돌리곤 했다.
 */
export function DateSheet({
  state,
  supported,
  onClose,
  onApply,
}: {
  state: ExploreState;
  /** 응답이 말하는 예측 지원 창. 모르면 null이고, 그때만 오늘 + 30일로 되돌아간다. */
  supported?: SupportedWindow | null;
  onClose: () => void;
  onApply: (mode: DateMode, date: string | null) => void;
}) {
  const [mode, setMode] = useState<DateMode>(state.dateMode);
  const [date, setDate] = useState<string | null>(state.date);

  const window = resolveWindow(supported);
  const days = windowDates(window);
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
      <div role="group" aria-label="날짜 모드">
        <div className="flex gap-1 rounded-sm bg-grey-100 p-1">
          <ModeOption selected={mode === "FIXED"} onSelect={() => setMode("FIXED")}>
            날짜가 정해졌어요
          </ModeOption>
          <ModeOption selected={mode === "FLEXIBLE"} onSelect={() => setMode("FLEXIBLE")}>
            한산한 날에 갈래요
          </ModeOption>
        </div>

        {/*
          조건을 푸는 길. 고른 날짜도 함께 버린다 — 적용되지 않을 값을 들고 있지 않는다.

          위 둘과 **같은 모양**을 쓰되 상자를 따로 둔다. 선택 표시(흰 면)가 셋 다 같아야
          지금 무엇이 걸려 있는지 한눈에 보이고, 상자가 갈리면 이것이 예측을 받는 모드가
          아니라는 것도 함께 읽힌다.
        */}
        <div className="mt-2 flex rounded-sm bg-grey-100 p-1">
          <ModeOption
            selected={mode === "NONE"}
            onSelect={() => {
              setMode("NONE");
              setDate(null);
            }}
          >
            날짜 조건 없이 볼래요
          </ModeOption>
        </div>
      </div>

      {mode === "NONE" ? (
        <div className="mt-6 rounded-xl bg-grey-50 p-5">
          <p className="type-body-lg text-grey-700">
            날짜 조건 없이 장소만 둘러봐요. 위에서 하나를 고르면 카드에 예측을 보여드려요.
          </p>
        </div>
      ) : mode === "FLEXIBLE" ? (
        <div className="mt-6 rounded-xl bg-grey-50 p-5">
          <p className="type-body-lg text-grey-700">
            장소마다 한산할 것으로 보이는 날을 알려드려요.
          </p>
        </div>
      ) : (
        <>
          {/* 며칠까지인지 숫자로 말한다 — `30일 안에서`는 실제 창과 어긋날 수 있다. */}
          <p className="type-caption mt-6 text-grey-600">{windowLabel(window)} 중에서 고를 수 있어요</p>

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
