import { useCallback, useEffect, useRef, useState } from "react";

import type { SheetSnap } from "../lib/explore-params";

/**
 * 목록 바텀시트 (WIREFRAME D1) — 지도가 전면이고 목록이 그 위에 뜬다.
 *
 * 세 스냅: 접힘(헤더만) · 중간(55%, 첫 진입 기본 D4) · 펼침(상단 여백만).
 * 데스크톱(1024px~)에서는 시트 개념이 사라지고 우측 고정 컬럼이 된다 (D2).
 */

const SNAP_ORDER: SheetSnap[] = ["peek", "middle", "full"];

/** 각 스냅이 차지하는 뷰포트 높이 비율. 접힘은 헤더만 남기므로 픽셀로 따로 잡는다. */
const SNAP_RATIO: Record<SheetSnap, number> = {
  peek: 0,
  middle: 0.55,
  full: 0.92,
};

const PEEK_HEIGHT_PX = 132;

function heightFor(snap: SheetSnap, viewportHeight: number): number {
  if (snap === "peek") return PEEK_HEIGHT_PX;
  return Math.round(viewportHeight * SNAP_RATIO[snap]);
}

/** 놓은 높이에서 가장 가까운 스냅으로 붙인다. 중간 상태로 남겨두지 않는다. */
function nearestSnap(height: number, viewportHeight: number): SheetSnap {
  let best: SheetSnap = "middle";
  let bestGap = Number.POSITIVE_INFINITY;
  for (const snap of SNAP_ORDER) {
    const gap = Math.abs(heightFor(snap, viewportHeight) - height);
    if (gap < bestGap) {
      bestGap = gap;
      best = snap;
    }
  }
  return best;
}

export function BottomSheet({
  snap,
  onSnapChange,
  legend,
  header,
  children,
}: {
  snap: SheetSnap;
  onSnapChange: (snap: SheetSnap) => void;
  /**
   * 방문 규모 범례. 시트 바로 위에 붙어 함께 움직인다 (U1) — 중간 스냅에서 시트가
   * 범례를 가리면 지도 색이 무슨 뜻인지 알 길이 없어진다.
   */
  legend?: React.ReactNode;
  /** 시트와 함께 움직이는 고정 헤더 — 제목·정렬 토글·출처 캡션이 여기 산다. */
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  const [viewportHeight, setViewportHeight] = useState(0);
  /** 데스크톱에서는 시트가 아니라 우측 컬럼이므로 높이를 지정하지 않는다 (D2). */
  const [isDesktop, setIsDesktop] = useState(false);
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const dragRef = useRef<{ pointerId: number; startY: number; startHeight: number } | null>(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      setViewportHeight(window.innerHeight);
      setIsDesktop(desktop.matches);
    };
    sync();
    window.addEventListener("resize", sync);
    desktop.addEventListener("change", sync);
    return () => {
      window.removeEventListener("resize", sync);
      desktop.removeEventListener("change", sync);
    };
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (viewportHeight === 0) return;
      dragRef.current = {
        pointerId: event.pointerId,
        startY: event.clientY,
        startHeight: heightFor(snap, viewportHeight),
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [snap, viewportHeight],
  );

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    // 위로 끌면 커진다 — 손가락이 올라간 만큼 시트가 자란다.
    setDragHeight(Math.max(PEEK_HEIGHT_PX, drag.startHeight + (drag.startY - event.clientY)));
  }, []);

  const endDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      dragRef.current = null;
      if (dragHeight !== null) {
        const next = nearestSnap(dragHeight, viewportHeight);
        setDragHeight(null);
        if (next !== snap) onSnapChange(next);
      }
    },
    [dragHeight, onSnapChange, snap, viewportHeight],
  );

  /** 핸들을 눌러도 스냅이 바뀐다 — 드래그를 못 하는 환경에서도 세 단계에 닿게 한다. */
  const cycle = useCallback(() => {
    onSnapChange(snap === "full" ? "peek" : snap === "peek" ? "middle" : "full");
  }, [onSnapChange, snap]);

  const step = useCallback(
    (direction: 1 | -1) => {
      const next = SNAP_ORDER[SNAP_ORDER.indexOf(snap) + direction];
      if (next) onSnapChange(next);
    },
    [onSnapChange, snap],
  );

  /**
   * 높이는 인라인 스타일로 직접 준다. Tailwind 임의값(`h-[var(...)]`)은 콤마가 든 폴백을
   * 넣으면 유틸리티 자체가 생성되지 않아 값이 조용히 무시된다.
   * 뷰포트를 재기 전(SSR 첫 페인트)에는 중간 스냅 비율로 그려 깜빡임을 막는다.
   */
  const height = dragHeight ?? (viewportHeight > 0 ? heightFor(snap, viewportHeight) : null);

  return (
    <section
      aria-label="관광지 목록"
      style={
        isDesktop
          ? undefined
          : { height: height !== null ? `${height}px` : `${SNAP_RATIO.middle * 100}dvh` }
      }
      className={[
        "fixed inset-x-0 bottom-0 z-20 flex flex-col rounded-t-xl bg-surface shadow-float",
        dragHeight === null ? "transition-[height] duration-200" : "",
        // 데스크톱에서는 시트가 아니라 우측 컬럼 — 고정 해제, 그림자·라운드 없음.
        "lg:static lg:z-auto lg:h-auto lg:max-h-none lg:rounded-none lg:bg-transparent lg:shadow-none",
        "lg:w-full lg:transition-none",
      ].join(" ")}
    >
      {legend ? (
        <div className="absolute bottom-full left-0 mb-3 max-w-[280px] px-gutter lg:hidden">
          {legend}
        </div>
      ) : null}

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="shrink-0 touch-none px-gutter pt-2 lg:hidden"
      >
        <button
          type="button"
          onClick={cycle}
          onKeyDown={(event) => {
            if (event.key === "ArrowUp") {
              event.preventDefault();
              step(1);
            } else if (event.key === "ArrowDown") {
              event.preventDefault();
              step(-1);
            }
          }}
          aria-label={`목록 시트 ${snap === "peek" ? "접힘" : snap === "middle" ? "중간" : "펼침"} — 누르면 크기가 바뀌어요`}
          className="mx-auto block h-6 w-full max-w-24 cursor-grab"
        >
          <span className="mx-auto block h-1 w-10 rounded-full bg-grey-300" />
        </button>
      </div>

      <div className="shrink-0 px-gutter lg:px-0">{header}</div>

      {/* 하단 내비 높이만큼 여백을 남긴다 (U11) — 내비가 시트 위에 항상 뜨기 때문이다. */}
      <div className="min-h-0 flex-1 overflow-y-auto px-gutter pt-6 pb-[calc(64px+env(safe-area-inset-bottom))] lg:overflow-visible lg:px-0 lg:pb-0">
        {children}
      </div>
    </section>
  );
}
