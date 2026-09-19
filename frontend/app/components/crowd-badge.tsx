import type { CrowdLevel } from "../lib/contract";
import { NoDataBadge } from "./badges";

/**
 * 방문 혼잡도 예측 배지 (슬라이스 #6).
 *
 * 문구가 **항상 장소를 한정한다** — `이 장소 기준 한산`. `한산` 두 글자만 쓰면 장소끼리
 * 비교하는 말이 되어버린다.
 *
 * 강조되는 것은 `한산` 하나뿐이다. 사용자가 찾는 것이 그것이기 때문이고, `혼잡`을 크게
 * 외치면 카드끼리 견주게 되어 장소 간 절대 순위가 생긴다 (ADR-0002).
 */
const LEVEL_STYLE: Record<CrowdLevel, { label: string; className: string }> = {
  QUIET: { label: "한산", className: "bg-primary-surface text-primary-strong" },
  NORMAL: { label: "보통", className: "bg-grey-100 text-grey-700" },
  BUSY: { label: "혼잡", className: "bg-red-surface text-red-deep" },
};

export function CrowdBadge({ level }: { level: CrowdLevel }) {
  const { label, className } = LEVEL_STYLE[level];
  return (
    <span
      className={`type-label-md inline-flex items-center rounded-sm px-2 py-1 whitespace-nowrap ${className}`}
    >
      이 장소 기준 {label}
    </span>
  );
}

/**
 * 예측이 없으면 배지 자리에 이것이 온다. **배지를 숨기지 않는다** — 빈자리는
 * `예측이 좋다`는 뜻으로 읽힌다.
 */
export function NoForecastBadge() {
  return <NoDataBadge>예측 정보 없음</NoDataBadge>;
}

/**
 * 날짜 유연 탐색에서 배지 대신 오는 한산 예상일.
 * 등폭 숫자라 카드가 줄줄이 있어도 자릿수가 흔들리지 않는다.
 */
export function QuietDateValue({ date }: { date: string }) {
  return (
    <p className="type-data-value text-grey-900">
      <span className="sr-only">이 장소에서 상대적으로 한산한 예상일: </span>
      {formatQuietDate(date)}
    </p>
  );
}

function formatQuietDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "Asia/Seoul",
  }).format(parsed);
}
