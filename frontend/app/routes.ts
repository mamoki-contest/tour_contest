import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // 첫 화면은 개인 컬렉션이 아니라 발견을 위한 탐색 홈이다 (ADR-0005).
  index("routes/home.tsx"),
  route("places/:placeId", "routes/place-detail.tsx"),
  route("saved", "routes/saved.tsx"),
  // 저장된 식별자를 지금 상태로 바꿔 주는 자리. 화면이 아니라 데이터만 돌려준다.
  route("saved/lookup", "routes/saved-lookup.ts"),
] satisfies RouteConfig;
