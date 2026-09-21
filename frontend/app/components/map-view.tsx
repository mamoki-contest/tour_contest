import { useCallback, useEffect, useRef, useState } from "react";

import type { Place } from "../lib/contract";
import type { MapBounds, MapViewport } from "../lib/explore-params";
import {
  boundsFromCorners,
  boundsOfPoints,
  sheetCoverHeight,
  visibleContainerRect,
} from "../lib/map-viewport";
import {
  loadKakaoMaps,
  type KakaoMap,
  type KakaoMapsApi,
  type KakaoMarker,
} from "../lib/kakao-map.client";
import { createMapGestureTracker, isSameViewport } from "../lib/map-auto-refresh";

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
  regionCode,
  urlViewport,
  initialBounds,
  onLoadStateChange,
  onAutoRefresh,
  onViewportChange,
}: {
  appKey: string;
  places: Place[];
  /**
   * 지금 목록에 **적용된** 시·군 코드. URL의 값이 아니라 로더가 실제로 조회한 값이다 —
   * 조회가 끝나기 전에 옮기면 이전 시·군의 마커로 지도를 맞추게 된다.
   */
  regionCode: string | null;
  /**
   * 주소가 말하는 지도 위치 (U6).
   *
   * 첫 맞춤이 이 값을 쓰고, 그 뒤로도 계속 본다 — 뒤로가기가 옛 주소를 되살리면
   * 지도도 그 자리로 돌아가야 목록과 지도가 같은 범위를 말한다 (#48).
   */
  urlViewport: MapViewport | null;
  /** 주소에 실려 온 조회 경계. 위치가 없을 때의 차선책 — 조회 범위와 화면을 맞춘다. */
  initialBounds: MapBounds | null;
  onLoadStateChange: (state: MapLoadState) => void;
  /**
   * 사용자 조작이 잦아든 뒤 확정되는 조회 경계 (#48).
   *
   * 버튼이 없어졌으므로 이 콜백이 목록을 바꾸는 유일한 입구다. 부르는 쪽은 이미
   * 디바운스를 거쳤고 프로그램 이동은 걸러진 뒤다 — 받는 쪽은 그대로 조회하면 된다.
   */
  onAutoRefresh: (bounds: MapBounds) => void;
  /** 사용자가 지도를 옮길 때마다 주소에 적어 둘 위치. 조회는 다시 돌지 않는다. */
  onViewportChange: (viewport: MapViewport) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const markersRef = useRef<KakaoMarker[]>([]);
  const [loadState, setLoadState] = useState<MapLoadState>("LOADING");

  /** 콜백이 매 렌더 새로 오더라도 지도를 다시 만들지 않게 최신 값만 붙잡아 둔다. */
  const viewportChangeRef = useRef(onViewportChange);
  viewportChangeRef.current = onViewportChange;
  const autoRefreshRef = useRef(onAutoRefresh);
  autoRefreshRef.current = onAutoRefresh;

  /**
   * 첫 렌더의 주소 상태. 지도 생성 효과는 `appKey` 에만 매달려 있으므로, 그 뒤에
   * 바뀐 값이 아니라 **마운트 시점의 값**으로 첫 화면을 맞춰야 한다.
   */
  const initialRef = useRef({
    viewport: urlViewport,
    bounds: initialBounds,
    regionCode,
  });

  /**
   * 이미 지도를 맞춘 시·군. `undefined` 는 아직 한 번도 맞추지 않았다는 뜻이다.
   *
   * 주소가 지도 위치를 들고 왔다면(상세에서 뒤로 온 경우) 그 위치가 이긴다 — 사용자가
   * 직접 옮겨 둔 화면을 시·군 기준으로 다시 잡아채지 않는다.
   */
  const fittedRegionRef = useRef<string | null | undefined>(
    initialRef.current.viewport ? initialRef.current.regionCode : undefined,
  );

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

    // 변환은 지도가 아니라 투영 객체가 쥐고 있다.
    const projection = typeof map.getProjection === "function" ? map.getProjection() : null;
    if (
      projection &&
      typeof projection.coordsFromContainerPoint === "function" &&
      typeof maps.Point === "function"
    ) {
      const southWest = projection.coordsFromContainerPoint(
        new maps.Point(rect.left, rect.bottom),
      );
      const northEast = projection.coordsFromContainerPoint(new maps.Point(rect.right, rect.top));
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

  /**
   * 누가 움직였고 언제 끝났는지를 가리는 곳 (#48).
   *
   * 한 번만 만들고 화면이 다시 그려져도 같은 것을 쓴다 — 매 렌더 새로 만들면 예약해
   * 둔 재조회와 억제 상태가 함께 버려져, 미는 동안에는 영영 잦아들지 않는다.
   */
  const [gestures] = useState(() =>
    createMapGestureTracker({
      onSettled: () => {
        const bounds = visibleBounds();
        // 경계를 못 구하면 조회하지 않는다 — 지어낸 범위로 목록을 바꾸지 않는다.
        if (!bounds) return;
        autoRefreshRef.current(bounds);
      },
    }),
  );

  /** 지도를 프로그램으로 옮긴다 — 그 사이에 오는 이벤트는 사용자의 것이 아니다. */
  const moveProgrammatically = useCallback(
    (move: () => void) => gestures.runProgrammatic(move),
    [gestures],
  );

  // 떠난 화면이 뒤늦게 목록을 바꾸지 않게, 예약된 재조회는 언마운트 때 버린다.
  useEffect(() => () => gestures.cancel(), [gestures]);

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

        const initial = initialRef.current;
        const applyInitialView = () => {
          if (initial.viewport) {
            // 상세에서 뒤로 온 경우 — 떠날 때 보던 자리를 그대로 되살린다 (U6).
            map.setCenter(new maps.LatLng(initial.viewport.lat, initial.viewport.lng));
            map.setLevel(initial.viewport.level);
          } else if (initial.bounds) {
            // 조회 범위가 곧 사용자가 본 범위다 — 시트에 가리지 않는 쪽에 그대로 앉힌다.
            map.setBounds(
              toKakaoBounds(maps, initial.bounds),
              EDGE_PADDING,
              EDGE_PADDING,
              currentSheetCover(),
              EDGE_PADDING,
            );
          } else {
            // 시트에 가리지 않는 위쪽 영역에 강원도가 들어오게 맞춘다.
            map.setBounds(
              toKakaoBounds(maps, GANGWON_BOUNDS),
              EDGE_PADDING,
              EDGE_PADDING,
              currentSheetCover(),
              EDGE_PADDING,
            );
          }
        };
        applyInitialView();

        /*
         * 컨테이너 크기가 확정되기 전에 지도가 자리를 잡으면 되살린 위치가 몇 픽셀
         * 어긋난다 — 지도는 처음 잰 크기로 중심을 계산해 두고, 그 뒤 컨테이너가
         * 자라도 다시 재지 않는다. 레이아웃이 끝난 다음 프레임에 한 번만 다시 맞춘다.
         * 이때 오는 지도 이벤트는 사용자의 몸짓이 아니므로 세지 않는다.
         */
        window.requestAnimationFrame(() => {
          if (cancelled) return;
          moveProgrammatically(() => {
            map.relayout();
            applyInitialView();
          });
        });

        /*
         * 사용자가 지도를 움직였다 (#48).
         *
         * 자리(`c`·`z`)는 **곧바로** 적는다 — 조회를 다시 돌리지 않는 값이라 싸고,
         * 민 직후에 카드를 눌러 상세로 떠나도 돌아올 자리가 남는다. 조회 범위는
         * 그렇지 않다: 미는 도중마다 부르면 조회가 손가락을 따라다니므로, 손이
         * 멎은 뒤에 한 번만 부르게 추적기에 맡긴다.
         */
        const onUserMove = () => {
          if (!gestures.handleMapEvent()) return;
          const center = map.getCenter();
          viewportChangeRef.current({
            lat: center.getLat(),
            lng: center.getLng(),
            level: map.getLevel(),
          });
        };
        maps.event.addListener(map, "dragend", onUserMove);
        maps.event.addListener(map, "zoom_changed", onUserMove);

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
  }, [appKey, gestures, moveProgrammatically]);

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
   * 주소의 자리가 **밖에서** 바뀌면 지도가 그리로 따라간다 (U6 · #48).
   *
   * 뒤로가기가 옛 주소를 되살리면 목록은 그 범위로 돌아가는데 지도는 그대로 남아,
   * 화면 둘이 서로 다른 범위를 말한다. 지도가 움직인 것은 이제 곧 조회 범위이므로
   * 어긋남이 그만큼 더 크게 드러난다.
   *
   * 사용자가 민 직후에는 주소가 지도를 따라 적히므로 둘이 같다 — 그때는 움직이지
   * 않는다. 이 구분이 없으면 지도와 주소가 서로를 밀어 무한히 오간다.
   */
  useEffect(() => {
    const map = mapRef.current;
    const maps = typeof window !== "undefined" ? window.kakao?.maps : undefined;
    if (!map || !maps || loadState !== "READY" || !urlViewport) return;

    const center = map.getCenter();
    const showing = { lat: center.getLat(), lng: center.getLng(), level: map.getLevel() };
    if (isSameViewport(showing, urlViewport)) return;

    moveProgrammatically(() => {
      map.setCenter(new maps.LatLng(urlViewport.lat, urlViewport.lng));
      map.setLevel(urlViewport.level);
    });
    // 객체가 매 렌더 새로 오므로 값만 본다 — 같은 자리에 효과가 다시 돌지 않게.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlViewport?.lat, urlViewport?.lng, urlViewport?.level, loadState, moveProgrammatically]);

  /**
   * 시·군을 새로 고르면 지도가 그리로 간다.
   *
   * 목록만 바뀌고 지도가 강원 전체에 머물면, 고른 시·군이 어디인지 지도에서 알 수 없다.
   * 한 번 맞춘 시·군은 다시 맞추지 않는다 — 사용자가 그 뒤에 직접 옮긴 화면을
   * 목록이 갱신될 때마다 되돌리지 않기 위해서다.
   *
   * 이 이동은 **목록을 다시 부르지 않는다** (#48). 시·군을 고른 순간 이미 그 시·군으로
   * 한 번 조회했고, 여기서 만들어진 경계로 또 부르면 방금 고른 시·군이 자기가 만든
   * 지도 범위에 덮여 칩이 `이 지도 범위` 로 바뀐다. 대신 옮겨 간 자리만 한 번 적어
   * 둔다 — 그래야 새로고침·뒤로가 그 시·군을 보던 축척으로 돌아온다 (U6).
   */
  useEffect(() => {
    const map = mapRef.current;
    const maps = typeof window !== "undefined" ? window.kakao?.maps : undefined;
    if (!map || !maps || loadState !== "READY") return;
    if (fittedRegionRef.current === regionCode) return;

    if (regionCode === null) {
      // 강원 전체로 되돌린 것뿐이다 — 보던 자리를 빼앗지 않는다.
      fittedRegionRef.current = null;
      return;
    }

    const focus = boundsOfPoints(
      places
        .filter((place) => place.coordinates !== null)
        .map((place) => ({
          lat: place.coordinates!.latitude,
          lng: place.coordinates!.longitude,
        })),
    );
    // 좌표가 하나도 없으면 경계를 지어내지 않는다. 다음 갱신을 기다린다.
    if (!focus) return;

    moveProgrammatically(() => {
      map.setBounds(
        toKakaoBounds(maps, focus),
        EDGE_PADDING,
        EDGE_PADDING,
        currentSheetCover(),
        EDGE_PADDING,
      );
      const center = map.getCenter();
      viewportChangeRef.current({
        lat: center.getLat(),
        lng: center.getLng(),
        level: map.getLevel(),
      });
    });
    fittedRegionRef.current = regionCode;
  }, [places, regionCode, loadState, moveProgrammatically]);

  return (
    <div className="absolute inset-0">
      {/*
        지도 위에 더 이상 떠 있는 것이 없다 (#48). 범위를 확정하던 버튼은 사라졌고,
        바뀌었다는 사실은 시트 헤더의 `N곳` 이 말한다 — 지도 면적을 돌려준 쪽이
        `무엇을 눌러야 하나` 를 하나 줄인다.
      */}
      <div ref={containerRef} className="h-full w-full" aria-label="강원 관광지 지도" role="application" />
    </div>
  );
}
