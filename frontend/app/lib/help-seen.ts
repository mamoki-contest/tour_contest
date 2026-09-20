/**
 * 도움말을 한 번이라도 열어 봤는지 (#35, WIREFRAME R1 확정).
 *
 * R1은 `첫 사용 안내 플래그를 어디에 둘지`가 미결인 채 개발 체인으로 넘어와 있었다.
 * 여기서 정한다: **localStorage 키 하나**(`hansanada.help.seen`)이고, 개인 컬렉션
 * 스키마에는 넣지 않는다. 컬렉션은 사용자가 만든 내용이고 이것은 화면이 자기 상태를
 * 기억하는 표시라, 같은 저장값에 섞으면 컬렉션을 지울 때 함께 사라진다.
 *
 * 저장소가 막혀 있으면 `아직 안 봤다`로 읽는다 — 그래야 점 하나가 더 보일 뿐,
 * 화면이 멈추지 않는다.
 */

const HELP_SEEN_KEY = "hansanada.help.seen";

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function readHelpSeen(): boolean {
  try {
    return storage()?.getItem(HELP_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markHelpSeen(): void {
  try {
    storage()?.setItem(HELP_SEEN_KEY, "1");
  } catch {
    // 못 적으면 다음에도 점이 보인다. 그뿐이다.
  }
}
