import { useState } from "react";

import { OverlaySheet, PrimaryButton } from "./overlay-sheet";
import { SecondaryButton } from "./states";
import type { SavedPlace } from "../lib/personal-collection";
import {
  FORECAST_WINDOW_DAYS,
  forecastWindow,
  isWithinForecastWindow,
} from "../lib/forecast-window";

/**
 * 카드 위의 저장 버튼 (40px 원).
 *
 * 목록에 다시 나온 장소를 이미 저장했는지 한눈에 알 수 있어야 한다 (U5) — 그래서 저장
 * 상태가 버튼 모양에 그대로 드러난다.
 */
export function SaveButton({
  saved,
  onToggle,
  placeName,
}: {
  saved: boolean;
  onToggle: () => void;
  placeName: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={saved}
      aria-label={`${placeName} ${saved ? "저장 해제" : "저장"}`}
      className={[
        "inline-flex size-10 items-center justify-center rounded-full transition-colors duration-200",
        saved ? "bg-primary-surface text-primary-strong" : "bg-grey-100 text-grey-700",
      ].join(" ")}
    >
      <span aria-hidden="true" className="type-label-lg leading-none">
        {saved ? "★" : "☆"}
      </span>
    </button>
  );
}

/**
 * 저장 편집 시트 — 태그·메모·방문 예정일.
 *
 * 저장 삭제는 **한 단계 확인**을 거친다 (H5 에러 예방). 방문 예정일은 예측이 있는
 * 30일 창 안에서만 고를 수 있다 — 창 밖 날짜를 넣어두면 나중에 뜻을 잃는다.
 */
export function SaveEditSheet({
  place,
  onClose,
  onSave,
  onRemove,
}: {
  place: SavedPlace;
  onClose: () => void;
  onSave: (patch: { tags: string[]; memo: string; plannedDate: string | null }) => void;
  onRemove: () => void;
}) {
  const [tags, setTags] = useState<string[]>(place.tags);
  const [tagDraft, setTagDraft] = useState("");
  const [memo, setMemo] = useState(place.memo);
  const [plannedDate, setPlannedDate] = useState<string | null>(
    place.plannedDate && isWithinForecastWindow(place.plannedDate) ? place.plannedDate : null,
  );
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const days = forecastWindow();

  const addTag = () => {
    const next = tagDraft.trim();
    if (next === "" || tags.includes(next)) return;
    setTags([...tags, next]);
    setTagDraft("");
  };

  return (
    <OverlaySheet
      title={place.name}
      onClose={onClose}
      footer={<PrimaryButton onClick={() => onSave({ tags, memo, plannedDate })}>저장</PrimaryButton>}
    >
      <section>
        <h3 className="type-title-md text-grey-800">태그</h3>
        {/* 사용자가 쓴 태그는 알약, 시스템이 검증한 테마 칩은 8px 라운드 — 모양으로 구분된다. */}
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setTags(tags.filter((value) => value !== tag))}
              aria-label={`${tag} 태그 삭제`}
              className="type-label-md inline-flex h-8 items-center gap-1 rounded-full bg-grey-100 px-3 text-grey-700"
            >
              {tag}
              <span aria-hidden="true">✕</span>
            </button>
          ))}
        </div>
        <form
          className="mt-2 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            addTag();
          }}
        >
          <label htmlFor="tag-input" className="sr-only">
            태그 추가
          </label>
          <input
            id="tag-input"
            value={tagDraft}
            onChange={(event) => setTagDraft(event.target.value)}
            placeholder="예: 가족여행"
            className="type-body-md h-12 flex-1 rounded-lg bg-grey-100 px-4 text-grey-900 placeholder:text-grey-600"
          />
          <SecondaryButton onClick={addTag} disabled={tagDraft.trim() === ""}>
            추가
          </SecondaryButton>
        </form>
      </section>

      <section className="mt-6">
        <label htmlFor="memo-input" className="type-title-md block text-grey-800">
          메모
        </label>
        <textarea
          id="memo-input"
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          rows={4}
          placeholder="기억해 둘 것을 적어두세요"
          className="type-body-md mt-2 max-h-48 w-full resize-y rounded-lg bg-grey-100 p-4 text-grey-900 placeholder:text-grey-600"
        />
      </section>

      <section className="mt-6">
        <h3 className="type-title-md text-grey-800">방문 예정일</h3>
        <p className="type-caption mt-1 text-grey-600">
          예측이 있는 {FORECAST_WINDOW_DAYS}일 안에서 고를 수 있어요.
        </p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setPlannedDate(null)}
            aria-pressed={plannedDate === null}
            className={[
              "type-label-md inline-flex h-10 shrink-0 items-center rounded-sm px-3 whitespace-nowrap",
              plannedDate === null ? "bg-primary-surface text-primary-strong" : "bg-grey-100 text-grey-700",
            ].join(" ")}
          >
            정하지 않음
          </button>
          {days.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setPlannedDate(day)}
              aria-pressed={plannedDate === day}
              className={[
                "type-label-md inline-flex h-10 shrink-0 items-center rounded-sm px-3 whitespace-nowrap",
                plannedDate === day ? "bg-primary-surface text-primary-strong" : "bg-grey-100 text-grey-700",
              ].join(" ")}
            >
              {day.slice(5).replace("-", "/")}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-8 border-t border-grey-200 pt-6">
        {confirmingRemove ? (
          <div className="rounded-xl bg-red-surface p-4">
            <p className="type-body-lg text-red-deep">저장을 지울까요? 태그와 메모도 함께 사라져요.</p>
            <div className="mt-4 flex gap-2">
              <SecondaryButton onClick={() => setConfirmingRemove(false)}>그대로 두기</SecondaryButton>
              <button
                type="button"
                onClick={onRemove}
                className="type-label-lg h-12 rounded-md bg-red px-4 text-surface transition-colors duration-200"
              >
                지우기
              </button>
            </div>
          </div>
        ) : (
          <SecondaryButton onClick={() => setConfirmingRemove(true)}>저장 지우기</SecondaryButton>
        )}
      </div>
    </OverlaySheet>
  );
}
