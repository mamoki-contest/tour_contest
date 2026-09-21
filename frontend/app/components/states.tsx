import { withParticle } from "../lib/format";

/**
 * 빈 결과 · 오류 상태. 둘 다 다음 행동 버튼을 가진다 — 막다른 길을 만들지 않는다.
 */

export function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-grey-50 p-5">
      <p className="type-body-lg text-grey-700">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/** 무엇이 실패했는지 이름을 말한다. 한 섹션의 실패가 화면 전체를 대체하지 않는다. */
export function ErrorState({
  dataName,
  action,
}: {
  dataName: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-red-surface p-5" role="alert">
      <p className="type-body-lg text-red-deep">
        {withParticle(dataName, "을", "를")} 불러오지 못했어요
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function SecondaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="type-label-lg h-12 rounded-md bg-grey-100 px-4 text-grey-700 transition-colors duration-200 hover:bg-grey-200 disabled:bg-grey-100 disabled:text-grey-400"
    >
      {children}
    </button>
  );
}

/**
 * 신호 아래 한 줄 캡션 (#35).
 *
 * 전에는 이 자리에 공급자 이름과 해명 문장이 함께 실렸다. 이제 남는 것은 **기준
 * 시점**뿐이고, 값이 낡았으면(`STALE`) 그 사실이 시점보다 먼저 온다. 쓸 말이 없으면
 * 줄 자체를 그리지 않는다 — 빈 자리를 문구로 메우지 않는다.
 */
export function DataNote({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return <p className="type-caption mt-2 text-grey-600">{children}</p>;
}

/**
 * 최종 정상 데이터 안내 (#21).
 *
 * `STALE` 은 값이 **있지만 낡은** 상태다. 없는 값(`정보 없음`)과 다른 문구를 쓰고,
 * 다른 형태를 쓴다 — 점선 배지는 `값이 없다`의 약속이라 여기에 쓰면 뜻이 섞인다.
 * 색으로 경고하지도 않는다: 낡은 값은 오류가 아니라 지금 줄 수 있는 최선이다.
 */
export function StaleNote({ caption }: { caption: string }) {
  return (
    <p className="type-caption mt-2 rounded-sm bg-grey-100 px-2 py-1 text-grey-700">{caption}</p>
  );
}
