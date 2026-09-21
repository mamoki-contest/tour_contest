import { useEffect, useState } from "react";

import { markHelpSeen, readHelpSeen } from "./help-seen";

/**
 * 도움말을 봤는지 — **열린 상태를 보고** 기록한다 (#41).
 *
 * 전에는 탐색 홈의 ⓘ 클릭 핸들러가 기록했다. 그러면 도움말로 가는 길이 버튼 하나일
 * 때만 맞다. 상세·저장 화면의 ⓘ 는 링크라 그 길로 도움말을 다 읽어도 `아직 안 봤음`
 * 표시가 남았고, 주소를 직접 친 진입(`?sheet=help`)도 마찬가지였다.
 *
 * 그래서 판정을 **클릭이 아니라 상태**에 건다. 도움말이 열린 화면이면 그 화면이
 * 무엇이든, 어떤 길로 열렸든 같은 사실을 기록한다.
 *
 * 첫 렌더는 `봤다`로 시작한다 — 서버는 이 값을 알 수 없으므로 반대로 두면
 * 하이드레이션 직후 점이 한 번 깜빡였다가 사라진다.
 */
export function useHelpSeen(helpOpen: boolean): boolean {
  const [seen, setSeen] = useState(true);

  useEffect(() => setSeen(readHelpSeen()), []);

  useEffect(() => {
    if (!helpOpen) return;
    markHelpSeen();
    setSeen(true);
  }, [helpOpen]);

  return seen;
}
