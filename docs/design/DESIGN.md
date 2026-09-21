---
version: alpha
name: 한사나다
description: 강원 관광 탐색 웹 MVP의 디자인 시스템. 토스 디자인 언어를 실측해 가져오되, 굵은 글씨가 장소가 아니라 데이터를 진술하도록 바꾼 룩.
colors:
  primary: "#014CA9"
  primary-strong: "#013B84"
  primary-deep: "#012B60"
  primary-surface: "#E1EEFF"
  primary-soft: "#4899FE"
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
font:
  # 주요 타이틀 전용 — 배달의민족 주아체. SIL Open Font License 1.1. http://font.woowahan.com/jua/
  # 패밀리 이름이 "Jua" 인 이유는 Typography 절 참조 (OFL Reserved Font Name "BM JUA").
  display: '"Jua", Pretendard, "Pretendard Variable", -apple-system, BlinkMacSystemFont, system-ui, "Malgun Gothic", sans-serif'
typography:
  display:
    fontFamily: "{font.display}"
    fontSize: 30px
    fontWeight: 700
    lineHeight: 40px
  headline-lg:
    fontFamily: "{font.display}"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 33px
  headline-md:
    fontFamily: "{font.display}"
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
  stale-badge:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.grey-700}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
  fact-badge:
    backgroundColor: "{colors.grey-100}"
    textColor: "{colors.grey-700}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
  help-button:
    backgroundColor: "{colors.grey-100}"
    textColor: "{colors.grey-700}"
    rounded: "{rounded.full}"
    size: 40px
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

이 제품이 다루는 신호들(`지역 방문 규모` · `온라인 언급량` · `TMAP 검색순위` · `입장객 수` · `방문 혼잡도 예측` · `현재 접근 혼잡`)는 시간 범위도 뜻도 서로 다르고, ADR-0002와 ADR-0006은 이들을 하나의 점수로 합치는 것을 금지한다. 화면이 그 금지를 지키는 방법은 하나다 — **굵은 글씨는 우리가 아는 것만 말하고, 그 근거를 바로 아래에 붙인다.**

그래서 토스의 자신감을 빌려오되 **자신감의 대상을 바꾼다.** 토스는 "이번 달 12만원 아꼈어요"라고 확언해도 된다. 자기 데이터니까. 한사나다는 "여기 한산해요"라고 확언할 수 없다. 남의 데이터고, 그 데이터는 애초에 그런 뜻이 아니다.

### 한 문장 시금석

> **이 화면의 가장 굵은 글씨가 "장소를 평가"하고 있나, "우리가 가진 데이터를 진술"하고 있나? 전자면 틀렸다.**

대입해 보면:

| 화면의 굵은 글씨 | 판정 | 왜 |
|---|---|---|
| "덜 알려진 명소 TOP 10" | **기각** | 장소 평가. `CONTEXT.md`가 `숨은 명소`를 금지어로 지정했다 |
| "이 지도 범위 · 온라인 언급 적은 순 18곳" | 통과 | 데이터 진술. 범위와 정렬 기준이 문장 안에 있다 |
| "지금 한산한 강원 관광지" | **기각** | 장소 평가 + 없는 데이터(실시간 인파는 범위 밖) |
| "9월 14일 · 이 장소의 30일 예측 중 낮은 편" | 통과 | 비교 대상이 그 장소 자신으로 한정돼 있다 |
| 큰 숫자 "혼잡도 78" | **기각** | 합산 점수. ADR-0006이 명시적으로 폐기한 것 |
| "강릉 · 최근 3개월 방문 규모 상위 구간" | 통과 | 기준 기간과 비교 단계가 붙어 있다 |

### 두 번째 시금석 (토스다움)

> **이 화면에 그은 선(border)이 하나라도 있나? 있으면 회색 면이나 여백으로 바꿀 수 있는지 먼저 확인해라.**

토스 화면에는 테두리가 거의 없다. 묶음은 `#FFFFFF` 카드와 `#F9FAFB`/`#F2F4F6` 바탕의 명도 차이로 만들고, 분리는 여백으로 만든다. 선을 긋는 순간 화면이 관공서 표처럼 보인다 — 이 제품은 공공데이터를 다루기 때문에 그쪽으로 미끄러지기 쉽고, 그래서 이 시금석이 필요하다.

### 감정과 대상

여행 앱의 들뜬 기분이 아니라 **약속 시간 전에 지도를 한 번 확인하는 차분함**. 사진은 크게, 글씨는 적게, 결정은 한 화면에 하나씩.

대상은 강원도로 떠나기 전 **휴대폰으로 후보를 추리는 사람**이다. `온라인 언급`·`기준 시점` 같은 말을 몰라도 되고, 알 필요도 없어야 한다. 용어는 화면에 남되 그 옆에 항상 사람 말이 붙는다.

## Colors

회색 열 단계와 상태색(빨강·초록·주황)은 토스 실렌더에서 잰 값 그대로다. **파랑 계열만 2026-09-21 사용자 결정으로 `#014CA9`를 기준 삼아 다시 설계했다** — 아래 「포인트 색」 참조. 파랑 하나, 회색 열 단계, 그리고 상태를 위한 빨강·초록·주황이 전부다. **색의 개수가 적은 것이 이 룩의 핵심**이다 — 신호가 네 종류나 되는 제품에서 색을 늘리면 사용자는 색끼리 비교하기 시작하고, 그게 ADR-0002가 막으려는 바로 그 오해다.

- **Primary (`#014CA9`, 포인트 색):** 브랜드의 정체성. 지도 색상 램프의 세 번째 구간, 포커스 링 안쪽 겹. 흰 배경 위 **8.05:1**이라 글씨로도 쓸 수 있지만, **글씨가 올라가는 파랑은 여전히 아래 `primary-strong` 하나로 모은다** — 대비 때문이 아니라 「화면당 행동 하나」를 지키기 위해서다(옛 `#3182F6`은 3.71:1이라 글씨를 금지당했고, 지금은 규칙만 남고 이유가 바뀌었다).
- **Primary Strong (`#013B84`):** **글씨가 개입하는 모든 파랑.** 주 버튼(흰 글씨 **10.71:1**), 밝은 면 위의 파란 글씨(`#E1EEFF` 위 **9.12:1**, 흰 배경 위 **10.71:1**), 저장 개수 배지, 지도 램프 최고 구간. 화면당 **행동 하나**에만.
- **Primary Deep (`#012B60`):** 주 버튼의 눌린 상태(흰 글씨 **13.85:1**). `primary-strong`에서 명도만 한 단계(7.1%p) 더 내린 값이라, 눌림이 색이 아니라 깊이로 읽힌다.
- **Primary Surface (`#E1EEFF`):** 파랑의 면 버전. 선택된 테마 칩, `한산` 배지, 저장 완료 상태. 흰 배경 위에서 면으로만 구분되므로 글씨는 반드시 `primary-strong`을 얹는다.
- **Primary Soft (`#4899FE`):** 중간 톤. 지도 램프의 두 번째 구간 **전용**이다. 흰 글씨를 얹으면 2.89:1이라 **글씨 자리에는 쓰지 않는다.**

### 포인트 색 — `#014CA9` 기준 5단계 (2026-09-21 결정)

다섯 값은 전부 **같은 색상(H 213°)·같은 채도(S 99%)**에서 **명도만** 내린 것이다. 색상을 틀지 않는 이유는, 파랑이 이 제품에서 "검증된 것"의 색이고 단계가 그 확신의 세기이지 다른 뜻이 아니기 때문이다.

| 토큰 | 값 | 명도(L) | 쓰는 자리 | 대비 |
|---|---|---|---|---|
| `primary-surface` | `#E1EEFF` | 94.1% | 흰 배경 위 칩·배지 면, 포커스 링 바깥 겹 | 면 전용 |
| `primary-soft` | `#4899FE` | 63.9% | 지도 램프 2단 | 면 전용 (흰 글씨 2.89:1) |
| `primary` | `#014CA9` | 33.3% | 포커스 링 안쪽 겹, 지도 램프 3단 | **흰 배경 위 8.05:1** |
| `primary-strong` | `#013B84` | 26.1% | 주 버튼, 파란 글씨 전부, 지도 램프 4단 | **흰 글씨 10.71:1** · **`primary-surface` 위 9.12:1** |
| `primary-deep` | `#012B60` | 19.0% | 주 버튼 pressed | 흰 글씨 13.85:1 |

세 가지 요건은 모두 통과한다: 흰 바탕 위 `primary` 텍스트 8.05:1 ≥ 4.5 · `button-primary` 흰 글씨 10.71:1 ≥ 4.5 · `primary-surface` 위 `primary-strong` 텍스트 9.12:1 ≥ 4.5.

**옛 팔레트보다 전체가 어둡다.** 옛 `primary`는 L 57.8%였고 새 값은 33.3%다. 그래서 대비가 전 구간에서 올라갔고(주 버튼 5.41 → 10.71), 대신 지도 램프의 위 두 구간이 서로 가까워졌다 — 아래 `map` 절 참조.
- **Grey 900–50 (`#191F28` → `#F9FAFB`):** 위계 전체를 이 열 단계가 담당한다. 제목 `#191F28`, 본문 `#4E5968`, 보조·캡션 `#6B7684`. **`#8B95A1` 이하는 글씨에 쓰지 않는다** — 흰 배경에서 3.04:1이라 읽히지 않는다. 이 제품에서 가장 작은 글씨는 출처와 기준 시점인데, 그게 안 읽히면 문서 전체의 전제가 무너진다.
- **Red (`#F04452` / 면 `#FFEEEE` / 글씨 `#A51926`):** 오류와 `혼잡`. 경고가 아니라 사실로 쓴다.
- **Green (`#03B26C`) · Amber (`#FF9200`):** **오직 현재 도로 소통 상태의 점(dot)에만** 쓴다.

### 신호마다 색 계열을 다르게 쓴다

ADR-0002는 네 신호를 합치지 말라고 하는데, 문서로 분리해도 화면에서 같은 색을 쓰면 사용자는 합쳐서 읽는다. 그래서 **색 계열 자체를 신호마다 나눈다**:

| 신호 | 색 계열 | 이유 |
|---|---|---|
| 지역 방문 규모 (지도) | 파랑 4단계 (포인트 색 명도 램프) | 면(面)에만 쓰이고 배지에는 안 쓰임 |
| 온라인 언급량 정렬 | **색 없음** — 순서와 텍스트로만 | 색을 주면 순위가 점수처럼 보인다 |
| TMAP 검색순위 · 입장객 수 | **색 없음** — 카드 안 본문 줄로만 | 배지로 만들면 예측 배지와 한 덩어리로 읽힌다 |
| 방문 혼잡도 예측 | 파랑 틴트 / 회색 / 옅은 빨강 배지 | 배지 형태로만 나타나고 지도에는 안 쓰임 |
| 현재 접근 혼잡 (도로) | 초록·주황·빨강 **점** | 도로 소통의 관습적 문법. 다른 신호와 형태(점)가 달라 섞이지 않는다 |

`혼잡도 예측` 배지에서 **강조되는 것은 `한산` 하나뿐**이다. 사용자가 찾는 것이 그것이기 때문이다. `보통`은 회색, `혼잡`은 옅은 빨강으로 **조용히** 표시한다 — `혼잡`을 크게 외치면 카드끼리 비교하게 되고, 그건 장소 간 절대 순위를 만드는 일이다.

### 정보 없음은 색이 아니라 형태로 구분한다

`정보 없음`은 **채워진 배지를 쓰지 않는다.** 흰 바탕 + `#D1D6DB` 1px 점선 테두리 + `#4E5968` 글씨다. 채움은 "값이 있다"는 뜻이고, 결측에 옅은 색을 채우면 그 순간 "낮은 값"으로 읽힌다 — PRD와 ADR-0006이 반복해서 금지하는 것이 정확히 그것이다. 지도에서도 같다: 데이터 없는 시·군은 램프의 가장 옅은 색이 아니라 `#E5E8EB` **사선 해칭**이다.

**배지는 테두리로 세 등급을 만든다.** 값이 있으면 회색 면(`fact-badge`), 값이 낡았으면 실선 테두리에 채움 없음(`stale-badge`), 값이 없으면 점선 테두리에 채움 없음(`no-data-badge`). 색을 쓰지 않고 테두리만 바꾸는 이유는, 이 셋이 **한 화면에 나란히 서기 때문**이다 — 색으로 갈라 놓으면 신호마다 신호등이 하나씩 켜지고, 그러면 장소끼리 비교하게 된다. (#49 이후 셋이 나란히 서는 자리는 목록 카드가 아니라 **상세 화면**이다.)

| 등급 | 형태 | 뜻 |
|---|---|---|
| `fact-badge` | `#F2F4F6` 면, 테두리 없음 | 방금 받은 값이 있다 |
| `stale-badge` | 흰 바탕 + `#D1D6DB` 1px **실선** | 낡았지만 있는 값 — 마지막으로 정상 수신한 값이다 |
| `no-data-badge` | 흰 바탕 + `#D1D6DB` 1px **점선** | 값이 없다 |

## Typography

**두 종을 쓴다 — 주요 타이틀은 `font.display`(배달의민족 주아체, 패밀리 이름 `Jua`), 나머지 전부는 Pretendard.**

**Pretendard**를 400/500/600/700 네 굵기로 쓴다. 토스의 실제 서체(Toss Product Sans)는 토스 전용이므로 쓸 수 없고, Pretendard가 한글 자소 폭과 시각 보정에서 가장 가까운 공개 대체다. 크기와 행간 값 자체는 토스 실렌더에서 잰 TDS 스케일 그대로다.

### font.display — 주요 타이틀 서체 (2026-09-21 결정: 배달의민족 주아체)

사용자 결정(2026-09-21)으로 **주요 타이틀에 배달의민족 주아체**를 쓴다. 우아한형제들이 무료로 배포하는 글꼴이고, **적용까지 끝났다.** CSS 패밀리 이름은 `Jua` 다(아래 라이선스 절 참조).

> **주아체는 어떤 서체인가.** 붓으로 그린 손글씨 간판이 모티브라 **획의 굵기가 일정하지 않고 동글동글하다.** 옛 간판의 푸근함이 있고, 그래서 **제목 한 줄에서 살고 본문에서는 죽는다.**

```
font.display = "Jua", Pretendard, "Pretendard Variable",
               -apple-system, BlinkMacSystemFont, system-ui, "Malgun Gothic", sans-serif
```

**라이선스 — SIL Open Font License 1.1.** 폰트 파일이 직접 밝힌다. 공식 배포본 `BMJUA_ttf.ttf`(Version 1.100)의 `name` 테이블에서 읽은 값이다:

| nameID | 값 |
|---|---|
| 13 (License) | `This Font Software is licensed under the SIL Open Font License, Version 1.1.` |
| 0 (Copyright) | `Copyright (c) 2014 WOOWA BROTHERS Corporation(www.woowahan.com) with Reserved Font Name "BM JUA"` |

배포처 <http://font.woowahan.com/jua/>. 우아한형제들 안내문도 같은 취지다 — 영리·비영리 모두 자유롭게 쓰고 수정·재배포할 수 있고, 금지되는 것은 **폰트 파일 자체를 유상으로 판매**하는 일 하나뿐이다. 이 제품은 파일을 팔지 않으므로 제약에 걸리지 않는다.

**패밀리 이름을 `"Jua"`로 쓴다 — `"BM JUA"`가 아니다.** OFL 은 **포맷 변환도 Modified Version 으로 본다**(§1). 웹에서 쓰려면 공식 TTF 를 woff/woff2 로 바꿔야 하는데, Modified Version 은 Reserved Font Name(`BM JUA`)을 내걸 수 없다(§3). 그래서 같은 서체의 Google Fonts 배포본 이름인 **`Jua`**를 CSS 패밀리 이름으로 쓴다.

**파일은 버전 고정된 jsDelivr woff(413KB)를 `@font-face`로 불러온다.** 공식 배포본은 TTF(1.45MB)·OTF(1.24MB) 두 가지뿐이고 plain HTTP 로만 받을 수 있어서, 제목 세 스케일에만 쓰는 서체에 1.45MB 바이너리를 레포에 넣거나 https 페이지에서 http 를 핫링크하는 쪽이 모두 맞지 않았다. Pretendard 도 이미 같은 CDN 에서 받고 있어 오리진이 늘지 않는다.

> **더 나은 선택지가 남아 있다(미적용).** 공식 TTF 를 woff2 로 포맷만 바꾼 **219KB** 자체 호스팅본이면 용량이 절반이고 한글 11,172자를 전부 담으며 외부 CDN 의존도 사라진다. 레포에 바이너리를 넣는 일이라 **사용자 승인이 필요해 이번에는 넣지 않았다.** 넣게 되면 `public/fonts/` 에 woff2 와 OFL 전문(저작권 고지 포함, §2 요건)을 함께 두고 `app.css` 의 `src` 한 줄만 바꾸면 된다.

**굵기 — 주아체는 단일 굵기다.** `@font-face`의 `font-weight`를 `400 700` 범위로 선언한다. 700 을 요청했을 때 브라우저가 **합성 볼드(faux bold)를 만들어 동글동글한 획을 뭉개는 것**을 막으면서, 유틸리티의 `font-weight: 700` 은 살려 둬서 **폰트가 안 뜨면 Pretendard 700 으로 떨어지게** 하기 위해서다. 두 가지를 동시에 지키는 방법은 이 선언뿐이다.

**`font.display`를 쓰는 곳은 셋뿐이다:**

| 스케일 | 쓰이는 자리 |
|---|---|
| `display` (30/40) | `page-title` — 화면 제목 |
| `headline-lg` (24/33) | `place-detail-title` — 관광지 이름(상세) |
| `headline-md` (20/29) | `section-heading`, 시트 헤더 `h2` |

**`title-md` 이하는 전부 Pretendard다** — 본문(`body-lg`·`body-md`), 라벨(`label-lg`·`label-md`), 캡션, 배지, `data-value`, `nav-label`. 여기에는 손대지 않는다.

- **Do** 주아체를 **제목 한 줄**에만 쓴다. 둥글고 통통한 손글씨 계열이라 짧고 큰 글자에서 살고, 여러 줄이 되면 화면이 시끄러워진다.
- **Don't** 주아체를 **본문·숫자·배지**에 쓰지 마라 — 붓글씨라 획의 굵기가 일정하지 않아 15px 이하에서 뭉치고, 등폭 숫자(`tnum`)가 없어 `data-value`의 자릿수 정렬이 깨진다. 이 제품의 작은 글씨는 출처와 기준 시점이라 읽히지 않으면 문서 전체의 전제가 무너진다.
- **Don't** 주아체에 굵기를 **강제로 올리지 마라.** 단일 굵기라 합성 볼드가 만들어지고, 그게 이 서체의 유일한 장점인 획 대비를 지운다.

- **Display (30/40, 700):** 화면 제목. 한 화면에 한 번. **`font.display`**.
- **Headline (24/33 · 20/29, 700):** 관광지 이름(상세), 섹션 제목. **`font.display`**.
- **Title (17/25.5, 600):** 관광지 카드 이름. 이 제품에서 가장 많이 반복되는 글자. **여기부터 아래는 전부 Pretendard.**
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

**포커스 링**(키보드 탐색)도 두 겹이다: `inset 0 0 0 1.5px #014CA9, 0 0 0 2px #E1EEFF`. 두 겹이라는 구조와 1.5px/2px는 토스 측정값이고, **색만 새 포인트 색으로 갈았다**. 링을 없애지 마라 — 지도·목록·칩이 많은 화면이라 키보드 이동이 실제로 쓰인다.

## Components

이름은 이 제품의 도메인 이름이다(`CONTEXT.md` 용어를 따른다). 각 항목의 정확한 값은 front matter에 있고, 여기서는 **왜 그렇게 생겼는지와 상태**를 적는다.

### place-card — 관광지 카드

목록·대체지 후보·함께 가기 좋은 곳·나만의 지도에서 모두 쓰이는 이 제품의 기본 단위. 흰 면 20px 라운드, 안쪽 여백 16px, 테두리 없음.

구성 순서가 고정이다: **사진 → 이름(2줄) → 주소(1줄) → 분류 태그.** 그 넷이 전부다 (#49).

- **목록 카드는 근거를 싣지 않는다.** 온라인 언급량·TMAP 검색순위·입장객 수·중심관광지 순위는 여전히 응답에 오고 **정렬과 상세가 계속 쓰지만 카드에는 그리지 않는다.** 목록에서 사용자가 하는 일은 어디를 눌러 볼지 고르는 것이고, 카드 한 장이 여섯 줄이 되면 그 판단이 느려진다. 근거를 확인하는 자리는 상세다.
- **기준 시점 캡션도 없다.** 적을 값이 카드에 없으면 그 값의 기준 시점도 적을 것이 없다.
- **예외는 날짜 배지 하나뿐이다.** 아래 `crowd-badge` 절을 따른다 — 날짜 조건이 걸렸을 때만 생기고, 그때도 예측이 없는 장소는 **자리를 비운다.**
- **무엇을 그릴지는 `cardFacts` 한 곳이 정한다.** 규칙을 순수 함수로 빼 두었고 그 반환 타입에 없는 것은 카드에 올라갈 수 없다. 카드에 한 줄을 더하려면 먼저 그 타입을 고쳐야 하고, 그러면 변경이 눈에 띈다.

- **pressed:** 배경이 `#F9FAFB`로. 터치 기기에는 hover가 없으므로 **hover 스타일을 따로 만들지 않는다.** 데스크톱에서는 pressed와 같은 값을 hover에 쓴다.
- **저장 상태:** 오른쪽 위 `save-button`. 저장 버튼은 남는다 — 목록에서 하는 **유일한 행동**이다.
- **상세의 연관 장소 카드는 이 축소 대상이 아니다.** 목록은 훑는 자리지만 거기는 이미 한 장소를 열어 본 사람이 근거를 읽는 자리다. 기준 시점 캡션도 그대로 붙는다 (#35).
- **대체지 후보 vs 함께 가기 좋은 곳:** 같은 카드 모양을 쓰되 **섹션이 다르고 배지 문구가 다르다.** 카드 모양으로 구분하려 들지 마라 — 형태를 나누면 둘 중 하나가 열등해 보인다. 이 둘은 우열이 아니라 종류가 다른 것이다.

### theme-chip — 지원 테마 칩

벚꽃·꽃축제·해수욕장·계곡·단풍·억새·눈꽃·해돋이. 회색 면 8px 라운드, 선택되면 `#E1EEFF` 면에 `#013B84` 글씨.

- 한 줄로 **가로 스크롤**. 접거나 더보기를 만들지 않는다 — 8개는 스크롤로 충분하다.
- **`일반 검색`은 칩이 아니다.** 자유 입력어는 칩 모양을 절대 갖지 않는다. 칩은 "검증된 테마"의 시각적 약속이고, 일반 검색에 칩을 주면 ADR-0003이 막으려는 오해가 바로 생긴다.

### sort-toggle — 온라인 언급 많은 순 / 온라인 언급 적은 순

회색 트랙(`#F2F4F6`) 위에 선택된 항목만 흰 알약으로 뜨는 세그먼트 컨트롤. **파란색을 쓰지 않는다** — 어느 쪽도 권장 방향이 아니기 때문이다(양방향 탐색).

바로 아래에 caption으로 **기준 시점 한 줄**이 붙는다. 이 캡션은 선택 사항이 아니다. 다만 거기에 공급자 이름이나 해명 문장을 싣지 않는다 — 오해를 막는 일은 반복되는 문장이 아니라 **라벨 자체**가 한다. `온라인 언급 많은 순`이라는 이름이 이미 "무엇을 센 값인지"를 말하고 있고, 그래서 `인기 많은 순`이라는 옛 이름을 버렸다.

### crowd-badge — 방문 혼잡도 예측 배지

`한산`(파랑 틴트) · `보통`(회색) · `혼잡`(옅은 빨강). 8px 라운드, 13px 600.

문구는 **항상 장소를 한정한다**: `이 장소 기준 한산`. `한산` 두 글자만 쓰면 시금석에 걸린다.

- **날짜 조건이 걸렸을 때만 그린다 (#49).** 목록 카드에서 예측 표시는 **날짜 모드가 정한 하나**뿐이다. 두 모드의 값을 서로 대신 쓰지 않는다 — 확정 모드에 한산 예상일을 대신 띄우면 사용자가 고른 날이 아닌 다른 날의 이야기가 끼어든다.
- **날짜 확정 모드:** 선택일 하나에 배지 하나.
- **날짜 유연 모드:** 배지 대신 `quiet-date-value`로 한산 예상일을 보여준다.
- **예측이 없으면 — 상세에서는** 배지 자리에 `no-data-badge`가 온다. 배지를 숨기지 않는다: 상세는 근거를 줄줄이 늘어놓는 자리라 줄 하나가 통째로 사라지면 빈자리가 "예측이 좋다"로 읽힌다.
- **예측이 없으면 — 목록 카드에서는** 그 자리를 **비운다.** 규칙이 자리마다 다른 것이 아니라 빈자리가 읽히는 방식이 다르다. 카드에는 배지가 분류 태그와 예측 둘뿐이라 예측이 빠지면 예측 이야기가 아예 없고, `보통`(회색 면에 글자로 적힌다)으로도 `한산`(셋 중 유일하게 색을 쓴다)으로도 읽히지 않는다. 대신 **카드가 비어 있다는 것이 "모른다"는 뜻**이라는 사실은 도움말이 말한다.

### no-data-badge — 정보 없음

흰 바탕 + `#D1D6DB` 1px **점선** + `#4E5968` 글씨. 채워진 배지들 사이에서 형태로 구분된다.

**목록 카드에서는 쓰지 않는다 (#49).** 이 배지가 사는 곳은 상세 화면·시·군 시트·나만의 지도다. 카드에는 없는 값을 말할 자리가 없다 — 없다고 말할 값 자체를 카드에서 뺐기 때문이고, 없음 배지 여섯 개가 늘어선 카드는 "확인해 봤다"가 아니라 "쓸 것이 없다"로 읽혔다.

**모양은 하나지만 문구는 없는 이유마다 다르다.** 여러 신호의 결측을 `보조 정보 없음` 한 줄로 뭉치면 무엇을 확인해 봤는지가 사라진다 — `이름이 흔해 가릴 수 없었다`와 `호출이 실패했다`는 사용자에게 다른 사실이다.

| 신호 | 없을 때의 문구 | 어디에 |
|---|---|---|
| 온라인 언급량 | `언급 판정 보류`(이름이 모호해 그 장소의 값으로 볼 수 없음) · `언급 집계 대상 아님`(검색어를 만들 수 없음) · `언급 미수집`(값을 얻지 못함) | **어디에도 (#49)** — 목록의 미산정 구간은 배지가 아니라 divider 가 가른다 |
| TMAP 검색순위 | `TMAP 미수록` — 수록되지 않은 것이지 순위가 낮은 것이 아니다 | **어디에도 (#49)** |
| 입장객 수 | `입장객 미집계`(그 공표월에 집계 없음) · `입장객 정보 없음`(통계를 아직 확인하지 못함) | **어디에도 (#49)** |
| 중심관광지 순위 | `중심관광지 순위 미산정` | **어디에도 (#49)** |
| 방문 혼잡도 예측 | `예측 정보 없음` | 상세 30일 예측 · 대체지 후보 카드 (목록 카드는 자리를 비운다) |
| 현재 접근 혼잡 | `현재 접근 정보 없음` · `도로 소통 정보 없음` · `주차 정보를 확인하지 못했어요` | 상세 |
| 시·군 방문 규모 | `방문 규모 정보 없음` | 시·군 시트 |
| 저장한 곳의 원본 | `더 이상 찾을 수 없는 곳이에요 — 정리해도 괜찮아요` · `이번에는 확인하지 못했어요 — 사라진 곳은 아니에요` | 나만의 지도 |

위 네 신호의 문구는 **지우지 않고 남겨 둔다.** 값은 계속 오고 정렬이 계속 쓰므로, 상세가 언젠가 이 신호들을 보여주게 되면 그때 이 문구들이 그대로 쓰인다 — 없는 이유를 다시 발명하지 않는다.

### stale-badge — 최근 저장된 정보

흰 바탕 + `#D1D6DB` 1px **실선** 테두리 + `#4E5968` 글씨. 점선(`값이 없다`의 약속)도 빨강(오류)도 쓰지 않는다 — 마지막으로 정상 수신한 값은 없는 값도 오류도 아니고 **지금 줄 수 있는 최선**이다.

- **캡션 한 줄**(`최근 저장된 정보 · 3시간 전 기준`)이 기본 꼴이다. 얼마나 지난 값인지 함께 적고, 기준 시점을 모르면 `최근 저장된 정보`까지만 적는다 — 모르는 것을 `0시간 전`으로 만들지 않는다.
- **목록 카드에는 뜨지 않는다 (#49).** 카드의 예측 배지는 날짜 조건이 걸렸을 때 생기는 하나뿐이고, 그 옆에 `최근 저장된 예측`을 더 붙이면 줄인 카드에 다시 두 번째 줄이 생긴다. 낡았는지는 상세에서 말한다.
- **낡았다는 사실이 기준 시점보다 먼저 온다.** 값이 최신인 줄 알고 움직이면 헛걸음이 되기 때문이다.
- **`정보 없음`과 같은 문구를 쓰지 않는다.** 낡은 값을 없다고 말하면 쓸 수 있는 정보를 버리고, 없는 값을 낡았다고 말하면 있지도 않은 숫자를 기다리게 한다.

### data-source-note — 기준 시점 캡션

**화면 캡션은 기준 시점 한 줄이다.** `9월 21일 기준` · `8.16~8.22 기준` · `9월 21일 오전 04:11 조회`. 그 이상은 적지 않는다.

- **공급자·API 이름을 적지 않는다.** 캡션마다 같은 접두어가 반복되면서 정작 사용자가 쓸 기준 시점을 밀어낸다.
- **해명 문장을 적지 않는다.** 오해를 막는 일은 반복되는 문장이 아니라 **라벨 자체**가 한다.
- **해가 다르면 연도를 남긴다.** 작년 9월을 `9월 기준`으로 적으면 올해 값으로 읽힌다. 줄이는 것과 틀리게 적는 것은 다른 일이다.
- **기준 시점을 모르면 그 줄을 아예 그리지 않는다.** 빈 캡션을 자리만 지키게 두지 않는다.

### help — 신호 설명이 모이는 한 자리

무엇을 세는 값인지는 **도움말 한 곳**에서만 말한다. 화면 캡션이 그 설명을 나눠 지면 같은 문장이 화면마다 반복되고, 그러면서도 각 신호가 무엇인지는 어디에도 온전히 쓰여 있지 않게 된다.

- **`help-button`(ⓘ):** 40px 회색 원. 아직 한 번도 열어 보지 않았으면 오른쪽 위에 `#013B84` 점 하나가 붙는다.
- **자동으로 띄우지 않는다.** 처음 온 사람에게 가장 필요한 것은 설명이 아니라 목록이다. 점은 읽을 거리가 있다는 표시일 뿐 길을 막지 않는다.
- **정적 텍스트다.** 데이터를 부르지 않으므로 어느 화면에서 열어도 같은 내용이고, 그래서 캡션이 이것을 대신하려 들 이유가 없다.

### road-status — 현재 접근 혼잡

**8px 색 점 + `#4E5968` 텍스트.** 도로 소통은 초록/주황/빨강 점, 주차는 잔여면 숫자. 배지가 아니라 점인 이유는 **다른 신호와 형태를 다르게 만들기 위해서**다.

`조회 시각`이 반드시 같은 줄에 붙는다. 도로와 주차는 공급자도 조회 시각도 달라 **같은 캡션에 묶지 않는다.**

**주차는 네 상태가 각각 다른 문장을 가진다.** 특히 `확인했고 없다`와 `확인하지 못했다`를 같은 말로 덮지 않는다 — 앞엣것은 확인이 끝난 사실이고 뒤엣것은 아직 모른다는 고백이라, 형태부터 다르다(채운 글자 / 점선 배지).

| 상태 | 화면 |
|---|---|
| 실시간을 아는 주차장이 있다 | `이름 · 거리 · 잔여 N면 / 총 M면` + `fact-badge` 등급(`여유`·`보통`·`혼잡`·`만차`). **잔여면이 등급보다 앞에 온다** — 등급은 잔여 비율의 요약일 뿐이고 판단 근거는 자리 수다 |
| 규모만 아는 주차장이 있다 | `실시간 잔여 정보 없음 · 주차장 규모만 확인했어요` 캡션 + `이름 · 거리 · 총 N면`. 앞에 실시간 줄이 있으면 `그 밖의 주차장은 규모만 알아요 · 실시간 잔여 정보 없음` |
| 반경 안에 없다 (`NONE`) | 채운 글자로 `반경 1km 안에 주차장이 없어요` — 배지가 아니다. 확인이 끝난 사실이다 |
| 확인하지 못했다 (`NO_DATA`) | `no-data-badge` `주차 정보를 확인하지 못했어요` |

**등급에 색을 빌려 오지 않는다.** 초록·주황·빨강 점은 도로 소통의 관습 문법이고, 그 색을 주차에 쓰면 두 신호가 한 덩어리로 읽힌다. 주차 등급은 회색 면 배지 안의 **글자**다.

**실시간 값이 하나도 없으면 조회 시각 캡션을 그리지 않는다.** 반기마다 갱신되는 정적 정보에 시각을 달면 방금 본 값처럼 읽힌다.

### map — 방문 규모 지도

- **행정구역 면:** 파랑 4단계. 경계선 `#8B95A1` 1px. **램프는 포인트 색 토큰에서 파생된다** — 1단 `primary-surface` → 2단 `primary-soft` → 3단 `primary` → 4단 `primary-strong`. 방문 규모의 단계 색이라 포인트 색과 뜻이 다르지만 값은 같은 계열에서 나오고, 2026-09-21 포인트 색 변경에서도 **이 파생 관계는 그대로 두었다**(램프 자체를 재설계하지 않았다).
- **램프 3단과 4단이 가깝다(주의 — 2026-09-21 확인).** 새 포인트 색에서 `primary`(L 33.3%)와 `primary-strong`(L 26.1%)의 명도 차가 7.3%p로, 옛 값(9.8%p)보다 좁아졌다. 인접 대비 1.33:1. **시·군 방문 규모 시트의 12px 스와치에서 실제로 확인된다** — 1~4위(`primary-strong`)와 5~8위(`primary`)가 한눈에는 같은 남색으로 보인다. **접근성 문제는 아니다:** 각 줄에 `방문 규모 N위` 글자가 함께 있어 순서가 색에만 실려 있지 않고, 지도 범례도 항상 켜져 있다. 다만 색만으로 두 구간을 가르기는 전보다 어렵다 — 실사용에서 걸리면 램프 4단을 포인트 색과 분리해 따로 잡는다(이 문서가 아니라 1단계 재실행 사안).
- **데이터 없는 시·군:** `#E5E8EB` 사선 해칭. 램프 밖의 표현.
- **장소 라벨:** 흰 알약 + `#191F28` 글씨. 지도 위 어떤 색 위에서도 읽히게 하는 유일한 방법이다.
- **범례:** 흰 카드, 16px 라운드, 항상 켜져 있다. 안에 색 구간 · 기준 기간 · 출처가 들어간다. **접히지 않는다.**
- **`이 지도 영역에서 검색`:** 지도 위 40px 흰 플로팅 버튼, 파란 글씨, 두 겹 그림자. 지도를 움직인 뒤에만 나타난다.
- **지도 확대가 읍·면·동에 도달하면** 색을 만들지 않고 마커만 남긴다. 색이 사라지는 것을 사용자가 알 수 있도록 범례에 상태 문구를 남긴다.

### search-field — 검색 입력

회색 면 48px, 16px 라운드. 플레이스홀더 `#6B7684`. **검색 시트 안에만 둔다** — 탐색 홈 상단 바에는 두지 않는다(#44 확정). 시트 밖의 입구는 조건 요약 줄의 테마·검색 칩이다.

자유 입력이 지원 테마로 정규화되면 **결과 위에 그 사실을 한 줄로 남긴다** — `'해수용장' → 해수욕장 테마로 찾았어요`. 조용히 바꾸지 않는다. 입력어와 테마 이름이 **같으면** 알리지 않는다(`해수욕장` → `해수욕장`) — 바뀐 것이 없는데 알리면 아무 정보도 아니다.

### general-search-notice — 일반 검색 안내

회색 면 블록. **파란색을 쓰지 않는다.** 파랑은 이 제품에서 "검증된 것"의 색이고, 일반 검색 결과는 검증되지 않았다(ADR-0003).

**한 줄까지만 줄이고 지우지 않는다** — `'커피'로 찾은 결과예요 — 테마 큐레이션은 거치지 않았어요`. 이 문장은 공급자 해명이 아니라 결과의 **자격**에 대한 말이다. 지원 테마 결과와 일반 검색 결과는 같은 카드 모양으로 오기 때문에, 이 줄이 없으면 둘을 가를 것이 화면에 남지 않는다.

### 0건 — 검색과 범위를 가른다

결과가 없을 때 무엇을 고치라고 말하는지가 갈린다. **검색어로 0건이면 검색 이야기**(`'즐라탄'에 맞는 관광지가 없어요`)를, **범위로 0건이면 범위 이야기**(`이 범위에 관광지가 없어요` + [지도 넓히기])를 한다. `즐라탄`을 친 사람에게 범위를 넓히라고 하는 것은 엉뚱한 곳을 고치라는 말이다.

검색 0건에는 가까운 지원 테마 세 개를 **링크 칩**으로 준다. 억지 후보를 채우는 대신 다음으로 갈 수 있는 자리를 주는 것이고, **눌러서 실제로 그 테마로 다시 찾아진다** — 누를 수 있어 보이면 누를 수 있어야 한다.

### 저장과 개인 컬렉션

- **save-button:** 40px 원. 회색 면 → 저장되면 파랑 틴트.
- **saved-count-badge:** `#013B84` 면에 흰 숫자, 알약. 하단 내비게이션의 `나만의 지도`에 붙는다.
- **tag-chip:** 알약형 회색 칩. 테마 칩(8px 라운드)과 **모양으로 구분된다** — 사용자가 쓴 것과 시스템이 검증한 것은 같은 모양이면 안 된다.
- **memo-field:** 회색 면 16px 라운드.
- **읽을 수 없게 된 저장값:** `error-state` 면 하나로 `저장 정보를 읽을 수 없어요` + 되돌릴 수 없다는 경고 + [지우고 새로 시작하기]. **빈 상태 문구와 함께 띄우지 않는다** — `아직 저장한 곳이 없어요`와 나란히 두면 어느 쪽이 사실인지 알 수 없다. 지우기는 **한 단계 확인**을 거치고([그대로 두기] / [지우고 새로 시작]), 확인 전까지 원본은 그대로 남는다.
- **일부만 읽지 못했을 때는 다르다.** 정상 항목은 그대로 보여주고 목록 위에 한 줄만 올린다. 통째 손상과 일부 손상은 사용자가 할 수 있는 일이 달라서, 같은 화면으로 덮으면 통째로 상한 사람에게는 빠져나올 길이 없어진다.

### 상태 — 빈 결과 · 오류 · 로딩

- **empty-state:** `#F9FAFB` 블록, 20px 라운드. 문구 한 줄 + 버튼 하나. 나만의 지도가 비었을 때는 **빈 지도 대신 탐색 홈으로 가는 버튼**(ADR-0005).
- **error-state:** `#FFEEEE` 면 + `#A51926` 글씨. 무슨 데이터가 실패했는지 이름을 말한다 — `혼잡도 예측을 불러오지 못했어요`. **한 섹션의 실패가 화면 전체를 대체하지 않는다.** 다른 섹션은 그대로 산다.
- **로딩:** 스피너 대신 **스켈레톤**. `#F2F4F6` 면을 실제 카드와 같은 크기·라운드로 놓는다. 이 화면은 외부 API 대여섯 개를 기다리므로 스피너를 쓰면 화면이 계속 깜빡인다.
- **부분 결측:** 화면은 뜨고 배지만 `no-data-badge`인 상태가 **정상**이다. 이 상태를 예외로 취급하지 마라. 이 제품에서 가장 흔한 상태다. 목록 카드에서는 결측이 아예 보이지 않는다 (#49) — 카드가 그리는 넷(사진·이름·주소·분류)은 대개 다 있고, 날짜 배지만 조용히 빠진다.

## Do's and Don'ts

**데이터를 말하는 방식 — 이 제품의 진짜 제약**

- Do 모든 신호에 **기준 시점 캡션**(`data-source-note`)을 붙인다. 그게 없으면 그 신호를 화면에 올리지 않는다.
- Don't 캡션에 **공급자·API 이름**(`KorService2`, `TatsCnctrRateService`, …)을 적지 마라. 내부 사정이고, 사용자가 그 이름으로 할 수 있는 일이 없다. 출처는 도움말 한 곳에 모은다.
- Don't 캡션을 **해명 문장**으로 쓰지 마라 — "실제 방문객 수가 아니라 …"를 카드마다 반복하는 대신 라벨 자체가 무엇을 센 값인지 말하게 한다.
- Do 신호 설명은 **도움말 한 곳**에만 둔다. 캡션이 그 일을 나눠 지면 같은 문장이 화면마다 반복되면서도 정작 온전한 설명은 어디에도 없게 된다.
- Do 값이 낡았으면 **낡았다는 사실을 기준 시점보다 먼저** 말한다(`stale-badge`). Don't 낡은 값을 `정보 없음`으로 덮지 마라 — 쓸 수 있는 정보를 버리는 일이다.
- Don't 서로 다른 신호를 **하나의 점수·별점·게이지**로 합치지 마라 (ADR-0002, ADR-0006).
- Don't `숨은 명소` · `실시간 한산한 곳` · `혼잡한 순` · `한산한 순` 같은 말을 쓰지 마라. `CONTEXT.md`가 금지어로 지정했다.
- Do 혼잡 배지 문구에 **`이 장소 기준`을 항상 붙인다.**
- Don't 결측을 **옅은 색으로 채우지 마라.** 채운 색은 값이라는 뜻이다.
- Don't 값이 없다고 **배지를 숨기지 마라.** 빈자리는 좋은 소식으로 읽힌다.
- Do 지도 색 · 온라인 언급 정렬 · 혼잡 예측에 **각각 다른 범례와 다른 색 계열**을 준다.
- Don't 지도 확대 단계가 다를 때 **같은 색을 비교하게 두지 마라.** 단계가 바뀌면 범례 문구도 바뀐다.

**토스다움 — 형태**

- Do 묶음은 **테두리 대신 흰 카드와 회색 바탕의 명도 차이**로 만든다.
- Don't 그림자를 장식으로 쓰지 마라. **진짜 떠 있는 것**(지도 위 버튼, 시트, 토스트)에만.
- Do 새 버튼의 라운드는 **높이 ÷ 4**로 계산한다.
- Don't 카드 안 사진에 카드와 **같은 라운드**를 쓰지 마라. 한 단계 작게.
- Do 파란색은 **화면당 행동 하나**에만. 정보 강조에 쓰지 않는다.
- Don't 굵기를 **한 화면에 세 종류 넘게** 쓰지 마라.
- Do 주요 타이틀 서체(`font.display` — 배달의민족 주아체)는 **`display`·`headline-lg`·`headline-md` 세 스케일에서만** 쓴다.
- Don't 주아체를 **본문·숫자·배지**에 쓰지 마라. 붓글씨라 작은 글씨에서 뭉치고, 등폭 숫자가 없어 `data-value`의 자릿수가 흔들린다.
- Do 여백으로 나눈다. 48/24/8, 이 세 값 밖으로 나가지 않는다.

**한국어와 접근성**

- Do `word-break: keep-all`을 전역에 건다.
- Don't 자간을 좁히지 마라. 측정값은 `normal`이다.
- Don't **`#8B95A1` 이하 회색을 글씨에 쓰지 마라** — 흰 배경 3.04:1로 AA 미달. 캡션은 반드시 `#6B7684`(4.62:1).
- Do **글씨가 올라가는 파랑은 언제나 `#013B84`**(`primary-strong`)다. `#014CA9`도 흰 배경에서 8.05:1로 대비는 되지만, 파란 글씨를 한 값으로 모아야 「화면당 행동 하나」가 화면에서 지켜진다.
- Don't `#4899FE`(`primary-soft`)에 **글씨를 얹지 마라** — 흰 글씨 2.89:1. 지도 램프 2단 전용이다.
- Don't 색만으로 상태를 구분하지 마라. 도로 점 옆에는 항상 글자가 있다.
- Do 포커스 링을 남긴다. 지우지 마라.

**경계**

- Don't 이 문서에서 **무엇을 언제 보여줄지**를 정하지 마라. 그건 동작이고, 개발 체인(`/grill-with-docs-5` → `/update-prd-5` → `/to-issues-5` → `/tdd-5`)의 일이다.
- Don't 여기서 **화면 배치**를 짜지 마라 → `WIREFRAME.md`(2단계).

## 측정 근거

2026-09-02, `https://toss.tech` 실렌더에서 직접 측정한 값:

> **파랑은 더 이상 측정값이 아니다.** 2026-09-21 사용자 결정으로 포인트 색을 `#014CA9`로 바꾸면서 파랑 5단계를 다시 설계했다 — 아래 「포인트 색 재설계」 참조. 측정에서 온 것은 옛 값(`#3182F6` `#1B64DA` `#194AA6` `#E8F3FF` `#90C2FF`)이고, 지금은 계보로만 남는다. **회색·빨강·초록·주황과 라운드·타이포·여백·그림자·전환은 측정값 그대로다.**

| 항목 | 측정값 |
|---|---|
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
| 포커스 링 | 두 겹 `inset 0 0 0 1.5px` + `0 0 0 2px` (색은 새 포인트 색 — `#014CA9` / `#E1EEFF`) |

### 포인트 색 재설계 (2026-09-21 사용자 결정)

`#014CA9`를 기준으로 같은 색상(H 213.2°)·같은 채도(S ≈ 99%)에서 명도만 내려 5단계를 다시 잡았다. 값과 산출 근거:

| 토큰 | 옛 값 | 새 값 | 명도 L | 흰 배경 위 대비 |
|---|---|---|---|---|
| `primary` | `#3182F6` | **`#014CA9`** | 33.3% | **8.05:1** (옛 3.71:1) |
| `primary-strong` | `#1B64DA` | **`#013B84`** | 26.1% | **10.71:1** (옛 5.41:1) |
| `primary-deep` | `#194AA6` | **`#012B60`** | 19.0% | 13.85:1 (옛 8.17:1) |
| `primary-surface` | `#E8F3FF` | **`#E1EEFF`** | 94.1% | 1.17:1 (면 전용) |
| `primary-soft` | `#90C2FF` | **`#4899FE`** | 63.9% | 2.51:1 (면 전용) |

**명도 대비 — 요건 세 줄은 전부 통과:**

| 조합 | 대비 | 요건 | 판정 |
|---|---|---|---|
| 흰 배경 위 `primary` 텍스트 | **8.05:1** | ≥ 4.5:1 | 통과 |
| `button-primary`(`primary-strong` 면) 위 흰 글씨 | **10.71:1** | ≥ 4.5:1 | 통과 |
| `primary-surface` 면 위 `primary-strong` 텍스트 | **9.12:1** | ≥ 4.5:1 | 통과 |

그 밖에 이 팔레트가 실제로 쓰이는 조합:

| 조합 | 대비 |
|---|---|
| `button-primary-pressed`(`primary-deep` 면) 위 흰 글씨 | 13.85:1 |
| `primary-surface` 면 위 `primary` 텍스트 | 6.85:1 |
| `grey-50` 바탕 위 `primary-strong` 텍스트 (`bottom-nav-item-active`) | 10.25:1 |
| `grey-50` 바탕 위 `primary` 텍스트 | 7.71:1 |
| `saved-count-badge`(`primary-strong` 면) 위 흰 숫자 | 10.71:1 |
| `primary-soft` 면 위 흰 글씨 — **쓰지 않는다** | 2.89:1 |

### 레퍼런스에 근거가 없어 골랐고, 확인받은 값 (2026-09-02)

측정할 수 없어 고른 값은 넷이었고 전부 사용자 확인을 거쳤다. 2026-09-21에 타이틀 서체 한 줄이 늘어 다섯이다. **현재 미확인 값은 없다** — 타이틀 서체는 결정이 끝났고 남은 것은 라이선스 확정이지, 무엇을 쓸지가 미정인 것이 아니다.

| 값 | 결정 | 왜 |
|---|---|---|
| 본문 서체 `Pretendard` | 확정 | Toss Product Sans는 토스 전용이라 사용 불가. 한글 자소 폭과 시각 보정이 가장 가깝고 OFL이라 공모전 제출에 제약이 없다 |
| 타이틀 서체 `배달의민족 주아체` | 확정·적용 (2026-09-21) | 우아한형제들 무료 배포 글꼴. **폰트 파일의 nameID 13 이 SIL Open Font License 1.1 을 명시**하고 금지는 폰트 파일 유상 판매 하나뿐이라 공모전 제출에 제약이 없다. OFL 은 포맷 변환을 Modified Version 으로 보므로 CSS 패밀리 이름은 Reserved Font Name(`BM JUA`) 대신 **`Jua`**(Google Fonts 배포본 이름)를 쓴다. 공식 배포본이 TTF(1.45MB)·OTF(1.24MB)뿐이라 버전 고정된 jsDelivr woff(413KB)를 `@font-face`로 쓴다. 단일 굵기라 `font-weight: 400 700` 으로 선언해 합성 볼드를 막고 Pretendard 폴백의 700 은 살렸다 |
| 주 버튼 = `primary-strong` | 확정 (값은 2026-09-21 갱신) | 처음엔 `#3182F6` + 흰 글씨가 3.71:1로 AA 미달이라 **글씨 자리만** 한 단계 진하게 하는 규칙이었다. 포인트 색이 `#014CA9`로 바뀌면서 미달은 사라졌지만(8.05:1) **규칙은 남겼다** — 파란 글씨를 한 값으로 모아야 「화면당 행동 하나」가 지켜진다. 현재 값 `#013B84`, 흰 글씨 10.71:1 |
| `혼잡` 배지 = 한산만 강조 | 확정 | 신호등 3색은 절대적 좋고 나쁨의 문법이라 "초록인 곳으로 가자"를 유발한다 — ADR-0002가 막으려는 장소 간 비교가 그대로 생긴다 |
| 도로 `서행` `#FF9200` | 확정 | 원활–서행–정체는 도로 소통의 관습 문법. 배지가 아니라 8px 점이라 다른 신호와 형태가 달라 섞이지 않는다 |

**~~토스 브랜드 색 `#3182F6`은 그대로 쓴다~~ — 2026-09-21 사용자 결정으로 폐기.** 옛 규칙은 "파랑 계열을 옮기는 것은 성격 변경이니 필요해지면 1단계를 다시 돈다"였다. 사용자가 포인트 색을 `#014CA9`로 직접 결정했고(2026-09-21), 그 결정은 **색상 계열(파랑)과 그 뜻("검증된 것")을 그대로 두고 명도만 내린 것**이라 룩의 성격을 바꾸지 않는다. 그래서 1단계 재실행 없이 이 문서를 제자리에서 고쳤다. **파랑이 아닌 색으로 옮기는 일**은 여전히 성격 변경이고, 그때는 1단계(`/to-designmd-5`)를 다시 돈다.

**남는 lint 경고 2건**(사유 기록):

- `button-primary-disabled` 1.82:1 — 비활성 요소는 WCAG 대비 요건 제외 대상.
- `search-field-placeholder` 4.19:1 — 플레이스홀더는 실제 정보가 아니며, 입력된 값은 `#191F28`(16.4:1)로 표시된다.

## Change Log

- **2026-09-02** — 최초 작성 · 게이트 3다리 통과(`designmd lint` 에러 0 · 산문 기각력 · 충실도 미리보기). 미확인 값 0.
- **2026-09-21** — PRD v4 어휘와 #35 결정을 제자리 반영. `sort-toggle` 을 `온라인 언급 많은 순 / 온라인 언급 적은 순`으로 개칭하고 캡션에서 공급자 이름·해명 문장을 뺐다. `place-card` 구성에 **장소 발견 신호 세 줄**(언급량·TMAP·입장객)을 고정 순서로 추가하고 캡션을 기준 시점 한 줄로 줄였다. `no-data-badge` 는 모양 하나에 **없는 이유마다 다른 문구**를 쓰는 규칙으로 바꿨다. 색 계열 표에 TMAP·입장객 행을 더했다(둘 다 색 없음). 룩·토큰 값은 변경 없음. 근거: 이슈 #18 · #19 · #35.
- **2026-09-21** — 구현된 문구 규칙을 제자리 반영(#35 마감). `data-source-note` 절을 새로 두어 **화면 캡션은 기준 시점 한 줄**이라는 규칙과 그 예외(해가 다르면 연도·시점을 모르면 줄 자체를 그리지 않음)를 적었고, 신호 설명이 모이는 한 자리로 `help` 절(ⓘ 40px 원 · 첫 사용 점 · 자동으로 띄우지 않음)을 더했다. 낡았지만 있는 값을 위해 `stale-badge`(실선 테두리)를 두고, 배지를 **면 / 실선 / 점선 세 등급**으로 정리했다(`fact-badge`·`stale-badge`·`no-data-badge`). `road-status` 의 주차를 **네 상태**로 펼치고(`확인했고 없다` ≠ `확인하지 못했다`, 등급은 색이 아니라 글자), 검색 절에 정규화 한 줄·일반 검색 자격 한 줄·0건의 검색/범위 분기와 제안 테마 링크 칩을 적었다. 개인 컬렉션에 **통째 손상 복구 흐름**(한 단계 확인)을 더했다. 컴포넌트 48 → 51(`stale-badge`·`fact-badge`·`help-button`). 색·타이포·라운드·여백 토큰 값은 변경 없음. 근거: 이슈 #35 · PR #38 · #39.

- **2026-09-21** — **포인트 색을 `#014CA9`로 바꿨다**(사용자 결정 2026-09-21). 파랑 5단계를 같은 색상(H 213.2°)·같은 채도에서 명도만 내려 다시 설계했다: `primary #3182F6 → #014CA9` · `primary-strong #1B64DA → #013B84` · `primary-deep #194AA6 → #012B60` · `primary-surface #E8F3FF → #E1EEFF` · `primary-soft #90C2FF → #4899FE`. 대비가 전 구간에서 올라갔고(흰 배경 위 `primary` 3.71 → **8.05:1**, 주 버튼 흰 글씨 5.41 → **10.71:1**, `primary-surface` 위 `primary-strong` 4.82 → **9.12:1**) 요건 세 줄을 모두 통과한다 — 「측정 근거 › 포인트 색 재설계」에 수치 표를 새로 뒀다. **파랑이 "검증된 것"의 색이라는 뜻과 컴포넌트별 배정은 바꾸지 않았다.** `#3182F6`은 대비 미달 때문에 글씨가 금지됐었는데 그 이유가 사라져, `primary`도 글씨로 쓸 수 있지만 「화면당 행동 하나」를 위해 파란 글씨를 `primary-strong` 하나로 모으는 규칙은 남겼다. 지도 램프(`map-region-fill-*`)는 방문 규모 단계 색이라 재설계하지 않고 포인트 색 토큰에서 파생되는 관계를 그대로 뒀으며, 그 결과 3단·4단이 전보다 가까워진 것(명도 차 9.8 → 7.3%p)을 `map` 절에 주의로 적었다. 「토스 블루는 그대로 쓴다」는 옛 문장은 이 결정으로 폐기했다. 타이포·라운드·여백·그림자 토큰은 변경 없음.

- **2026-09-21** — **주요 타이틀에 배달의민족 주아체를 적용했다**(사용자 결정 2026-09-21). front matter에 `font.display` 토큰을 새로 두고 `display`·`headline-lg`·`headline-md` 세 스케일의 `fontFamily`를 `"{font.display}"`로 바꿨다. 값은 `"Jua", Pretendard, …`. 라이선스는 **SIL Open Font License 1.1** 이다 — 공식 배포본 `BMJUA_ttf.ttf`(Version 1.100)의 `name` 테이블 nameID 13 이 직접 밝히고 있고, 저작권은 nameID 0 `Copyright (c) 2014 WOOWA BROTHERS Corporation(www.woowahan.com) with Reserved Font Name "BM JUA"` 다(배포처 <http://font.woowahan.com/jua/>). **패밀리 이름은 `Jua`** 로 썼다 — OFL 은 포맷 변환도 Modified Version 으로 보므로(§1) 변환본은 Reserved Font Name 을 못 쓴다(§3). 공식 배포본이 TTF(1.45MB)·OTF(1.24MB)뿐이고 plain HTTP 로만 받을 수 있어, 버전 고정된 jsDelivr woff(413KB)를 `app.css` 의 `@font-face` 로 불러온다(`font-display: swap`). **단일 굵기 서체라 `font-weight: 400 700` 범위로 선언해** 합성 볼드를 막고, 유틸리티의 `font-weight: 700` 은 남겨 폰트가 안 뜰 때 Pretendard 700 으로 떨어지게 했다. 219KB 자체 호스팅 woff2 로 옮기는 개선이 남아 있으나 레포에 바이너리를 넣는 일이라 사용자 승인 대기다. `title-md` 이하(본문·라벨·배지·캡션·`data-value`·`nav-label`)는 Pretendard 그대로이고, 주아체를 본문·숫자·배지에 쓰지 않는다는 Do/Don't를 더했다. 크기·행간·색 토큰은 변경 없음. `WIREFRAME.md`는 구조 문서라 영향 없음(확인함).

- **2026-09-21** — **목록 카드를 이름·주소·분류 태그로 줄였다**(사용자 결정 2026-09-21, 이슈 #49). `place-card` 절에서 **장소 발견 신호 세 줄**(언급량·TMAP·입장객)과 중심관광지 순위 배지, 카드 기준 시점 캡션을 걷어냈다 — 구성은 `사진 → 이름 → 주소 → 분류 태그` 넷이고, 날짜 조건이 걸렸을 때만 예측 표시 하나가 더 붙는다. 그 값들은 **응답에서도 정렬에서도 사라지지 않았다.** 표현 규칙만 바꿨고 내부 신호는 정렬에만 쓴다(PRD 슬라이스 #4 프론트엔드 파트 대비). `crowd-badge` 절에 **결측 처리가 자리마다 갈린다**는 규칙을 적었다: 상세는 `no-data-badge` 를 두고(줄이 사라지면 빈자리가 '좋다'로 읽힌다), 목록 카드는 **자리를 비운다**(카드의 배지가 둘뿐이라 빈자리가 `보통`으로도 `한산`으로도 읽히지 않는다). `no-data-badge` 절의 문구 표에 **어디에** 열을 더해, 신호 네 종의 없음 문구가 지금 어느 화면에도 뜨지 않는다는 사실을 적되 문구 자체는 남겼다(상세가 그 신호들을 보여주게 되면 그대로 쓴다). `stale-badge` 는 **캡션 전용**이 됐다 — 카드 예측의 `최근 저장된 예측` 배지를 뺐다. 룩·토큰 값은 변경 없음이고 컴포넌트 51개도 그대로다(배치처만 줄었다). 근거: 이슈 #49 · WIREFRAME U3 · U17.

---

<!-- 변경 이력은 git log로 추적한다. 이 문서는 버전 파일이 아니라 살아있는 단일 문서다. -->
- 2026-09-21 — #44 결정 반영: `search-field` 는 검색 시트 전용, 탐색 홈 상단 바에 두지 않음.
