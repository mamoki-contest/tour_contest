# Audit Slice 선택 정책

이 문서는 audit-slice-5 3.6.4가 생성한 프로젝트 검증 모듈 정본이다. 공통 엔진은 전역 스킬이 소유하고, 이 프로젝트는 아래 모듈과 선택 근거를 소유한다.

## 비용 순서

`collection → targeted → full → mutation` 순서로 실행하며, 실패하거나 선택되지 않은 tier 위로 올라가지 않는다. high-risk mutation은 추가 규모를 고지한 뒤 사용자 승인 영수증이 필요하고, 스킬 릴리스 모델 평가도 별도 승인 경계를 유지한다.

## 모듈

| ID | 위험 | 목적 |
|---|---|---|
| `common` | low | 공통 구조·테스트 계약 |
| `docs-only` | low | 문서 전용 변경 |

각 실행의 선택·제외 이유는 `runs/<run-id>/route-decision.json`에 기록한다. `state/`와 `runs/`는 제품 기준점에서 제외하며 mutation 작업장은 저장소 밖에 둔다.
