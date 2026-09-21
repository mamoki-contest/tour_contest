/**
 * 카카오맵 SDK 로더 (브라우저 전용).
 *
 * 관광 데이터는 백엔드만 부르지만 지도 SDK는 브라우저가 직접 불러야 한다 — 그래서
 * JavaScript 키가 클라이언트에 노출된다. 이 키의 보호 장치는 비밀 유지가 아니라
 * 카카오 개발자 콘솔의 사이트 도메인 등록이다.
 */

declare global {
  interface Window {
    kakao?: KakaoNamespace;
  }
}

/** 이 화면이 실제로 쓰는 범위만 좁게 선언한다. SDK 전체 타입을 흉내 내지 않는다. */
export interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

export interface KakaoLatLngBounds {
  getSouthWest(): KakaoLatLng;
  getNorthEast(): KakaoLatLng;
  extend(latlng: KakaoLatLng): void;
}

/** 지도 컨테이너 안의 픽셀 좌표 — 시트가 가리는 만큼을 잘라낼 때 쓴다. */
export interface KakaoPoint {
  x: number;
  y: number;
}

/**
 * 컨테이너 픽셀 좌표와 위·경도 사이의 변환.
 *
 * `getBounds()` 는 컨테이너 전체를 말하므로 바텀시트가 덮은 아래쪽까지 포함한다.
 * 사용자가 실제로 본 범위만 조회하려면 이 변환이 필요하다. 변환은 지도가 아니라
 * **투영 객체**가 쥐고 있다 — `map.containerPointToLatLng` 같은 메서드는 없다.
 */
export interface KakaoProjection {
  coordsFromContainerPoint(point: KakaoPoint): KakaoLatLng;
}

export interface KakaoMap {
  getBounds(): KakaoLatLngBounds;
  getProjection(): KakaoProjection;
  /** 여백을 주면 그만큼 비워 두고 맞춘다 — 시트에 가리는 아래쪽을 피하는 데 쓴다. */
  setBounds(
    bounds: KakaoLatLngBounds,
    paddingTop?: number,
    paddingRight?: number,
    paddingBottom?: number,
    paddingLeft?: number,
  ): void;
  setCenter(latlng: KakaoLatLng): void;
  getCenter(): KakaoLatLng;
  getLevel(): number;
  setLevel(level: number): void;
  relayout(): void;
}

export interface KakaoMarker {
  setMap(map: KakaoMap | null): void;
}

export interface KakaoMapsApi {
  load(callback: () => void): void;
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMap;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  LatLngBounds: new () => KakaoLatLngBounds;
  Point: new (x: number, y: number) => KakaoPoint;
  Marker: new (options: { position: KakaoLatLng; title?: string }) => KakaoMarker;
  event: {
    addListener(target: KakaoMap, type: string, handler: () => void): void;
    removeListener(target: KakaoMap, type: string, handler: () => void): void;
  };
}

interface KakaoNamespace {
  maps: KakaoMapsApi;
}

const SDK_ELEMENT_ID = "kakao-maps-sdk";

let loadPromise: Promise<KakaoMapsApi> | null = null;

/**
 * SDK를 한 번만 싣는다. 키가 없거나 스크립트가 실패하면 거절해서, 호출부가 지도 실패
 * 상태로 떨어지게 한다 — 조용히 빈 지도를 남기지 않는다.
 */
export function loadKakaoMaps(appKey: string): Promise<KakaoMapsApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("브라우저에서만 부를 수 있어요."));
  }
  if (!appKey) {
    return Promise.reject(new Error("KAKAO_MAP_APP_KEY가 설정되지 않았습니다."));
  }
  if (window.kakao?.maps?.Map) {
    return Promise.resolve(window.kakao.maps);
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<KakaoMapsApi>((resolve, reject) => {
    const existing = document.getElementById(SDK_ELEMENT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");

    const onReady = () => {
      const maps = window.kakao?.maps;
      if (!maps) {
        reject(new Error("SDK를 불러왔지만 kakao.maps가 없습니다."));
        return;
      }
      // autoload=false로 실었으므로 여기서 명시적으로 초기화한다.
      maps.load(() => resolve(maps));
    };

    script.addEventListener("error", () =>
      reject(new Error("SDK 스크립트를 불러오지 못했습니다. 도메인 등록을 확인하세요.")),
    );
    script.addEventListener("load", onReady);

    if (!existing) {
      script.id = SDK_ELEMENT_ID;
      script.async = true;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false`;
      document.head.appendChild(script);
    } else if (window.kakao?.maps) {
      onReady();
    }
  });

  // 실패한 약속을 캐시에 남기면 다시 시도할 수 없다.
  loadPromise.catch(() => {
    loadPromise = null;
  });

  return loadPromise;
}
