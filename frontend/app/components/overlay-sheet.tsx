import { useEffect, useRef } from "react";

/**
 * 오버레이 시트의 공통 껍데기 (검색 · 날짜 · 저장 편집).
 *
 * 셋 다 같은 규칙을 따른다 (WIREFRAME §시트 3종):
 * - **히스토리 엔트리를 가진다** → 뒤로가기가 한 겹씩 닫는다 (H3 비상구). 열림 상태가
 *   URL에 있으므로 이 컴포넌트는 닫기 요청만 올려보내고, 실제 닫힘은 라우팅이 한다.
 * - `[✕ 닫기]` 상시 노출 · 배경 탭으로도 닫힘 · Esc로도 닫힘.
 */
export function OverlaySheet({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /** 시트 하단에 고정되는 확정 동작. 스크롤과 무관하게 항상 닿는다. */
  footer?: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    // 시트가 열리면 뒤 화면이 스크롤되지 않게 한다.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // 열리자마자 시트 안으로 초점을 옮긴다 — 키보드 사용자가 시트 밖에 남지 않게.
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      {/* 딤 — 측정값 rgba(0, 12, 30, 0.8) */}
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(0,12,30,0.8)]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="relative flex max-h-[92dvh] w-full max-w-[560px] flex-col rounded-t-xl bg-surface sm:rounded-xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 px-gutter pt-5">
          <h2 className="type-headline-md text-grey-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="type-label-lg inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-grey-100 text-grey-700 transition-colors duration-200 hover:bg-grey-200"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-gutter py-6">{children}</div>

        {footer ? (
          <div className="shrink-0 px-gutter pb-[calc(env(safe-area-inset-bottom)+20px)]">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="type-label-lg h-12 w-full rounded-md bg-primary-strong px-4 text-surface transition-colors duration-200 hover:bg-primary-deep disabled:bg-grey-100 disabled:text-grey-400"
    >
      {children}
    </button>
  );
}
