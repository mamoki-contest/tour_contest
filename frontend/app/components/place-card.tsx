import { Link } from "react-router";

import type { Place, RelatedPlace } from "../lib/contract";
import type { DateMode } from "../lib/explore-params";
import { formatSourceCaption } from "../lib/format";
import { FactBadge, NoDataBadge } from "./badges";
import { CrowdBadge, NoForecastBadge, QuietDateValue } from "./crowd-badge";

/**
 * 관광지 카드 — 이 제품의 기본 단위.
 * 구성 순서가 고정이다: 사진 → 이름(2줄) → 주소(1줄) → 배지 한 줄 → 출처·기준 시점 캡션.
 * 캡션은 마지막이고 빠질 수 없다.
 */
export function PlaceCard({
  place,
  dateMode = "FLEXIBLE",
  /** 저장 버튼. 카드 탭 영역과 겹치지 않게 별도 레이어로 얹는다 (U13). */
  saveButton,
}: {
  place: Place;
  dateMode?: DateMode;
  saveButton?: React.ReactNode;
}) {
  const rank = place.regionCenterRank;
  const forecast = place.forecast;

  return (
    <article className="relative rounded-xl bg-surface p-4">
      {/* 저장 버튼의 40px 타깃을 카드 링크 밖에 둔다 — 저장과 상세 이동이 충돌하지 않게. */}
      {saveButton ? <div className="absolute top-6 right-6 z-10">{saveButton}</div> : null}

      <Link
        to={`/places/${encodeURIComponent(place.placeId)}`}
        className="block rounded-lg transition-colors duration-200 hover:bg-grey-50"
      >
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

        {rank.value !== null ? (
          <FactBadge>시·군 중심관광지 {rank.value}위</FactBadge>
        ) : (
          <NoDataBadge>중심관광지 순위 미산정</NoDataBadge>
        )}
      </div>

      <p className="type-caption mt-2 text-grey-600">
        {formatSourceCaption(rank.source, rank.observedAt)}
      </p>
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

  return (
    <article className="h-full rounded-xl bg-surface p-4">
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

      {forecast.source ? (
        <p className="type-caption mt-2 text-grey-600">
          {formatSourceCaption(forecast.source, forecast.observedAt)}
        </p>
      ) : null}
    </article>
  );
}
