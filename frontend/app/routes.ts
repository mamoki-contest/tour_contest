import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // 첫 화면은 개인 컬렉션이 아니라 발견을 위한 탐색 홈이다 (ADR-0005).
  index("routes/home.tsx"),
  route("places/:placeId", "routes/place-detail.tsx"),
  route("saved", "routes/saved.tsx"),
] satisfies RouteConfig;
