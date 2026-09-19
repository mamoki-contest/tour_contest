import type { CurrentAccess, RoadFlow } from "../lib/contract";
import { NoDataBadge } from "./badges";

/**
 * 현재 접근 혼잡 (슬라이스 #8).
 *
 * **배지가 아니라 점(dot)이다.** 다른 신호와 형태를 다르게 만들어야 섞여 읽히지 않는다
 * — 지도는 면, 혼잡 예측은 배지, 도로는 점 (ADR-0002).
 *
 * 초록·주황·빨강은 도로 소통의 관습 문법이라 여기서만 쓴다. 색만으로 구분하지 않고
 * 점 옆에 항상 글자가 있다.
 */
const FLOW_STYLE: Record<RoadFlow, { label: string; dot: string }> = {
  SMOOTH: { label: "원활", dot: "bg-green" },
  SLOW: { label: "서행", dot: "bg-amber" },
  JAM: { label: "정체", dot: "bg-red" },
};

export function CurrentAccessSection({ access }: { access: CurrentAccess }) {
  const empty = access.roads.length === 0 && access.parking === null;

  return (
    <div>
      {empty ? (
        <NoDataBadge>현재 접근 정보 없음</NoDataBadge>
      ) : (
        <ul className="flex flex-col gap-2">
          {access.roads.map((road) => {
            const { label, dot } = FLOW_STYLE[road.flow];
            return (
              <li key={road.label} className="flex items-center gap-2">
                <span className={`size-2 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
                <span className="type-body-lg text-grey-700">
                  {road.label} {label}
                  {road.speedKph !== null ? ` · 평균 ${road.speedKph}km/h` : ""}
                </span>
              </li>
            );
          })}

          <li>
            {access.parking && access.parking.available !== null ? (
              <span className="type-body-lg text-grey-700">
                주차 잔여 {access.parking.available}면
                {access.parking.total !== null ? ` / 총 ${access.parking.total}면` : ""}
              </span>
            ) : (
              <NoDataBadge>현재 주차 정보 없음</NoDataBadge>
            )}
          </li>
        </ul>
      )}

      {/*
        조회 시각이 반드시 붙는다. 그리고 이것이 미래 날짜의 인파와 다른 정보라는 사실을
        문장으로 못 박는다 — 바로 위 섹션이 30일 예측이라 섞여 읽히기 쉽다 (U20).
      */}
      <p className="type-caption mt-4 text-grey-600">
        {[access.source ?? "출처 없음", formatObservedTime(access.observedAt)].join(" · ")}
      </p>
      <p className="type-caption text-grey-600">
        지금 가는 길의 사정이에요. 고른 날짜의 사람 수와는 다른 정보예요.
      </p>
    </div>
  );
}

/** 접근 정보는 날짜가 아니라 **시각**이 중요하다 — 분 단위까지 보여준다. */
function formatObservedTime(observedAt: string | null): string {
  if (!observedAt) return "조회 시각 없음";
  const parsed = new Date(observedAt);
  if (Number.isNaN(parsed.getTime())) return "조회 시각 없음";
  return `${new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(parsed)} 조회`;
}
