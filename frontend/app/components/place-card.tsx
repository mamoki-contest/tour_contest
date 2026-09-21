import { Link } from "react-router";

import { cardFacts } from "../lib/card-facts";
import type { Place, RelatedPlace } from "../lib/contract";
import type { DateMode } from "../lib/explore-params";
import { formatStatusCaption } from "../lib/data-status";
import { FactBadge } from "./badges";
import { CrowdBadge, NoForecastBadge, QuietDateValue } from "./crowd-badge";

/**
 * 관광지 카드 — 이 제품의 기본 단위.
 *
 * 구성이 고정이다: **사진 → 이름(2줄) → 주소(1줄) → 분류 태그**. 날짜 조건이 걸렸을
 * 때만 여기에 예측 배지 하나가 붙는다 (#49).
 *
 * 전에는 여기에 신호 세 줄(언급량·TMAP·입장객)과 없음 배지 여섯 종, 중심관광지 순위,
 * 기준 시점 캡션이 함께 섰다. 그 값들은 여전히 응답에 오고 **정렬과 상세가 계속
 * 쓴다** — 화면에서만 뺐다. 목록에서 사용자가 하는 일은 어디를 눌러 볼지 고르는
 * 것이고, 카드 한 장이 여섯 줄이 되면 그 판단이 느려진다. 근거를 확인하는 자리는
 * 상세다.
 *
 * 무엇이 그려지는지는 이 컴포넌트가 아니라 `cardFacts` 가 정한다 — 규칙을 순수
 * 함수 한 곳에 모아야 테스트가 조합을 고정할 수 있다.
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
  const facts = cardFacts(place, dateMode);

  return (
    // `min-w-0` — 목록이 격자라서, 이것이 없으면 칸의 자동 최소 크기가 카드의
    // min-content(아래 주소 줄의 `truncate` 한 줄 길이)가 되어 카드가 목록 밖으로 나간다.
    <article className="relative min-w-0 rounded-xl bg-surface p-4">
      {/* 저장 버튼의 40px 타깃을 카드 링크 밖에 둔다 — 저장과 상세 이동이 충돌하지 않게. */}
      {saveButton ? <div className="absolute top-6 right-6 z-10">{saveButton}</div> : null}

      <Link to={href} className="block rounded-lg transition-colors duration-200 hover:bg-grey-50">
        {facts.photoUrl ? (
          <img
            src={facts.photoUrl}
            alt=""
            loading="lazy"
            className="mb-2 aspect-[4/3] w-full rounded-lg object-cover"
          />
        ) : (
          <div className="type-caption mb-2 flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-grey-100 text-grey-600">
            사진 없음
          </div>
        )}

        <h3 className="type-title-md line-clamp-2 text-grey-900">{facts.name}</h3>

        <p className="type-body-md mt-2 truncate text-grey-600">
          {facts.address ?? "주소 정보 없음"}
        </p>
      </Link>

      {/*
        날짜 유연 모드의 한산 예상일은 배지가 아니라 값이다 — 날짜 자체가 정보라서
        한 줄을 쓴다. 날짜 조건이 없으면(=배지가 null) 이 자리는 아예 생기지 않는다.
      */}
      {facts.dateBadge?.kind === "QUIET_DATE" ? (
        <div className="mt-2">
          <QuietDateValue date={facts.dateBadge.date} />
          <p className="type-caption text-grey-600">이 장소에서 한산할 것으로 보이는 날이에요</p>
        </div>
      ) : null}

      {/*
        배지 줄은 분류 태그 하나로 시작한다. 날짜 확정 모드에서만 그 옆에 예측 배지가
        하나 더 붙고, 예측이 없는 장소는 **자리를 비운다** — 점선 `예측 정보 없음`을
        두지 않는다. 카드에 배지가 둘뿐이라 빈자리가 `보통`으로도 `한산`으로도 읽히지
        않는다(`보통`은 늘 글자로 적히고, `한산`은 유일하게 색을 쓴다).
      */}
      {facts.category || facts.dateBadge?.kind === "LEVEL" ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {facts.category ? <FactBadge>{facts.category}</FactBadge> : null}
          {facts.dateBadge?.kind === "LEVEL" ? <CrowdBadge level={facts.dateBadge.level} /> : null}
        </div>
      ) : null}
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
      {/* 카드가 줄어든 만큼 스켈레톤도 줄인다 — 자리표가 실물보다 길면 목록이 한 번 튄다. */}
      <div className="mt-2 h-[27.5px] w-24 rounded-sm bg-grey-100" />
    </div>
  );
}

/**
 * 연관 장소 카드 — 대체지 후보와 함께 가기 좋은 곳이 함께 쓴다.
 *
 * **상세 화면의 카드라 #49의 축소 대상이 아니다.** 목록 카드는 훑는 자리지만 이곳은
 * 이미 한 장소를 열어 본 사람이 근거를 읽는 자리다.
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
