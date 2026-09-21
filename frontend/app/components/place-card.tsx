import { Link } from "react-router";

import type { Place, RelatedPlace } from "../lib/contract";
import type { DateMode } from "../lib/explore-params";
import { formatObservedAtShort } from "../lib/format";
import { formatStatusCaption, isStale } from "../lib/data-status";
import { placeSignals } from "../lib/place-signals";
import { FactBadge, NoDataBadge, StaleBadge } from "./badges";
import { CrowdBadge, NoForecastBadge, QuietDateValue } from "./crowd-badge";

/**
 * 관광지 카드 — 이 제품의 기본 단위.
 * 구성 순서가 고정이다: 사진 → 이름(2줄) → 주소(1줄) → 배지 한 줄 → 신호 셋 → 기준 시점 캡션.
 * 캡션은 마지막이고, 공급자 이름 없이 기준 시점만 적는다 (#35).
 */
export function PlaceCard({
  place,
  href,
  dateMode = "FLEXIBLE",
  /** 저장 버튼. 카드 탭 영역과 겹치지 않게 별도 레이어로 얹는다 (U13). */
  saveButton,
}: {
  place: Place;
  /**
   * 상세로 가는 주소 (#42).
   *
   * 카드가 스스로 만들지 않는다 — **어디서 눌린 카드인지**에 따라 상세가 돌아갈
   * 자리가 다르고(탐색 홈의 조건 / 나만의 지도), 그 사정은 부모만 안다.
   * 기본값을 두지 않는 것도 같은 이유다: 조건 없는 주소가 조용히 새어 나가면
   * 상세의 `← 뒤로`가 다시 제자리를 잃는다.
   */
  href: string;
  dateMode?: DateMode;
  saveButton?: React.ReactNode;
}) {
  const rank = place.regionCenterRank;
  const forecast = place.forecast;

  return (
    // `min-w-0` — 목록이 격자라서, 이것이 없으면 칸의 자동 최소 크기가 카드의
    // min-content(아래 주소 줄의 `truncate` 한 줄 길이)가 되어 카드가 목록 밖으로 나간다.
    <article className="relative min-w-0 rounded-xl bg-surface p-4">
      {/* 저장 버튼의 40px 타깃을 카드 링크 밖에 둔다 — 저장과 상세 이동이 충돌하지 않게. */}
      {saveButton ? <div className="absolute top-6 right-6 z-10">{saveButton}</div> : null}

      <Link to={href} className="block rounded-lg transition-colors duration-200 hover:bg-grey-50">
        {place.photoUrl ? (
          <img
            src={place.photoUrl}
            alt=""
            loading="lazy"
            className="mb-2 aspect-[4/3] w-full rounded-lg object-cover"
          />
        ) : (
          <div className="type-caption mb-2 flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-grey-100 text-grey-600">
            사진 없음
          </div>
        )}

        <h3 className="type-title-md line-clamp-2 text-grey-900">{place.name}</h3>

        <p className="type-body-md mt-2 truncate text-grey-600">
          {place.address ?? "주소 정보 없음"}
        </p>
      </Link>

      {/*
        날짜 모드가 무엇을 보여줄지 정한다.
        고정: 선택일의 이 장소 기준 수준 · 유연: 이 장소의 한산 예상일.
        어느 쪽도 없으면 자리를 비우지 않고 `예측 정보 없음`이 온다.
      */}
      {dateMode === "FLEXIBLE" && forecast.quietDate ? (
        <div className="mt-2">
          <QuietDateValue date={forecast.quietDate} />
          <p className="type-caption text-grey-600">이 장소에서 한산할 것으로 보이는 날이에요</p>
        </div>
      ) : null}

      <div className="mt-2 flex flex-wrap gap-2">
        {place.category ? <FactBadge>{place.category}</FactBadge> : null}

        {dateMode === "FIXED" ? (
          forecast.selectedDateLevel ? (
            <CrowdBadge level={forecast.selectedDateLevel} />
          ) : (
            <NoForecastBadge />
          )
        ) : forecast.quietDate === null ? (
          <NoForecastBadge />
        ) : null}

        {/*
          예측이 최종 정상 데이터로 왔으면 그 사실을 배지로 말한다 (#21).
          갓 받은 예측과 며칠 묵은 예측이 같은 `한산`으로 보이면 헛걸음이 된다.
        */}
        {isStale(forecast.status) ? <StaleBadge>최근 저장된 예측</StaleBadge> : null}

        {rank.value !== null ? (
          <FactBadge>시·군 중심관광지 {rank.value}위</FactBadge>
        ) : (
          <NoDataBadge>중심관광지 순위 미산정</NoDataBadge>
        )}
      </div>

      {/*
        장소 발견 신호 셋 — 온라인 언급량 · TMAP 검색순위 · 입장객 수.
        **각각 제 줄에 제 기준 시점과 함께** 선다. 합치지 않고, 어느 하나가 다른 하나의
        결측을 대신하지도 않는다 (PRD v4 §신호 결합). 없는 신호도 자리를 비우지 않는다.
      */}
      <ul className="mt-2 space-y-1">
        {placeSignals(place).map((signal) => (
          <li key={signal.key}>
            {signal.kind === "value" ? (
              <p className="type-body-md text-grey-800">
                {signal.value}
                {signal.basis ? (
                  <span className="type-caption text-grey-600"> · {signal.basis}</span>
                ) : null}
              </p>
            ) : (
              <NoDataBadge>{signal.label}</NoDataBadge>
            )}
          </li>
        ))}
      </ul>

      {/* 카드 캡션은 기준 시점 한 줄이다 — 공급자 이름은 화면에 적지 않는다 (#35). */}
      <p className="type-caption mt-2 text-grey-600">{formatObservedAtShort(rank.observedAt)}</p>
    </article>
  );
}

/** 로딩은 스피너가 아니라 실제 카드와 같은 크기·라운드의 스켈레톤이다. */
export function PlaceCardSkeleton() {
  return (
    <div className="rounded-xl bg-surface p-4" aria-hidden="true">
      <div className="mb-2 aspect-[4/3] w-full rounded-lg bg-grey-100" />
      <div className="h-[25.5px] w-2/3 rounded-sm bg-grey-100" />
      <div className="mt-2 h-[22.5px] w-1/2 rounded-sm bg-grey-100" />
      <div className="mt-2 h-[27.5px] w-24 rounded-sm bg-grey-100" />
      <div className="mt-2 h-[19.5px] w-3/4 rounded-sm bg-grey-100" />
    </div>
  );
}

/**
 * 연관 장소 카드 — 대체지 후보와 함께 가기 좋은 곳이 함께 쓴다.
 *
 * **링크가 아니다.** 공급자 연관 목록에는 표준 관광지 식별자가 없어 상세로 갈 수
 * 없다. 눌리지 않는 카드를 누를 수 있어 보이게 만들지 않는다.
 *
 * 두 종류가 같은 모양을 쓰는 이유는 우열이 아니라 종류가 다르기 때문이다 —
 * 구분은 섹션 제목과 문구가 한다.
 */
export function RelatedPlaceCard({ place }: { place: RelatedPlace }) {
  const forecast = place.forecast;
  const caption = formatStatusCaption(forecast.status, forecast.observedAt);

  return (
    /*
     * `relative` 는 이 카드가 자기 안의 `sr-only`(= `position: absolute`)의 기준 상자가
     * 되게 한다. 이 카드는 가로 스크롤 줄에 놓이는데, 기준 상자가 그 줄 바깥에 있으면
     * 보이지 않는 그 글자가 스크롤에 잘리지 않고 **페이지 폭을 밀어낸다** — 카드가
     * 오른쪽으로 갈수록 더 많이. `min-w-0` 은 데스크톱 3열 격자에서 같은 이유다.
     */
    <article className="relative h-full min-w-0 rounded-xl bg-surface p-4">
      <h3 className="type-title-md line-clamp-2 text-grey-900">{place.name}</h3>

      <p className="type-body-md mt-2 truncate text-grey-600">
        {[place.regionName, place.subtype].filter(Boolean).join(" · ") || "분류 정보 없음"}
      </p>

      {/* 대체지 후보는 예측을 가진 곳만 들어온다 — 그 예측이 카드의 근거다. */}
      {forecast.quietDate ? (
        <div className="mt-2">
          <QuietDateValue date={forecast.quietDate} />
          <p className="type-caption text-grey-600">이 장소에서 한산할 것으로 보이는 날이에요</p>
        </div>
      ) : place.kind === "ALTERNATIVE" ? (
        <div className="mt-2">
          <NoForecastBadge />
        </div>
      ) : null}

      {/*
        캡션은 기준 시점 한 줄뿐이다 — 공급자 이름은 화면에 적지 않는다 (#35).
        낡은 값이면 그 사실이 시점보다 먼저 온다 (#21). 적을 것이 없으면 줄을
        만들지 않는다 — 빈 자리를 문구로 메우지 않는다.
      */}
      {caption ? <p className="type-caption mt-2 text-grey-600">{caption}</p> : null}
    </article>
  );
}
