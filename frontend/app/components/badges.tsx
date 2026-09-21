/**
 * 값이 없다는 사실은 색이 아니라 형태로 말한다 — 점선 테두리에 채움 없음.
 * 채운 색은 "값이 있다"는 뜻이고, 결측에 옅은 색을 채우면 낮은 값으로 읽힌다.
 */
export function NoDataBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="type-label-md inline-flex items-center rounded-sm border border-dashed border-grey-300 bg-surface px-2 py-1 whitespace-nowrap text-grey-700">
      {children}
    </span>
  );
}

/**
 * 낡았지만 있는 값 (#21).
 *
 * 점선(`값이 없다`의 약속)도, 빨강(오류)도 쓰지 않는다 — 최종 정상 데이터는 없는
 * 값도 오류도 아니고 **지금 줄 수 있는 최선**이다. 실선 테두리에 채움 없음으로,
 * `사실 배지`(채운 회색 면)와 `정보 없음`(점선) 사이에 선다.
 */
export function StaleBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="type-label-md inline-flex items-center rounded-sm border border-grey-300 bg-surface px-2 py-1 whitespace-nowrap text-grey-700">
      {children}
    </span>
  );
}

/** 값이 있는 사실 배지. 회색 면 — 파랑은 화면당 행동 하나에만 쓴다. */
export function FactBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="type-label-md inline-flex items-center rounded-sm bg-grey-100 px-2 py-1 whitespace-nowrap text-grey-700">
      {children}
    </span>
  );
}
