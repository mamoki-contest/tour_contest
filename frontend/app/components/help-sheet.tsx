import { OverlaySheet } from "./overlay-sheet";

/**
 * 도움말 시트 (#35, WIREFRAME R1).
 *
 * 신호 설명이 모이는 **한 자리**다. 전에는 화면마다 캡션이 같은 해명을 되풀이했다 —
 * `실제 방문객 수가 아니에요`, `지금 사람 수가 아니에요`, `미래 날짜 인파와 다른
 * 정보예요`. 문장이 많아질수록 화면은 사용자가 행동하는 데 필요한 것을 덜 말하게
 * 됐고, 정작 각 신호가 무엇인지는 어디에도 온전히 쓰여 있지 않았다.
 *
 * 그래서 화면 캡션에는 **기준 시점 한 줄만** 남기고, 무엇을 세는 값인지는 여기서
 * 한 번 말한다. 공급자·API 이름은 화면 어디에도 쓰지 않는다 — 사용자가 그 이름으로
 * 할 수 있는 일이 없다. 백엔드 응답의 출처 필드는 그대로 두고 렌더만 바꾼 것이라,
 * 디버깅에 필요한 값은 사라지지 않았다.
 *
 * 정적 텍스트다. 데이터를 부르지 않으므로 어느 화면에서 열어도 같은 내용이다.
 */
export function HelpSheet({ onClose }: { onClose: () => void }) {
  return (
    <OverlaySheet title="이 화면의 정보들" onClose={onClose}>
      <HelpItem title="온라인 언급">
        관광지 이름이 온라인에서 얼마나 언급됐는지 센 값이에요. 실제 방문객 수가 아니고,
        지금 그곳이 붐비는지도 아니에요. 목록 정렬은 이 값을 씁니다. 이름이 모호하거나
        집계하지 못한 곳은 순위에 넣지 않고 목록 끝에 따로 모아요.
      </HelpItem>

      <HelpItem title="시·군 방문 규모">
        한 주 동안 그 시·군을 찾은 외지인·외국인 방문자 수 추정치예요. 조회한 18개
        시·군끼리만 견준 상대 순위이고, 관광지 한 곳의 혼잡도가 아니에요. 기준 기간은
        오늘과 한 달 가까이 떨어져 있어요.
      </HelpItem>

      <HelpItem title="방문 혼잡 예측">
        한 장소의 앞으로 30일 안에서 그 장소 자신의 분포를 견준 값이에요. 다른
        관광지의 같은 '한산'과 비교하면 안 돼요. 예측이 닿는 날은 날짜 시트가 보여주는
        범위까지예요.
      </HelpItem>

      <HelpItem title="지금 가는 길">
        도로 소통과 주차 잔여면은 조회한 그 시각의 사정이에요. 고른 날짜의 사람
        수와는 다른 정보이고, 주차 잔여면은 자리 수지 사람 수가 아니에요. 실시간을
        아는 주차장과 규모만 아는 주차장이 함께 옵니다.
      </HelpItem>

      <HelpItem title="최근 저장된 정보">
        어떤 값은 '최근 저장된 정보'라고 적혀 있어요. 방금 받아 온 값이 아니라 마지막으로
        정상 수신한 값이라는 뜻이에요. 값이 없는 것과는 다르고, 얼마나 지난 값인지 함께
        적어 둡니다.
      </HelpItem>

      <HelpItem title="저장한 곳">
        회원가입 없이 이 브라우저에만 보관해요. 다른 기기에서는 보이지 않고, 브라우저
        저장 데이터를 지우면 함께 사라집니다.
      </HelpItem>
    </OverlaySheet>
  );
}

function HelpItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 first:mt-0">
      <h3 className="type-title-md text-grey-800">{title}</h3>
      <p className="type-body-md mt-2 text-grey-700">{children}</p>
    </section>
  );
}

/**
 * 헤더의 ⓘ — 도움말로 가는 유일한 입구.
 *
 * 아직 한 번도 열어 보지 않았으면 점 하나를 달아 둔다. 첫 방문에 시트를 자동으로
 * 띄우지 않는 이유는, 처음 온 사람에게 가장 필요한 것이 설명이 아니라 **목록**이기
 * 때문이다. 점은 읽을 거리가 있다는 표시일 뿐 길을 막지 않는다.
 */
export function HelpButton({ unseen, onOpen }: { unseen: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`이 화면의 정보들${unseen ? " (아직 보지 않았어요)" : ""}`}
      className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-grey-100 text-grey-700 transition-colors duration-200 hover:bg-grey-200"
    >
      <span aria-hidden="true" className="type-label-lg leading-none">
        ⓘ
      </span>
      {unseen ? (
        <span
          aria-hidden="true"
          className="absolute top-1 right-1 size-2 rounded-full bg-primary-strong"
        />
      ) : null}
    </button>
  );
}
