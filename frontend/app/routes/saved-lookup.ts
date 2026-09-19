import type { Route } from "./+types/saved-lookup";
import { fetchCollectionLookup, LOOKUP_BATCH_LIMIT } from "../lib/collection-lookup.server";

/**
 * 나만의 지도가 저장된 식별자로 지금 상태를 묻는 자리 (슬라이스 #9).
 *
 * 컬렉션은 브라우저 저장소에만 있어 서버가 무엇을 저장했는지 모른다. 그래서 화면이
 * 식별자를 들고 여기로 온다. 백엔드 주소는 여전히 서버에만 있고, 브라우저는 이
 * 경로만 부른다 — 외부 관광 API를 직접 호출하지 않는다는 규칙은 그대로다.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const ids = url.searchParams.getAll("id").filter((id) => id.trim() !== "");

  const result = await fetchCollectionLookup(ids.slice(0, LOOKUP_BATCH_LIMIT), request.signal);

  if (!result.ok) {
    console.error(`[collection] ${result.failure.dataName} 조회 실패: ${result.failure.cause}`);
    // 저장 목록 자체는 브라우저에 있다. 재조회 실패가 화면을 무너뜨리지 않는다.
    return { items: [], source: null, error: { dataName: result.failure.dataName } };
  }

  return { ...result.data, error: null };
}
