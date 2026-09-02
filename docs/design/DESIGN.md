---
version: alpha
name: 한사나다
description: 강원 관광 탐색 웹 MVP의 디자인 시스템. 토스 디자인 언어를 실측해 가져오되, 굵은 글씨가 장소가 아니라 데이터를 진술하도록 바꾼 룩.
colors:
  primary: "#3182F6"
  primary-strong: "#1B64DA"
  primary-deep: "#194AA6"
  primary-surface: "#E8F3FF"
  primary-soft: "#90C2FF"
  grey-900: "#191F28"
  grey-800: "#333D4B"
  grey-700: "#4E5968"
  grey-600: "#6B7684"
  grey-500: "#8B95A1"
  grey-400: "#B0B8C1"
  grey-300: "#D1D6DB"
  grey-200: "#E5E8EB"
  grey-100: "#F2F4F6"
  grey-50: "#F9FAFB"
  surface: "#FFFFFF"
  red: "#F04452"
  red-surface: "#FFEEEE"
  red-deep: "#A51926"
  green: "#03B26C"
  amber: "#FF9200"
typography:
  display:
    fontFamily: Pretendard
    fontSize: 30px
    fontWeight: 700
    lineHeight: 40px
  headline-lg:
    fontFamily: Pretendard
    fontSize: 24px
    fontWeight: 700
    lineHeight: 33px
  headline-md:
    fontFamily: Pretendard
    fontSize: 20px
    fontWeight: 700
    lineHeight: 29px
  title-md:
    fontFamily: Pretendard
    fontSize: 17px
    fontWeight: 600
    lineHeight: 25.5px
  body-lg:
    fontFamily: Pretendard
    fontSize: 17px
    fontWeight: 400
    lineHeight: 25.5px
  body-md:
    fontFamily: Pretendard
    fontSize: 15px
    fontWeight: 400
    lineHeight: 22.5px
  label-lg:
    fontFamily: Pretendard
    fontSize: 17px
    fontWeight: 600
    lineHeight: 25.5px
  label-md:
    fontFamily: Pretendard
    fontSize: 13px
    fontWeight: 600
    lineHeight: 19.5px
  caption:
    fontFamily: Pretendard
    fontSize: 13px
    fontWeight: 400
    lineHeight: 19.5px
  data-value:
    fontFamily: Pretendard
    fontSize: 22px
    fontWeight: 700
    lineHeight: 31px
    fontFeature: "'tnum' 1"
  nav-label:
    fontFamily: Pretendard
    fontSize: 12px
    fontWeight: 500
    lineHeight: 18px
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  gutter: 24px
  section: 48px
components:
  page-container:
    backgroundColor: "{colors.grey-50}"
    padding: "{spacing.gutter}"
  section-gap:
    size: "{spacing.section}"
  page-title:
    backgroundColor: "{colors.grey-50}"
    textColor: "{colors.grey-900}"
    typography: "{typography.display}"
  section-heading:
    backgroundColor: "{colors.grey-50}"
    textColor: "{colors.grey-800}"
    typography: "{typography.headline-md}"
  place-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.grey-900}"
    typography: "{typography.title-md}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  place-card-pressed:
    backgroundColor: "{colors.grey-50}"
    textColor: "{colors.grey-900}"
  place-card-meta:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.grey-600}"
    typography: "{typography.body-md}"
  place-detail-title:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.grey-900}"
    typography: "{typography.headline-lg}"
  place-detail-body:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.grey-700}"
    typography: "{typography.body-lg}"
    padding: "{spacing.xl}"
  data-source-note:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.grey-600}"
    typography: "{typography.caption}"
  theme-chip:
    backgroundColor: "{colors.grey-100}"
    textColor: "{colors.grey-700}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
  theme-chip-selected:
    backgroundColor: "{colors.primary-surface}"
    textColor: "{colors.primary-strong}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
  tag-chip:
    backgroundColor: "{colors.grey-100}"
    textColor: "{colors.grey-700}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
  sort-toggle-item:
    backgroundColor: "{colors.grey-100}"
    textColor: "{colors.grey-700}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
  sort-toggle-item-selected:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.grey-900}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
  crowd-badge-quiet:
    backgroundColor: "{colors.primary-surface}"
    textColor: "{colors.primary-strong}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
  crowd-badge-normal:
    backgroundColor: "{colors.grey-100}"
    textColor: "{colors.grey-700}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
  crowd-badge-busy:
    backgroundColor: "{colors.red-surface}"
    textColor: "{colors.red-deep}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
  no-data-badge:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.grey-700}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
  quiet-date-value:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.grey-900}"
    typography: "{typography.data-value}"
  button-primary:
    backgroundColor: "{colors.primary-strong}"
    textColor: "{colors.surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
    height: 48px
  button-primary-pressed:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.surface}"
  button-primary-disabled:
    backgroundColor: "{colors.grey-100}"
    textColor: "{colors.grey-400}"
  button-secondary:
    backgroundColor: "{colors.grey-100}"
    textColor: "{colors.grey-700}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    height: 48px
  save-button:
    backgroundColor: "{colors.grey-100}"
    textColor: "{colors.grey-700}"
    rounded: "{rounded.full}"
    size: 40px
  save-button-saved:
    backgroundColor: "{colors.primary-surface}"
    textColor: "{colors.primary-strong}"
    rounded: "{rounded.full}"
    size: 40px
  search-field:
    backgroundColor: "{colors.grey-100}"
    textColor: "{colors.grey-900}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.lg}"
    height: 48px
    padding: "{spacing.lg}"
  search-field-placeholder:
    backgroundColor: "{colors.grey-100}"
    textColor: "{colors.grey-600}"
    typography: "{typography.body-lg}"
  memo-field:
    backgroundColor: "{colors.grey-100}"
    textColor: "{colors.grey-900}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  general-search-notice:
    backgroundColor: "{colors.grey-100}"
    textColor: "{colors.grey-700}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  region-search-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary-strong}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    height: 40px
  map-place-label:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.grey-900}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm}"
  map-legend:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.grey-700}"
    typography: "{typography.caption}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  map-region-fill-1:
    backgroundColor: "{colors.primary-surface}"
  map-region-fill-2:
    backgroundColor: "{colors.primary-soft}"
  map-region-fill-3:
    backgroundColor: "{colors.primary}"
  map-region-fill-4:
    backgroundColor: "{colors.primary-strong}"
  map-region-fill-nodata:
    backgroundColor: "{colors.grey-200}"
  map-region-outline:
    backgroundColor: "{colors.grey-500}"
    height: 1px
  divider:
    backgroundColor: "{colors.grey-300}"
    height: 1px
  road-status-dot-smooth:
    backgroundColor: "{colors.green}"
    size: 8px
  road-status-dot-slow:
    backgroundColor: "{colors.amber}"
    size: 8px
  road-status-dot-jam:
    backgroundColor: "{colors.red}"
    size: 8px
  bottom-nav-item:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.grey-600}"
    typography: "{typography.nav-label}"
  bottom-nav-item-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary-strong}"
    typography: "{typography.nav-label}"
  saved-count-badge:
    backgroundColor: "{colors.primary-strong}"
    textColor: "{colors.surface}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs}"
  empty-state:
    backgroundColor: "{colors.grey-50}"
    textColor: "{colors.grey-700}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
  error-state:
    backgroundColor: "{colors.red-surface}"
    textColor: "{colors.red-deep}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
---

# 한사나다 DESIGN.md

게이트 통과 (2026-09-02) — ① `designmd lint` 에러 0(경고 2건은 사유 기록) · ② 산문 기각력 · ③ 충실도 미리보기 승인 · 미확인 값 0

근거 문서 (2026-09-02 시점 기록 · 현행 여부는 트래커에서 확인): PRD `mamoki-contest/tour_contest#10` · ADR-0002 · ADR-0005 · ADR-0006 · `CONTEXT.md`

레퍼런스: **토스** — 2026-09-02에 `https://toss.tech` 실렌더에서 CSS 커스텀 프로퍼티(TDS 변수 829개)와 계산된 스타일을 직접 측정. 이 문서의 색·타이포·라운드·여백·그림자 값은 스크린샷 추정이 아니라 그 측정값이다. 측정할 수 없어 고른 값은 넷이었고 2026-09-02에 전부 확인받았다 — 문서 끝의 「레퍼런스에 근거가 없어 골랐고, 확인받은 값」 참조. **현재 미확인 값은 없다.**

## Overview

**한 점.** 토스 앱 홈의 **계좌 목록 화면**. 흰 바탕에 테두리가 하나도 없고, 줄과 줄은 선이 아니라 여백으로 나뉘고, 각 줄은 굵은 검정 이름 한 줄과 그 아래 작은 회색 글씨 한 줄로 되어 있고, 파란색은 화면 맨 아래 버튼 하나에만 있는 그 화면.

한사나다는 그 화면을 그대로 빌려온다. 다만 **작은 회색 글씨 자리에 무엇이 오는지가 정해져 있다** — 이 숫자가 어디서 왔고 언제 기준인지.

이 제품이 다루는 네 신호(`지역 방문 규모` · `관광지 관심도` · `방문 혼잡도 예측` · `현재 접근 혼잡`)는 시간 범위도 뜻도 서로 다르고, ADR-0002와 ADR-0006은 이들을 하나의 점수로 합치는 것을 금지한다. 화면이 그 금지를 지키는 방법은 하나다 — **굵은 글씨는 우리가 아는 것만 말하고, 그 근거를 바로 아래에 붙인다.**

그래서 토스의 자신감을 빌려오되 **자신감의 대상을 바꾼다.** 토스는 "이번 달 12만원 아꼈어요"라고 확언해도 된다. 자기 데이터니까. 한사나다는 "여기 한산해요"라고 확언할 수 없다. 남의 데이터고, 그 데이터는 애초에 그런 뜻이 아니다.

### 한 문장 시금석

> **이 화면의 가장 굵은 글씨가 "장소를 평가"하고 있나, "우리가 가진 데이터를 진술"하고 있나? 전자면 틀렸다.**

대입해 보면:

| 화면의 굵은 글씨 | 판정 | 왜 |
|---|---|---|
| "덜 알려진 명소 TOP 10" | **기각** | 장소 평가. `CONTEXT.md`가 `숨은 명소`를 금지어로 지정했다 |
| "이 지도 범위 · 관심도 낮은 순 18곳" | 통과 | 데이터 진술. 범위와 정렬 기준이 문장 안에 있다 |
| "지금 한산한 강원 관광지" | **기각** | 장소 평가 + 없는 데이터(실시간 인파는 범위 밖) |
| "9월 14일 · 이 장소의 30일 예측 중 낮은 편" | 통과 | 비교 대상이 그 장소 자신으로 한정돼 있다 |
| 큰 숫자 "혼잡도 78" | **기각** | 합산 점수. ADR-0006이 명시적으로 폐기한 것 |
| "강릉 · 최근 3개월 방문 규모 상위 구간" | 통과 | 기준 기간과 비교 단계가 붙어 있다 |

### 두 번째 시금석 (토스다움)

> **이 화면에 그은 선(border)이 하나라도 있나? 있으면 회색 면이나 여백으로 바꿀 수 있는지 먼저 확인해라.**

토스 화면에는 테두리가 거의 없다. 묶음은 `#FFFFFF` 카드와 `#F9FAFB`/`#F2F4F6` 바탕의 명도 차이로 만들고, 분리는 여백으로 만든다. 선을 긋는 순간 화면이 관공서 표처럼 보인다 — 이 제품은 공공데이터를 다루기 때문에 그쪽으로 미끄러지기 쉽고, 그래서 이 시금석이 필요하다.

### 감정과 대상

여행 앱의 들뜬 기분이 아니라 **약속 시간 전에 지도를 한 번 확인하는 차분함**. 사진은 크게, 글씨는 적게, 결정은 한 화면에 하나씩.

대상은 강원도로 떠나기 전 **휴대폰으로 후보를 추리는 사람**이다. `관심도 미산정`·`기준 시점` 같은 말을 몰라도 되고, 알 필요도 없어야 한다. 용어는 화면에 남되 그 옆에 항상 사람 말이 붙는다.

## Colors

팔레트는 토스 실렌더에서 잰 값이다. 파랑 하나, 회색 열 단계, 그리고 상태를 위한 빨강·초록·주황이 전부다. **색의 개수가 적은 것이 이 룩의 핵심**이다 — 신호가 네 종류나 되는 제품에서 색을 늘리면 사용자는 색끼리 비교하기 시작하고, 그게 ADR-0002가 막으려는 바로 그 오해다.

- **Primary (`#3182F6` 토스 블루):** **면(面)에만** 쓴다 — 지도 색상 램프의 세 번째 구간, 포커스 링. 흰 글씨를 얹으면 3.71:1로 AA에 미달하므로 **글씨가 올라가는 자리에는 쓰지 않는다.** 브랜드의 정체성은 이 색이 맡고, 대비는 아래 두 색이 맡는다.
- **Primary Strong (`#1B64DA`):** **글씨가 개입하는 모든 파랑.** 주 버튼(흰 글씨 5.41:1), 밝은 면 위의 파란 글씨(`#E8F3FF` 위 4.82:1, 흰 배경 위 5.41:1), 저장 개수 배지, 지도 램프 최고 구간. 화면당 **행동 하나**에만.
- **Primary Deep (`#194AA6`):** 주 버튼의 눌린 상태(흰 글씨 8.17:1). 토스의 포커스 링 값 `rgba(25, 74, 166, .5)`에서 나온 색이라 이 팔레트 밖에서 데려온 값이 아니다.
- **Primary Surface (`#E8F3FF`):** 파랑의 면 버전. 선택된 테마 칩, `한산` 배지, 저장 완료 상태.
- **Grey 900–50 (`#191F28` → `#F9FAFB`):** 위계 전체를 이 열 단계가 담당한다. 제목 `#191F28`, 본문 `#4E5968`, 보조·캡션 `#6B7684`. **`#8B95A1` 이하는 글씨에 쓰지 않는다** — 흰 배경에서 3.04:1이라 읽히지 않는다. 이 제품에서 가장 작은 글씨는 출처와 기준 시점인데, 그게 안 읽히면 문서 전체의 전제가 무너진다.
- **Red (`#F04452` / 면 `#FFEEEE` / 글씨 `#A51926`):** 오류와 `혼잡`. 경고가 아니라 사실로 쓴다.
- **Green (`#03B26C`) · Amber (`#FF9200`):** **오직 현재 도로 소통 상태의 점(dot)에만** 쓴다.

### 신호마다 색 계열을 다르게 쓴다

ADR-0002는 네 신호를 합치지 말라고 하는데, 문서로 분리해도 화면에서 같은 색을 쓰면 사용자는 합쳐서 읽는다. 그래서 **색 계열 자체를 신호마다 나눈다**:

| 신호 | 색 계열 | 이유 |
|---|---|---|
| 지역 방문 규모 (지도) | 파랑 4단계 틴트 | 면(面)에만 쓰이고 배지에는 안 쓰임 |
| 관광지 관심도 정렬 | **색 없음** — 순서와 텍스트로만 | 색을 주면 순위가 점수처럼 보인다 |
| 방문 혼잡도 예측 | 파랑 틴트 / 회색 / 옅은 빨강 배지 | 배지 형태로만 나타나고 지도에는 안 쓰임 |
| 현재 접근 혼잡 (도로) | 초록·주황·빨강 **점** | 도로 소통의 관습적 문법. 다른 신호와 형태(점)가 달라 섞이지 않는다 |

`혼잡도 예측` 배지에서 **강조되는 것은 `한산` 하나뿐**이다. 사용자가 찾는 것이 그것이기 때문이다. `보통`은 회색, `혼잡`은 옅은 빨강으로 **조용히** 표시한다 — `혼잡`을 크게 외치면 카드끼리 비교하게 되고, 그건 장소 간 절대 순위를 만드는 일이다.

### 정보 없음은 색이 아니라 형태로 구분한다

`정보 없음`과 `관심도 미산정`은 **채워진 배지를 쓰지 않는다.** 흰 바탕 + `#D1D6DB` 1px 점선 테두리 + `#4E5968` 글씨다. 채움은 "값이 있다"는 뜻이고, 결측에 옅은 색을 채우면 그 순간 "낮은 값"으로 읽힌다 — PRD와 ADR-0006이 반복해서 금지하는 것이 정확히 그것이다. 지도에서도 같다: 데이터 없는 시·군은 램프의 가장 옅은 색이 아니라 `#E5E8EB` **사선 해칭**이다.

## Typography

**Pretendard** 한 종을 400/500/600/700 네 굵기로 쓴다. 토스의 실제 서체(Toss Product Sans)는 토스 전용이므로 쓸 수 없고, Pretendard가 한글 자소 폭과 시각 보정에서 가장 가까운 공개 대체다. 크기와 행간 값 자체는 토스 실렌더에서 잰 TDS 스케일 그대로다.

- **Display (30/40, 700):** 화면 제목. 한 화면에 한 번.
- **Headline (24/33 · 20/29, 700):** 관광지 이름(상세), 섹션 제목.
- **Title (17/25.5, 600):** 관광지 카드 이름. 이 제품에서 가장 많이 반복되는 글자.
- **Body (17/25.5 · 15/22.5, 400):** 설명문과 카드 보조 정보.
- **Label (17/25.5 · 13/19.5, 600):** 버튼, 칩, 배지.
- **Caption (13/19.5, 400):** **출처와 기준 시점 전용.** 색은 반드시 `#6B7684`(4.62:1).
- **Data value (22/31, 700, `tnum`):** 한산 예상일 같은 날짜·수치. 등폭 숫자를 켜서 카드가 줄줄이 있을 때 자릿수가 흔들리지 않게 한다.

**자간은 건드리지 않는다.** 토스 실렌더의 모든 텍스트가 `letter-spacing: normal`이었다. 한글에서 자간을 좁히면 굵은 글씨가 뭉친다.

### 한국어 조판

측정값 그대로: `word-break: keep-all` + `overflow-wrap: break-word`. 어절 단위로 줄이 바뀌고, 한 어절이 줄보다 길 때만 강제로 끊는다. 이게 없으면 "정동진모래시계공원"이 아무 데서나 잘린다.

**긴 한국어가 꽉 찼을 때:**

| 자리 | 규칙 |
|---|---|
| 카드 관광지 이름 | 최대 **2줄**, 넘으면 말줄임. 3줄로 늘리면 카드 높이가 제각각이 되어 목록의 리듬이 깨진다 |
| 카드 주소 | **1줄** 말줄임 |
| 상세 관광지 이름 | 말줄임 **없음**. 다 보여준다 — 상세는 확인하러 온 화면이다 |
| 출처·기준 시점 캡션 | 말줄임 **없음**, 줄바꿈 허용. 잘리면 안 되는 정보다 |
| 칩·배지 | `nowrap`. 줄바꿈도 말줄임도 없고, 대신 칩 줄 전체가 가로 스크롤된다 |
| 사용자 메모 | 보기에서 **6줄** 후 접기, 편집에서는 최대 높이 후 내부 스크롤 |
| 빈 결과·오류 문구 | 2줄 이내로 쓴다. 길어지면 문구를 고친다 |

## Layout

**모바일 우선.** 세로 한 줄로 쌓고, 넓어지면 그 줄에 여백이 붙는다.

- **가로 여백(거터) 24px.** 토스 모바일에서 잰 값이다. 화면 폭에 관계없이 고정.
- **본문 최대 폭 1024px.** 그 이상에서는 가운데 정렬하고 양옆을 비운다. 지도만 화면 폭 전체를 쓴다.
- **간격 규칙:** 섹션 사이 **48px**, 카드 사이 **24px**, 카드 안 요소 사이 **8px**. 이 세 값이 화면의 리듬 전부다.
- **8px 배수 스케일**(4px 반 단계 포함)을 쓰되, **버튼·입력의 라운드는 스케일이 아니라 높이에서 나온다** — Shapes 참조.

### 화면당 결정 하나

토스 화면의 특징은 여백이 아니라 **한 화면이 한 가지만 묻는다는 것**이다. 한사나다에서 이 원칙이 걸리는 자리:

- 탐색 홈은 조건이 네 개(지도 범위 · 테마 · 날짜 · 정렬)다. 네 개를 동시에 펼치면 토스가 아니다. **기본 상태를 보여주고, 조건은 필요할 때 하나씩 연다**(ADR-0005의 첫 진입 기본 상태가 이 룩의 전제다).
- 관광지 상세는 섹션이 네 개(기본정보 · 30일 예측 · 대체지 후보 · 함께 가기 좋은 곳)다. **한 화면에 한 섹션씩 오도록 48px로 벌린다.** 붙이면 하나의 종합 평가처럼 읽힌다.

> 구체적인 배치·존·반응형 분기는 이 문서의 일이 아니다 → `WIREFRAME.md`(2단계).

## Elevation & Depth

**깊이는 그림자가 아니라 명도 층으로 만든다.** 바탕 `#F9FAFB` → 카드 `#FFFFFF`. 이 두 단계가 기본이고, 대부분의 화면에 그림자가 **하나도 없다**.

그림자는 **정말로 떠 있는 것에만** 쓴다. 지도 위의 `이 지도 영역에서 검색` 버튼, 하단 시트, 저장 직후 안내 토스트. 값은 토스 실렌더에서 잰 그대로 두 겹이다:

```
0 2px 10px rgba(0, 27, 55, 0.1), 0 3px 20px rgba(2, 32, 71, 0.05)
```

두 겹인 이유는 가까운 그림자로 윤곽을, 먼 그림자로 공기를 만들기 때문이다. 한 겹으로 줄이면 스티커처럼 붙어 보인다.

- **딤(dim):** `rgba(0, 12, 30, 0.8)`. 모달과 하단 시트 뒤.
- **지도 위 오버레이:** 지도는 이미 시각적으로 복잡하므로 그 위의 요소는 **흰 면 + 위 그림자**로 확실히 띄운다. 반투명 유리 효과는 쓰지 않는다 — 지도 색상 램프가 비쳐서 방문 규모를 오독하게 만든다.
- **상태 전환:** `background 0.2s, box-shadow 0.2s, color 0.1s`. 측정값. 그 이상 느리게 만들지 않는다.

## Shapes

라운드는 임의로 고르지 않는다. 토스는 **`radius = height / 4`** 규칙을 쓴다(측정: 32→8, 40→10, 48→12, 56→14). 새 버튼을 만들면 그 높이를 4로 나눠라.

- **`sm` 8px** — 칩, 배지, 세그먼트 컨트롤 안쪽 항목
- **`md` 12px** — 48px 버튼(= 48/4)
- **`lg` 16px** — 검색 입력, 메모 입력, 지도 위 플로팅 요소
- **`xl` 20px** — 관광지 카드, 사진, 빈 상태·오류 상태 블록
- **`full` 9999px** — 아이콘 버튼(40px 원), 지도 위 장소 라벨 알약, 저장 개수 배지, 사용자 태그

**카드 안의 사진은 카드보다 한 단계 작은 라운드**를 쓴다(카드 20 → 사진 16). 같은 값을 쓰면 사진이 카드 밖으로 밀려 보인다.

**포커스 링**(키보드 탐색)도 측정값 그대로 두 겹이다: `inset 0 0 0 1.5px #3182F6, 0 0 0 2px #E8F3FF`. 링을 없애지 마라 — 지도·목록·칩이 많은 화면이라 키보드 이동이 실제로 쓰인다.

## Components

이름은 이 제품의 도메인 이름이다(`CONTEXT.md` 용어를 따른다). 각 항목의 정확한 값은 front matter에 있고, 여기서는 **왜 그렇게 생겼는지와 상태**를 적는다.

### place-card — 관광지 카드

목록·대체지 후보·함께 가기 좋은 곳·나만의 지도에서 모두 쓰이는 이 제품의 기본 단위. 흰 면 20px 라운드, 안쪽 여백 16px, 테두리 없음.

구성 순서가 고정이다: **사진 → 이름(2줄) → 주소(1줄) → 배지 한 줄 → 출처·기준 시점 캡션.** 캡션이 마지막이고 빠질 수 없다.

- **pressed:** 배경이 `#F9FAFB`로. 터치 기기에는 hover가 없으므로 **hover 스타일을 따로 만들지 않는다.** 데스크톱에서는 pressed와 같은 값을 hover에 쓴다.
- **저장 상태:** 오른쪽 위 `save-button`. 저장되면 `#E8F3FF` 면에 `#1B64DA` 아이콘.
- **대체지 후보 vs 함께 가기 좋은 곳:** 같은 카드 모양을 쓰되 **섹션이 다르고 배지 문구가 다르다.** 카드 모양으로 구분하려 들지 마라 — 형태를 나누면 둘 중 하나가 열등해 보인다. 이 둘은 우열이 아니라 종류가 다른 것이다.

### theme-chip — 지원 테마 칩

벚꽃·꽃축제·해수욕장·계곡·단풍·억새·눈꽃·해돋이. 회색 면 8px 라운드, 선택되면 `#E8F3FF` 면에 `#1B64DA` 글씨.

- 한 줄로 **가로 스크롤**. 접거나 더보기를 만들지 않는다 — 8개는 스크롤로 충분하다.
- **`일반 검색`은 칩이 아니다.** 자유 입력어는 칩 모양을 절대 갖지 않는다. 칩은 "검증된 테마"의 시각적 약속이고, 일반 검색에 칩을 주면 ADR-0003이 막으려는 오해가 바로 생긴다.

### sort-toggle — 인기 많은 순 / 덜 알려진 순

회색 트랙(`#F2F4F6`) 위에 선택된 항목만 흰 알약으로 뜨는 세그먼트 컨트롤. **파란색을 쓰지 않는다** — 어느 쪽도 권장 방향이 아니기 때문이다(ADR-0006: 양방향 탐색).

바로 아래에 caption으로 관심도의 출처·기준 시점과 **"실제 방문객 수가 아니라 내비게이션 목적지 집계"**라는 안내가 붙는다. 이 캡션은 선택 사항이 아니다.

### crowd-badge — 방문 혼잡도 예측 배지

`한산`(파랑 틴트) · `보통`(회색) · `혼잡`(옅은 빨강). 8px 라운드, 13px 600.

문구는 **항상 장소를 한정한다**: `이 장소 기준 한산`. `한산` 두 글자만 쓰면 시금석에 걸린다.

- **날짜 확정 모드:** 선택일 하나에 배지 하나.
- **날짜 유연 모드:** 배지 대신 `quiet-date-value`로 한산 예상일을 보여준다.
- **예측이 없으면** 배지 자리에 `no-data-badge`가 온다. 배지를 숨기지 않는다 — 숨기면 "예측이 좋다"는 뜻으로 읽힌다.

### no-data-badge — 정보 없음 · 관심도 미산정

흰 바탕 + `#D1D6DB` 1px **점선** + `#4E5968` 글씨. 채워진 배지들 사이에서 형태로 구분된다.

같은 형태로 세 가지를 표현한다: `예측 정보 없음` · `관심도 미산정` · `현재 접근 정보 없음`. 문구는 다르고 모양은 같다.

### road-status — 현재 접근 혼잡

**8px 색 점 + `#4E5968` 텍스트.** 도로 소통은 초록/주황/빨강 점, 주차는 잔여면 숫자. 배지가 아니라 점인 이유는 **다른 신호와 형태를 다르게 만들기 위해서**다.

`조회 시각`이 반드시 같은 줄에 붙는다. 실시간 주차 정보가 없는 장소에는 잔여면 대신 `현재 주차 정보 없음`.

### map — 방문 규모 지도

- **행정구역 면:** 파랑 4단계 틴트. 경계선 `#8B95A1` 1px.
- **데이터 없는 시·군:** `#E5E8EB` 사선 해칭. 램프 밖의 표현.
- **장소 라벨:** 흰 알약 + `#191F28` 글씨. 지도 위 어떤 색 위에서도 읽히게 하는 유일한 방법이다.
- **범례:** 흰 카드, 16px 라운드, 항상 켜져 있다. 안에 색 구간 · 기준 기간 · 출처가 들어간다. **접히지 않는다.**
- **`이 지도 영역에서 검색`:** 지도 위 40px 흰 플로팅 버튼, 파란 글씨, 두 겹 그림자. 지도를 움직인 뒤에만 나타난다.
- **지도 확대가 읍·면·동에 도달하면** 색을 만들지 않고 마커만 남긴다. 색이 사라지는 것을 사용자가 알 수 있도록 범례에 상태 문구를 남긴다.

### search-field — 검색 입력

회색 면 48px, 16px 라운드. 플레이스홀더 `#6B7684`.

자유 입력이 지원 테마로 정규화되면 **입력 아래에 그 사실을 문장으로 남긴다** — `'벚꽃축제'를 지원 테마 '벚꽃'으로 찾았어요`. 조용히 바꾸지 않는다.

### general-search-notice — 일반 검색 안내

회색 면 블록. **파란색을 쓰지 않는다.** 파랑은 이 제품에서 "검증된 것"의 색이고, 일반 검색 결과는 검증되지 않았다(ADR-0003).

### 저장과 개인 컬렉션

- **save-button:** 40px 원. 회색 면 → 저장되면 파랑 틴트.
- **saved-count-badge:** `#1B64DA` 면에 흰 숫자, 알약. 하단 내비게이션의 `나만의 지도`에 붙는다.
- **tag-chip:** 알약형 회색 칩. 테마 칩(8px 라운드)과 **모양으로 구분된다** — 사용자가 쓴 것과 시스템이 검증한 것은 같은 모양이면 안 된다.
- **memo-field:** 회색 면 16px 라운드.

### 상태 — 빈 결과 · 오류 · 로딩

- **empty-state:** `#F9FAFB` 블록, 20px 라운드. 문구 한 줄 + 버튼 하나. 나만의 지도가 비었을 때는 **빈 지도 대신 탐색 홈으로 가는 버튼**(ADR-0005).
- **error-state:** `#FFEEEE` 면 + `#A51926` 글씨. 무슨 데이터가 실패했는지 이름을 말한다 — `혼잡도 예측을 불러오지 못했어요`. **한 섹션의 실패가 화면 전체를 대체하지 않는다.** 다른 섹션은 그대로 산다.
- **로딩:** 스피너 대신 **스켈레톤**. `#F2F4F6` 면을 실제 카드와 같은 크기·라운드로 놓는다. 이 화면은 외부 API 대여섯 개를 기다리므로 스피너를 쓰면 화면이 계속 깜빡인다.
- **부분 결측:** 카드는 뜨고 배지만 `no-data-badge`인 상태가 **정상**이다. 이 상태를 예외로 취급하지 마라. 이 제품에서 가장 흔한 상태다.

## Do's and Don'ts

**데이터를 말하는 방식 — 이 제품의 진짜 제약**

- Do 모든 신호에 **출처와 기준 시점 캡션**을 붙인다. 그게 없으면 그 신호를 화면에 올리지 않는다.
- Don't 서로 다른 신호를 **하나의 점수·별점·게이지**로 합치지 마라 (ADR-0002, ADR-0006).
- Don't `숨은 명소` · `실시간 한산한 곳` · `혼잡한 순` · `한산한 순` 같은 말을 쓰지 마라. `CONTEXT.md`가 금지어로 지정했다.
- Do 혼잡 배지 문구에 **`이 장소 기준`을 항상 붙인다.**
- Don't 결측을 **옅은 색으로 채우지 마라.** 채운 색은 값이라는 뜻이다.
- Don't 값이 없다고 **배지를 숨기지 마라.** 빈자리는 좋은 소식으로 읽힌다.
- Do 지도 색 · 관심도 정렬 · 혼잡 예측에 **각각 다른 범례와 다른 색 계열**을 준다.
- Don't 지도 확대 단계가 다를 때 **같은 색을 비교하게 두지 마라.** 단계가 바뀌면 범례 문구도 바뀐다.

**토스다움 — 형태**

- Do 묶음은 **테두리 대신 흰 카드와 회색 바탕의 명도 차이**로 만든다.
- Don't 그림자를 장식으로 쓰지 마라. **진짜 떠 있는 것**(지도 위 버튼, 시트, 토스트)에만.
- Do 새 버튼의 라운드는 **높이 ÷ 4**로 계산한다.
- Don't 카드 안 사진에 카드와 **같은 라운드**를 쓰지 마라. 한 단계 작게.
- Do 파란색은 **화면당 행동 하나**에만. 정보 강조에 쓰지 않는다.
- Don't 굵기를 **한 화면에 세 종류 넘게** 쓰지 마라.
- Do 여백으로 나눈다. 48/24/8, 이 세 값 밖으로 나가지 않는다.

**한국어와 접근성**

- Do `word-break: keep-all`을 전역에 건다.
- Don't 자간을 좁히지 마라. 측정값은 `normal`이다.
- Don't **`#8B95A1` 이하 회색을 글씨에 쓰지 마라** — 흰 배경 3.04:1로 AA 미달. 캡션은 반드시 `#6B7684`(4.62:1).
- Do **글씨가 올라가는 파랑은 언제나 `#1B64DA`**다. `#3182F6`은 면에만 — 흰 글씨를 얹으면 3.71:1이다.
- Don't 색만으로 상태를 구분하지 마라. 도로 점 옆에는 항상 글자가 있다.
- Do 포커스 링을 남긴다. 지우지 마라.

**경계**

- Don't 이 문서에서 **무엇을 언제 보여줄지**를 정하지 마라. 그건 동작이고, 개발 체인(`/grill-with-docs-5` → `/update-prd-5` → `/to-issues-5` → `/tdd-5`)의 일이다.
- Don't 여기서 **화면 배치**를 짜지 마라 → `WIREFRAME.md`(2단계).

## 측정 근거

2026-09-02, `https://toss.tech` 실렌더에서 직접 측정한 값:

| 항목 | 측정값 |
|---|---|
| 파랑 | `#3182F6`(최다 사용) · `#1B64DA` · `#194AA6`(포커스 링 값에서) · `#E8F3FF` · `#90C2FF` |
| 회색 | `#191F28` `#333D4B` `#4E5968` `#6B7684` `#8B95A1` `#B0B8C1` `#D1D6DB` `#E5E8EB` `#F2F4F6` `#F9FAFB` |
| 빨강 / 초록 | `#F04452` `#FFEEEE` `#A51926` / `#03B26C` |
| 라운드 규칙 | `height/4` — TDS 변수 `--pc-component-height-{32,40,48,56}_border-radius` = 8, 10, 12, 14 |
| 타이포 스케일 | TDS 변수 `--tds-t-f{13..30}-text-{fontSize,lineHeight}` |
| 자간 | 모든 텍스트 `letter-spacing: normal` |
| 한국어 조판 | `word-break: keep-all`, `overflow-wrap: break-word` |
| 여백 | 모바일 거터 24px, 섹션 간 48px, 카드 간 24px, 요소 간 8px |
| 최대 폭 | 본문 1024px |
| 그림자 | `0 2px 10px rgba(0,27,55,.1), 0 3px 20px rgba(2,32,71,.05)` · 딤 `rgba(0,12,30,.8)` |
| 전환 | `background .2s, box-shadow .2s, color .1s` |
| 포커스 링 | `inset 0 0 0 1.5px #3182F6, 0 0 0 2px #E8F3FF` |

### 레퍼런스에 근거가 없어 골랐고, 확인받은 값 (2026-09-02)

측정할 수 없어 고른 값은 넷이었고 전부 사용자 확인을 거쳤다. **현재 미확인 값은 없다.**

| 값 | 결정 | 왜 |
|---|---|---|
| 서체 `Pretendard` | 확정 | Toss Product Sans는 토스 전용이라 사용 불가. 한글 자소 폭과 시각 보정이 가장 가깝고 OFL이라 공모전 제출에 제약이 없다 |
| 주 버튼 `#1B64DA` | 확정 | `#3182F6` + 흰 글씨는 3.71:1로 AA 미달. 팔레트는 토스 그대로 두고 **글씨가 올라가는 자리만** 한 단계 진하게 해서 5.41:1을 확보했다 |
| `혼잡` 배지 = 한산만 강조 | 확정 | 신호등 3색은 절대적 좋고 나쁨의 문법이라 "초록인 곳으로 가자"를 유발한다 — ADR-0002가 막으려는 장소 간 비교가 그대로 생긴다 |
| 도로 `서행` `#FF9200` | 확정 | 원활–서행–정체는 도로 소통의 관습 문법. 배지가 아니라 8px 점이라 다른 신호와 형태가 달라 섞이지 않는다 |

토스 브랜드 색 `#3182F6`은 **그대로 쓴다**(면 전용). 공모전 제출물에서 파랑 계열 자체를 강원 계열로 옮기는 것은 성격 변경이므로, 필요해지면 이 문서를 고치지 말고 1단계(`/to-designmd-5`)를 다시 돈다.

**남는 lint 경고 2건**(사유 기록):

- `button-primary-disabled` 1.82:1 — 비활성 요소는 WCAG 대비 요건 제외 대상.
- `search-field-placeholder` 4.19:1 — 플레이스홀더는 실제 정보가 아니며, 입력된 값은 `#191F28`(16.4:1)로 표시된다.

---

<!-- 변경 이력은 git log로 추적한다. 이 문서는 버전 파일이 아니라 살아있는 단일 문서다. -->
