import { useCallback, useEffect, useState } from "react";

import {
  readCollection,
  removePlace,
  savePlace,
  type CollectionSnapshot,
  type SavedPlace,
} from "./personal-collection";

const EMPTY: CollectionSnapshot = { places: [], droppedCount: 0 };

/** 같은 탭 안의 다른 컴포넌트들에게 저장이 바뀌었음을 알린다. */
const CHANGED_EVENT = "hansanada:collection-changed";

/**
 * 개인 컬렉션을 읽고 쓰는 훅.
 *
 * 서버에는 이 데이터가 없으므로 **첫 렌더는 항상 빈 상태**로 시작하고 마운트 후에 읽는다
 * — 그래야 SSR 결과와 하이드레이션이 어긋나지 않는다.
 */
export function useCollection() {
  const [snapshot, setSnapshot] = useState<CollectionSnapshot>(EMPTY);
  /** 저장소를 아직 읽지 않았다는 뜻. 빈 컬렉션과 구분해야 빈 상태를 성급히 보여주지 않는다. */
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    setSnapshot(readCollection());
    setLoaded(true);
  }, []);

  useEffect(() => {
    refresh();

    // 다른 탭에서의 변경(storage)과 같은 탭 안의 변경(커스텀 이벤트)을 모두 따라간다.
    const onChange = () => refresh();
    window.addEventListener("storage", onChange);
    window.addEventListener(CHANGED_EVENT, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(CHANGED_EVENT, onChange);
    };
  }, [refresh]);

  const save = useCallback((input: Parameters<typeof savePlace>[0]) => {
    setSnapshot(savePlace(input));
    window.dispatchEvent(new Event(CHANGED_EVENT));
  }, []);

  const remove = useCallback((placeId: string) => {
    setSnapshot(removePlace(placeId));
    window.dispatchEvent(new Event(CHANGED_EVENT));
  }, []);

  const isSaved = useCallback(
    (placeId: string) => snapshot.places.some((place) => place.placeId === placeId),
    [snapshot],
  );

  const find = useCallback(
    (placeId: string): SavedPlace | undefined =>
      snapshot.places.find((place) => place.placeId === placeId),
    [snapshot],
  );

  return { snapshot, loaded, save, remove, isSaved, find, refresh };
}
