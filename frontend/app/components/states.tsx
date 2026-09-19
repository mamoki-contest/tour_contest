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
