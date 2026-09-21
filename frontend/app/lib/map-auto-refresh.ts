/**
 * 지도를 움직이면 보이는 범위로 목록을 다시 부른다 (#48).
 *
 * 버튼을 눌러야 범위가 확정되던 자리를 지도 몸짓이 대신한다. 그러려면 두 가지를
 * 가려야 한다 — **누가 움직였는가**(사용자인가 프로그램인가)와 **언제 끝났는가**
 * (미는 도중마다 부르면 조회가 손가락을 따라다닌다).
 *
 * 그 판정만 여기 모아 둔다. 지도 SDK도 URL도 모르는 채로 두는 이유는 하나다 —
 * 지도 없이 검증할 수 있어야 하기 때문이다. 시간마저 밖에서 주입받으므로 테스트는
 * 실제로 기다리지 않는다.
 */

import type { MapViewport } from "./explore-params";

/** 사용자 조작이 끝났다고 보기까지 기다리는 시간(ms). 이슈 #48 의 300~500 중간값. */
export const AUTO_REFRESH_DEBOUNCE_MS = 400;

/**
 * 프로그램이 지도를 옮긴 뒤 이벤트가 잦아들 때까지 무시할 시간(ms).
 *
 * 카카오맵은 `setBounds`·`setLevel` 에도 `zoom_changed` 를 쏜다. 걸러내지 않으면
 * 시·군을 골라 지도가 이동한 것을 `사용자가 움직였다` 로 읽어, 방금 고른 시·군이
 * 자기가 만든 지도 범위에 곧바로 덮인다.
 */
export const PROGRAMMATIC_QUIET_MS = 400;

/**
 * 주소의 자리와 지도가 보고 있는 자리를 같다고 볼 만큼의 차이(도).
 *
 * 주소에는 소수점 여섯 자리로 적히므로(`formatViewportCenter`) 되읽은 값은 원래
 * 값과 반올림만큼 어긋난다. 그보다 잘게 보면 지도가 제 자리를 남의 자리로 읽고
 * 스스로를 계속 옮긴다.
 */
export const VIEWPORT_EPSILON = 1e-5;

/**
 * 두 자리가 같은가 — 주소가 **밖에서** 바뀌었는지 가리는 데 쓴다 (#48).
 *
 * 사용자가 지도를 밀면 주소는 지도를 따라 적히므로 둘이 같다. 뒤로가기가 옛 주소를
 * 되살렸을 때만 달라진다 — 그때만 지도를 주소 쪽으로 옮긴다. 이 구분이 없으면 지도를
 * 미는 것과 주소를 따라가는 것이 서로를 밀어 무한히 오간다.
 */
export function isSameViewport(
  a: MapViewport | null,
  b: MapViewport | null,
  epsilon: number = VIEWPORT_EPSILON,
): boolean {
  if (a === null || b === null) return a === b;
  return (
    a.level === b.level &&
    Math.abs(a.lat - b.lat) <= epsilon &&
    Math.abs(a.lng - b.lng) <= epsilon
  );
}

/** 시계를 밖에서 받는다 — 테스트가 진짜로 기다리지 않게. */
export interface Timers {
  set(callback: () => void, ms: number): number;
  clear(handle: number): void;
}

/** 브라우저의 시계. 서버에서는 지도가 없으므로 불릴 일이 없다. */
export const windowTimers: Timers = {
  set: (callback, ms) => window.setTimeout(callback, ms),
  clear: (handle) => window.clearTimeout(handle),
};

export interface MapGestureTracker {
  /**
   * 프로그램이 지도를 옮긴다 — 그 사이에 오는 이벤트는 사용자의 몸짓이 아니다.
   *
   * 예약돼 있던 재조회도 함께 지운다. 사용자가 밀던 중에 시·군을 고르면 지도가
   * 그리로 옮겨 가는데, 밀던 때 예약된 재조회가 뒤늦게 깨어나면 방금 고른 시·군을
   * 자기가 만든 지도 범위로 덮어 버린다.
   */
  runProgrammatic(move: () => void): void;
  /**
   * 지도가 쏜 이벤트 하나를 받는다.
   *
   * 사용자의 몸짓이면 `true` 를 돌려주고 재조회를 미뤄 예약한다. 이미 예약돼 있으면
   * 다시 민다 — 연속 이동에서는 마지막 한 번만 조회한다.
   */
  handleMapEvent(): boolean;
  /** 지금 프로그램 이동 중인지. 화면이 아니라 검증이 읽는 값이다. */
  isSuppressed(): boolean;
  /** 예약된 재조회를 버린다 (언마운트). */
  cancel(): void;
}

export function createMapGestureTracker({
  onSettled,
  timers = windowTimers,
  debounceMs = AUTO_REFRESH_DEBOUNCE_MS,
  quietMs = PROGRAMMATIC_QUIET_MS,
}: {
  /** 사용자 조작이 잦아들었을 때 한 번 불린다. */
  onSettled: () => void;
  timers?: Timers;
  debounceMs?: number;
  quietMs?: number;
}): MapGestureTracker {
  /*
   * 겹쳐 일어나는 프로그램 이동을 세는 깊이다 — 불린 값이 아니라 수인 이유는,
   * 먼저 시작한 이동의 조용한 시간이 끝나면서 나중 이동의 억제까지 함께 풀리면
   * 안 되기 때문이다.
   */
  let depth = 0;
  let pending: number | null = null;

  const cancel = () => {
    if (pending !== null) {
      timers.clear(pending);
      pending = null;
    }
  };

  return {
    runProgrammatic(move) {
      depth += 1;
      cancel();
      try {
        move();
      } finally {
        // 이동 자체가 실패해도 억제는 반드시 풀린다 — 풀리지 않으면 지도가 영영 굳는다.
        timers.set(() => {
          depth = Math.max(0, depth - 1);
        }, quietMs);
      }
    },

    handleMapEvent() {
      if (depth > 0) return false;
      cancel();
      pending = timers.set(() => {
        pending = null;
        onSettled();
      }, debounceMs);
      return true;
    },

    isSuppressed() {
      return depth > 0;
    },

    cancel,
  };
}
