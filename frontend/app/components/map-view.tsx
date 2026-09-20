import { useCallback, useEffect, useRef, useState } from "react";

import type { Place } from "../lib/contract";
import type { MapBounds } from "../lib/explore-params";
import { boundsFromCorners, sheetCoverHeight, visibleContainerRect } from "../lib/map-viewport";
import {
  loadKakaoMaps,
  type KakaoMap,
  type KakaoMapsApi,
  type KakaoMarker,
} from "../lib/kakao-map.client";

/** 강원특별자치도를 감싸는 경계. 첫 진입은 이 범위가 한눈에 들어오게 맞춘다. */
const GANGWON_BOUNDS = { swLat: 37.02, swLng: 127.05, neLat: 38.62, neLng: 129.4 };
const GANGWON_CENTER = { lat: 37.8228, lng: 128.1555 };
const GANGWON_LEVEL = 12;

/** 경계를 맞출 때 가장자리에 두는 여백(px). 아래쪽만 시트가 덮는 만큼 따로 잡는다. */
const EDGE_PADDING = 16;

function isDesktopViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(min-width: 1024px)").matches;
}

/**
 * 시트가 지도를 덮는 높이.
 *
 * 그만큼 여백을 주지 않으면 강원도가 시트 뒤에 놓여 화면에는 북쪽 바깥만 보인다.
 * 초기 맞춤과 조회 범위가 **같은 값**을 쓰게 한 곳에서 읽는다. 데스크톱은 시트가
 * 옆 컬럼이므로 덮는 높이가 0이다.
 */
function currentSheetCover(): number {
  if (typeof window === "undefined") return 0;
  return sheetCoverHeight(window.innerHeight, isDesktopViewport());
}

function toKakaoBounds(maps: KakaoMapsApi, bounds: MapBounds) {
  const latLngBounds = new maps.LatLngBounds();
  latLngBounds.extend(new maps.LatLng(bounds.swLat, bounds.swLng));
  latLngBounds.extend(new maps.LatLng(bounds.neLat, bounds.neLng));
  return latLngBounds;
}

export type MapLoadState = "LOADING" | "READY" | "FAILED";

/**
 * 방문 규모 지도 (슬라이스 #3).
 *
 * 이 컴포넌트는 지도 SDK와 관광지 마커까지만 맡는다. 시·군 방문 규모 색상 레이어는
 * 행정구역 경계와 방문 규모 데이터가 둘 다 있어야 그릴 수 있으므로 아직 그리지 않고,
 * 범례가 `방문 규모를 불러오지 못했어요` 상태로 그 사실을 말한다 — 색을 지어내지 않는다.
 */
export function MapView({
  appKey,
  places,
  onLoadStateChange,
  onSearchThisArea,
}: {
  appKey: string;
  places: Place[];
  onLoadStateChange: (state: MapLoadState) => void;
  /** 사용자가 `이 지도 영역에서 검색`을 눌렀을 때 확정되는 경계. */
  onSearchThisArea: (bounds: MapBounds) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const markersRef = useRef<KakaoMarker[]>([]);
  const [loadState, setLoadState] = useState<MapLoadState>("LOADING");
  /** 지도를 움직인 뒤에만 검색 버튼이 나타난다. */
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    onLoadStateChange(loadState);
  }, [loadState, onLoadStateChange]);

  useEffect(() => {
    let cancelled = false;

    loadKakaoMaps(appKey)
      .then((maps) => {
        if (cancelled || !containerRef.current) return;

        const map = new maps.Map(containerRef.current, {
          center: new maps.LatLng(GANGWON_CENTER.lat, GANGWON_CENTER.lng),
          level: GANGWON_LEVEL,
        });
        mapRef.current = map;

        // 시트에 가리지 않는 위쪽 영역에 강원도가 들어오게 맞춘다.
        map.setBounds(
          toKakaoBounds(maps, GANGWON_BOUNDS),
          EDGE_PADDING,
          EDGE_PADDING,
          currentSheetCover(),
          EDGE_PADDING,
        );

        const onIdle = () => setMoved(true);
        maps.event.addListener(map, "dragend", onIdle);
        maps.event.addListener(map, "zoom_changed", onIdle);

        setLoadState("READY");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        // 원인은 콘솔에만 남기고, 화면에는 복구 경로가 있는 실패 상태를 보여준다.
        console.error("[map] 카카오맵을 불러오지 못했습니다:", error);
        setLoadState("FAILED");
      });

    return () => {
      cancelled = true;
    };
  }, [appKey]);

  /** 마커는 목록과 같은 데이터를 쓴다 — 지도와 목록이 서로 다른 집합을 말하지 않게. */
  useEffect(() => {
    const map = mapRef.current;
    const maps = typeof window !== "undefined" ? window.kakao?.maps : undefined;
    if (!map || !maps || loadState !== "READY") return;

    for (const marker of markersRef.current) marker.setMap(null);

    markersRef.current = places
      .filter((place) => place.coordinates !== null)
      .map((place) => {
        const marker = new maps.Marker({
          position: new maps.LatLng(place.coordinates!.latitude, place.coordinates!.longitude),
          title: place.name,
        });
        marker.setMap(map);
        return marker;
      });

    return () => {
      for (const marker of markersRef.current) marker.setMap(null);
      markersRef.current = [];
    };
  }, [places, loadState]);

  /**
   * 사용자가 실제로 본 범위.
   *
   * `getBounds()` 는 컨테이너 전체를 말한다. 모바일에서는 바텀시트가 아래 55%를
   * 덮으므로, 그대로 쓰면 한 번도 보인 적 없는 남쪽까지 조회 범위에 들어간다.
   */
  const visibleBounds = useCallback((): MapBounds | null => {
    const map = mapRef.current;
    const container = containerRef.current;
    const maps = typeof window !== "undefined" ? window.kakao?.maps : undefined;
    if (!map || !container || !maps) return null;

    const rect = visibleContainerRect(
      container.clientWidth,
      container.clientHeight,
      currentSheetCover(),
    );

    if (typeof map.containerPointToLatLng === "function" && typeof maps.Point === "function") {
      const southWest = map.containerPointToLatLng(new maps.Point(rect.left, rect.bottom));
      const northEast = map.containerPointToLatLng(new maps.Point(rect.right, rect.top));
      return boundsFromCorners(
        { lat: southWest.getLat(), lng: southWest.getLng() },
        { lat: northEast.getLat(), lng: northEast.getLng() },
      );
    }

    // SDK가 변환을 내주지 않는 경우에만 컨테이너 전체로 돌아간다.
    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    return boundsFromCorners(
      { lat: sw.getLat(), lng: sw.getLng() },
      { lat: ne.getLat(), lng: ne.getLng() },
    );
  }, []);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full" aria-label="강원 관광지 지도" role="application" />

      {loadState === "READY" && moved ? (
        <div className="absolute inset-x-0 top-[calc(env(safe-area-inset-top)+72px)] flex justify-center lg:top-20">
          <button
            type="button"
            onClick={() => {
              const bounds = visibleBounds();
              if (!bounds) return;
              onSearchThisArea(bounds);
              setMoved(false);
            }}
            className="type-label-md inline-flex h-10 items-center rounded-lg bg-surface px-4 text-primary-strong shadow-float transition-colors duration-200"
          >
            이 지도 영역에서 검색
          </button>
        </div>
      ) : null}
    </div>
  );
}
