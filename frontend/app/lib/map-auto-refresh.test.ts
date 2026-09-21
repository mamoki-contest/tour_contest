import { describe, expect, it } from "vitest";

import {
  AUTO_REFRESH_DEBOUNCE_MS,
  PROGRAMMATIC_QUIET_MS,
  createMapGestureTracker,
  isSameViewport,
  type Timers,
} from "./map-auto-refresh";

/**
 * 시계를 손으로 돌린다 — 디바운스를 검증하려고 실제로 400ms 를 기다리면 테스트가
 * 느려지는 데다, 느린 기계에서 깜빡 어긋난다.
 */
function fakeClock() {
  let now = 0;
  let nextHandle = 1;
  const jobs = new Map<number, { at: number; callback: () => void }>();

  const timers: Timers = {
    set(callback, ms) {
      const handle = nextHandle++;
      jobs.set(handle, { at: now + ms, callback });
      return handle;
    },
    clear(handle) {
      jobs.delete(handle);
    },
  };

  const advance = (ms: number) => {
    now += ms;
    // 예약 순서대로 깨운다 — 같은 시각에 걸린 것들이 뒤집히지 않게.
    for (const [handle, job] of [...jobs.entries()].sort((a, b) => a[1].at - b[1].at)) {
      if (job.at <= now) {
        jobs.delete(handle);
        job.callback();
      }
    }
  };

  return { timers, advance };
}

function tracker() {
  const { timers, advance } = fakeClock();
  const calls: number[] = [];
  const subject = createMapGestureTracker({
    onSettled: () => calls.push(calls.length + 1),
    timers,
  });
  return { subject, advance, calls };
}

describe("지도 몸짓 추적 (#48)", () => {
  it("사용자가 움직이면 디바운스 뒤에 한 번 재조회한다", () => {
    const { subject, advance, calls } = tracker();

    expect(subject.handleMapEvent()).toBe(true);
    advance(AUTO_REFRESH_DEBOUNCE_MS - 1);
    expect(calls).toHaveLength(0);

    advance(1);
    expect(calls).toHaveLength(1);
  });

  it("연속으로 움직이면 마지막 한 번만 조회한다 — 조회가 손가락을 따라다니지 않는다", () => {
    const { subject, advance, calls } = tracker();

    subject.handleMapEvent();
    advance(200);
    subject.handleMapEvent();
    advance(200);
    subject.handleMapEvent();
    advance(200);

    expect(calls).toHaveLength(0);

    advance(200);
    expect(calls).toHaveLength(1);
  });

  it("프로그램이 옮기는 동안의 이벤트는 사용자의 몸짓이 아니다", () => {
    const { subject, advance, calls } = tracker();

    subject.runProgrammatic(() => {
      // 시·군 선택이 부른 setBounds 가 zoom_changed 를 쏜 상황.
      expect(subject.handleMapEvent()).toBe(false);
    });
    // 이동이 끝난 직후에 오는 뒤늦은 이벤트도 아직 사용자의 것이 아니다.
    expect(subject.handleMapEvent()).toBe(false);

    advance(AUTO_REFRESH_DEBOUNCE_MS * 2);
    expect(calls).toHaveLength(0);
  });

  it("조용한 시간이 지나면 다시 사용자의 몸짓으로 센다", () => {
    const { subject, advance, calls } = tracker();

    subject.runProgrammatic(() => {});
    advance(PROGRAMMATIC_QUIET_MS);

    expect(subject.isSuppressed()).toBe(false);
    expect(subject.handleMapEvent()).toBe(true);
    advance(AUTO_REFRESH_DEBOUNCE_MS);
    expect(calls).toHaveLength(1);
  });

  it("겹친 프로그램 이동은 마지막 것까지 끝나야 억제가 풀린다", () => {
    const { subject, advance } = tracker();

    subject.runProgrammatic(() => {});
    advance(PROGRAMMATIC_QUIET_MS / 2);
    subject.runProgrammatic(() => {});

    advance(PROGRAMMATIC_QUIET_MS / 2);
    // 먼저 시작한 이동의 조용한 시간이 끝났을 뿐이다.
    expect(subject.isSuppressed()).toBe(true);

    advance(PROGRAMMATIC_QUIET_MS / 2);
    expect(subject.isSuppressed()).toBe(false);
  });

  it("프로그램 이동은 예약돼 있던 재조회를 지운다 — 방금 고른 시·군을 덮지 않는다", () => {
    const { subject, advance, calls } = tracker();

    subject.handleMapEvent();
    advance(100);
    // 밀던 중에 시·군을 고르면 지도가 그리로 옮겨 간다.
    subject.runProgrammatic(() => {});
    advance(AUTO_REFRESH_DEBOUNCE_MS * 2);

    expect(calls).toHaveLength(0);
  });

  it("치운 뒤에는 예약된 재조회가 깨어나지 않는다", () => {
    const { subject, advance, calls } = tracker();

    subject.handleMapEvent();
    subject.cancel();
    advance(AUTO_REFRESH_DEBOUNCE_MS * 2);

    expect(calls).toHaveLength(0);
  });

  it("이동이 예외를 던져도 억제는 풀린다 — 지도가 영영 굳지 않는다", () => {
    const { subject, advance } = tracker();

    expect(() =>
      subject.runProgrammatic(() => {
        throw new Error("setBounds 실패");
      }),
    ).toThrow();

    advance(PROGRAMMATIC_QUIET_MS);
    expect(subject.isSuppressed()).toBe(false);
  });
});

/**
 * 뒤로가기가 옛 주소를 되살렸을 때만 지도를 주소 쪽으로 옮긴다 (U6 · #48).
 *
 * 사용자가 민 직후에는 주소가 지도를 따라 적히므로 둘이 같아야 한다 — 같다고 보지
 * 못하면 지도가 제 자리를 남의 자리로 읽고 스스로를 계속 옮긴다.
 */
describe("주소의 자리와 지도의 자리 (#48)", () => {
  const showing = { lat: 37.736181234, lng: 127.667631987, level: 11 };

  it("주소에 소수점 여섯 자리로 적혔다 되읽은 값은 같은 자리다", () => {
    const written = {
      lat: Number(showing.lat.toFixed(6)),
      lng: Number(showing.lng.toFixed(6)),
      level: showing.level,
    };

    expect(isSameViewport(showing, written)).toBe(true);
  });

  it("뒤로가기가 되살린 다른 자리는 다르다고 본다", () => {
    expect(isSameViewport(showing, { ...showing, lat: 37.98456 })).toBe(false);
    expect(isSameViewport(showing, { ...showing, lng: 128.325 })).toBe(false);
  });

  it("확대 단계가 다르면 중심이 같아도 다른 자리다", () => {
    expect(isSameViewport(showing, { ...showing, level: 12 })).toBe(false);
  });

  it("주소에 자리가 없으면 비교할 것이 없다 — 지도를 빼앗지 않는다", () => {
    expect(isSameViewport(showing, null)).toBe(false);
    expect(isSameViewport(null, null)).toBe(true);
  });
});
