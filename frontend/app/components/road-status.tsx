import type { CurrentAccess, ParkingStatus, RoadFlow } from "../lib/contract";
import {
  CONGESTION_LABEL,
  formatRealtimeLot,
  formatStaticLot,
  splitParkingLots,
} from "../lib/parking";
import { FactBadge, NoDataBadge } from "./badges";
import { formatStaleCaption, isStale } from "../lib/data-status";

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
  const roadless = access.roads.length === 0;
  // 도로도 주차도 확인하지 못한 경우에만 섹션 전체가 한 문장이 된다.
  const empty = roadless && access.parking.availability === "NO_DATA";

  return (
    <div>
      {empty ? (
        <NoDataBadge>현재 접근 정보 없음</NoDataBadge>
      ) : (
        <div className="flex flex-col gap-4">
          {/* 도로와 주차는 공급자도 시각도 달라 각자의 상태를 따로 가진다 (U7). */}
          {roadless ? (
            <NoDataBadge>도로 소통 정보 없음</NoDataBadge>
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
            </ul>
          )}

          <ParkingBlock parking={access.parking} />
        </div>
      )}

      {/*
        조회 시각은 반드시 붙는다 — 이 값은 날짜가 아니라 **시각**의 사정이라서다.
        미래 날짜의 인파와 다르다는 설명은 화면마다 되풀이하지 않고 도움말로 옮겼고,
        섹션을 가르는 일은 48px 간격과 제목이 그대로 맡는다 (U20, #35).
      */}
      <p className="type-caption mt-4 text-grey-600">
        {isStale(access.status)
          ? formatStaleCaption(access.observedAt)
          : formatObservedTime(access.observedAt)}
      </p>
    </div>
  );
}

/**
 * 주차 여건. 네 상태가 **각각 다른 문장**을 가진다.
 *
 * 특히 `NONE`(확인했고 반경 안에 없다)과 `NO_DATA`(확인하지 못했다)를 같은 말로 덮지
 * 않는다 — 앞엣것은 확인이 끝난 사실이고 뒤엣것은 아직 모른다는 고백이다. 그래서
 * `NONE` 은 채운 글자로, `NO_DATA` 는 점선 배지로 형태부터 다르다.
 */
function ParkingBlock({ parking }: { parking: ParkingStatus }) {
  if (parking.availability === "NONE") {
    return (
      <p className="type-body-lg text-grey-700">반경 1km 안에 주차장이 없어요</p>
    );
  }

  const { realtime, staticLots, hiddenStaticCount } = splitParkingLots(parking.lots);

  // 상태는 주차장이 있다고 하는데 목록이 비었다면 우리가 가리킬 곳이 없는 것과 같다.
  if (parking.availability === "NO_DATA" || realtime.length + staticLots.length === 0) {
    return <NoDataBadge>주차 정보를 확인하지 못했어요</NoDataBadge>;
  }

  return (
    <div className="flex flex-col gap-2">
      {realtime.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {realtime.map((lot) => (
            <li key={lot.name} className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="type-body-lg text-grey-700">{formatRealtimeLot(lot)}</span>
              {/* 등급은 잔여 비율의 요약이라 숫자 뒤에 온다. 색이 아니라 글자다. */}
              {lot.congestion ? <FactBadge>{CONGESTION_LABEL[lot.congestion]}</FactBadge> : null}
            </li>
          ))}
        </ul>
      ) : null}

      {staticLots.length > 0 ? (
        <div>
          <p className="type-caption text-grey-600">
            {realtime.length > 0
              ? "그 밖의 주차장은 규모만 알아요 · 실시간 잔여 정보 없음"
              : "실시간 잔여 정보 없음 · 주차장 규모만 확인했어요"}
          </p>
          <ul className="mt-1 flex flex-col gap-1">
            {staticLots.map((lot) => (
              <li key={lot.name} className="type-body-lg text-grey-700">
                {formatStaticLot(lot)}
              </li>
            ))}
          </ul>
          {hiddenStaticCount > 0 ? (
            <p className="type-caption mt-1 text-grey-600">
              그 밖에 반경 1km 안에 {hiddenStaticCount}곳이 더 있어요
            </p>
          ) : null}
        </div>
      ) : null}

      {parkingCaption(parking) ? (
        <p className="type-caption text-grey-600">{parkingCaption(parking)}</p>
      ) : null}
    </div>
  );
}

/**
 * 주차의 조회 시각. 도로와 시각이 달라 같은 캡션에 묶지 않는다.
 *
 * 실시간 값이 없으면 시각을 붙이지 않는다 — 반기마다 갱신되는 정적 정보에 시각을
 * 달면 방금 본 값처럼 읽힌다. 그때는 규모만 안다는 사실을 위의 줄이 이미 말했으므로
 * 캡션 자체를 그리지 않는다 (#35).
 */
function parkingCaption(parking: ParkingStatus): string | null {
  if (!parking.observedAt) return null;
  return isStale(parking.status)
    ? formatStaleCaption(parking.observedAt)
    : formatObservedTime(parking.observedAt);
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
