import { useState } from "react";
import { Link } from "react-router";

import { OverlaySheet, PrimaryButton } from "./overlay-sheet";
import type { ExploreState } from "../lib/explore-params";
import { SUPPORTED_THEMES } from "../lib/themes";

/**
 * 검색 시트 (슬라이스 #5).
 *
 * 지원 테마 칩 8개는 전부 여기 산다 — 지도 위에 펼치면 지도가 덮여 바텀시트를 고른
 * 의미가 없어진다 (U12 → D5).
 *
 * **자유 입력어는 칩 모양을 갖지 않는다.** 칩은 `검증된 테마`의 시각적 약속이라,
 * 일반 검색에 칩을 주면 ADR-0003이 막으려는 오해가 그대로 생긴다.
 */
export function SearchSheet({
  state,
  onClose,
  onApplyTheme,
  onApplyQuery,
}: {
  state: ExploreState;
  onClose: () => void;
  onApplyTheme: (theme: string | null) => void;
  onApplyQuery: (query: string) => void;
}) {
  const [draft, setDraft] = useState(state.query ?? "");
  const trimmed = draft.trim();

  return (
    <OverlaySheet
      title="무엇을 찾으세요"
      onClose={onClose}
      footer={
        <PrimaryButton onClick={() => onApplyQuery(trimmed)} disabled={trimmed === ""}>
          검색
        </PrimaryButton>
      }
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (trimmed !== "") onApplyQuery(trimmed);
        }}
      >
        <label htmlFor="search-query" className="sr-only">
          관광지 이름이나 하고 싶은 것
        </label>
        <input
          id="search-query"
          type="search"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="관광지 이름으로 찾기"
          className="type-body-lg h-12 w-full rounded-lg bg-grey-100 px-4 text-grey-900 placeholder:text-grey-600"
        />
      </form>

      <section className="mt-6">
        <h3 className="type-title-md text-grey-800">테마로 찾기</h3>

        {/* 한 줄 가로 스크롤 — 접거나 더보기를 만들지 않는다. 8개는 스크롤로 충분하다. */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {SUPPORTED_THEMES.map((theme) => {
            const selected = state.theme === theme;
            return (
              <button
                key={theme}
                type="button"
                onClick={() => onApplyTheme(selected ? null : theme)}
                aria-pressed={selected}
                className={[
                  "type-label-md inline-flex h-10 shrink-0 items-center rounded-sm px-3 whitespace-nowrap transition-colors duration-200",
                  selected
                    ? "bg-primary-surface text-primary-strong"
                    : "bg-grey-100 text-grey-700 hover:bg-grey-200",
                ].join(" ")}
              >
                {theme}
              </button>
            );
          })}
        </div>

        {state.theme ? (
          <button
            type="button"
            onClick={() => onApplyTheme(null)}
            className="type-label-md mt-4 text-primary-strong"
          >
            테마 해제
          </button>
        ) : null}
      </section>
    </OverlaySheet>
  );
}

/**
 * 일반 검색 안내 — 결과 목록 **상단 고정** (U18).
 *
 * 회색 면을 쓴다. **파란색을 쓰지 않는다** — 파랑은 이 제품에서 `검증된 것`의 색이고
 * 일반 검색 결과는 검증되지 않았다 (ADR-0003).
 *
 * 한 줄만 남긴다 (#35). 이 문장은 공급자 해명이 아니라 **결과의 자격**에 대한 말이라
 * 지울 수 없다 — 지원 테마 결과만 큐레이션을 통과했고, 두 목록은 같은 모양으로 온다.
 */
export function GeneralSearchNotice({ query }: { query: string | null }) {
  return (
    <p className="type-body-md rounded-lg bg-grey-100 p-3 text-grey-700">
      {query ? `'${query}'로 찾은 결과예요` : "검색어로 찾은 결과예요"} — 테마 큐레이션은
      거치지 않았어요
    </p>
  );
}

/**
 * 자유 입력이 지원 테마로 정규화됐을 때 그 사실을 한 줄로 남긴다 (#26).
 *
 * 조용히 바꾸지 않는다 — `해수용장`을 쳤는데 113곳이 나오면 사용자는 자기가 친 말이
 * 그대로 통한 줄 안다. 무엇으로 바뀌어 찾았는지 알아야 결과를 읽을 수 있다.
 */
export function ThemeNormalizedNotice({
  rawQuery,
  appliedTheme,
}: {
  rawQuery: string;
  appliedTheme: string;
}) {
  return (
    <p className="type-body-md rounded-lg bg-grey-100 p-3 text-grey-700">
      '{rawQuery}' → {appliedTheme} 테마로 찾았어요
    </p>
  );
}

/**
 * 결과가 없을 때 억지 후보 대신 가까운 지원 테마를 권한다 (#29).
 *
 * **링크다.** 전에는 문장 안의 글자라 눌러도 아무 일이 없었는데, 0건 화면에서 유일하게
 * 다음으로 갈 수 있는 자리가 바로 여기다. 누를 수 있어 보이면 누를 수 있어야 한다.
 */
export function SuggestedThemes({
  themes,
  hrefFor,
}: {
  themes: string[];
  /** 그 테마로 다시 찾는 주소. 걸려 있던 다른 조건(시·군 등)은 호출자가 지킨다. */
  hrefFor: (theme: string) => string;
}) {
  if (themes.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="type-body-md text-grey-700">이런 테마는 어떠세요?</p>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {themes.map((theme) => (
          <Link
            key={theme}
            to={hrefFor(theme)}
            className="type-label-md inline-flex h-10 shrink-0 items-center rounded-sm bg-grey-100 px-3 whitespace-nowrap text-grey-700 transition-colors duration-200 hover:bg-grey-200"
          >
            {theme}
          </Link>
        ))}
      </div>
    </div>
  );
}
