"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CustomOverlayMap,
  Map,
  MapMarker,
  MarkerClusterer,
} from "react-kakao-maps-sdk";
import useKakaoLoader from "@hooks/useKakaoLoader";
import useRestaurantMap from "@queries/useRestaurantMap";
import { FoodCategory } from "@constants/foodCategories";
import { RestaurantMapItem } from "@models/review";
import RestaurantMapList from "./RestaurantMapList";
import EmptySign from "./EmptySign";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
const DEFAULT_LEVEL = 7;
// MarkerClusterer의 minLevel과 맞춘 값. 이 레벨 미만(더 확대된 상태)에서는 마커가
// 클러스터로 뭉치지 않으므로 그때만 이름/평점 라벨을 보여준다 — 클러스터로 뭉친
// 상태에서 라벨까지 같이 켜두면 겹쳐서 지저분해진다.
const CLUSTER_MIN_LEVEL = 6;
const MAP_STATE_KEY = "aldente:mapState";
// 지도에서 리뷰로 이동할 때만 세운다 — 이 플래그가 있을 때만 저장된 지도 상태를 복원하고,
// 소비 즉시 지운다. 그래야 nav의 "지도" 링크로 새로 들어오거나 새로고침했을 때는 항상
// 전체 핀이 보이도록 fit-bounds가 되고, 리뷰에서 뒤로 돌아왔을 때만 이전 상태가 복원된다.
const RETURN_FLAG_KEY = "aldente:mapPendingReturn";

interface MapState {
  lat: number;
  lng: number;
  level: number;
  category?: FoodCategory;
  search: string;
}

function readMapState(): MapState | null {
  try {
    const raw = sessionStorage.getItem(MAP_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeMapState(state: MapState) {
  try {
    sessionStorage.setItem(MAP_STATE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage 접근 불가 환경(시크릿 모드 등)은 그냥 무시한다
  }
}

function armReturnFlag() {
  try {
    sessionStorage.setItem(RETURN_FLAG_KEY, "1");
  } catch {
    // 무시
  }
}

function consumeReturnFlag(): boolean {
  try {
    const pending = sessionStorage.getItem(RETURN_FLAG_KEY);
    if (!pending) return false;
    sessionStorage.removeItem(RETURN_FLAG_KEY);
    return true;
  } catch {
    return false;
  }
}

// 사이드바가 붙은 flex 레이아웃 안에서 지도가 생성되는 시점에는 컨테이너가 아직
// 최종 크기로 자리잡기 전일 수 있다. relayout() 없이 setBounds를 부르면 Kakao가
// 그 순간의(잘못된) 컨테이너 크기 기준으로 줌 레벨을 계산해버려 "전체 핀 보기"가
// 어긋난다 — 그래서 항상 relayout()을 먼저 호출한다.
function fitBoundsToList(map: kakao.maps.Map, list: RestaurantMapItem[]) {
  if (list.length === 0) return;
  map.relayout();
  const bounds = new kakao.maps.LatLngBounds();
  list.forEach(({ restaurant }) => {
    bounds.extend(
      new kakao.maps.LatLng(restaurant.pos.lat, restaurant.pos.lng),
    );
  });
  map.setBounds(bounds);
}

export default function AllRestaurantsMap() {
  useKakaoLoader();
  const router = useRouter();
  const { restaurants } = useRestaurantMap();

  const mapRef = useRef<kakao.maps.Map | null>(null);
  const [category, setCategory] = useState<FoodCategory>();
  const [search, setSearch] = useState("");
  const [mobileListOpen, setMobileListOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_LEVEL);

  const filteredRestaurants = useMemo(
    () =>
      restaurants.filter(
        ({ restaurant, foodCategory }) =>
          (!category || foodCategory === category) &&
          (!search || restaurant.name.includes(search)),
      ),
    [restaurants, category, search],
  );

  const persistState = (map: kakao.maps.Map, next?: Partial<MapState>) => {
    const center = map.getCenter();
    writeMapState({
      lat: center.getLat(),
      lng: center.getLng(),
      level: map.getLevel(),
      category,
      search,
      ...next,
    });
  };

  // onCreate는 react-kakao-maps-sdk 내부에서 [map, onCreate]에 의존하는 이펙트로 호출된다.
  // 매 렌더마다 새 함수를 넘기면 검색/필터 등 무관한 상태가 바뀔 때마다 재호출되어
  // 지도 상태(bounds-fit, 복원)를 계속 덮어써버리므로 useCallback으로 참조를 고정한다.
  const handleCreate = useCallback(
    (map: kakao.maps.Map) => {
      mapRef.current = map;

      const saved = consumeReturnFlag() ? readMapState() : null;
      if (saved) {
        map.relayout();
        map.setCenter(new kakao.maps.LatLng(saved.lat, saved.lng));
        map.setLevel(saved.level);
        setCategory(saved.category);
        setSearch(saved.search);
        return;
      }

      // 사이드바 flex 레이아웃이 자리잡는 다음 프레임까지 한 틱 미뤄서
      // relayout()이 최종 컨테이너 크기를 보고 계산하게 한다.
      requestAnimationFrame(() => fitBoundsToList(map, restaurants));
    },
    [restaurants],
  );

  const handleIdle = (map: kakao.maps.Map) => {
    persistState(map);
    setZoomLevel(map.getLevel());
  };

  const handleCategoryChange = (next?: FoodCategory) => {
    setCategory(next);
    if (mapRef.current) {
      persistState(mapRef.current, { category: next });
    }
  };

  const handleSearchChange = (next: string) => {
    setSearch(next);
    if (mapRef.current) {
      persistState(mapRef.current, { search: next });
    }
  };

  const handleSelect = (reviewId: string) => {
    if (mapRef.current) {
      persistState(mapRef.current);
    }
    armReturnFlag();
    setMobileListOpen(false);
    router.push(`/review/${reviewId}`);
  };

  const handleLocate = (pos: { lat: number; lng: number }) => {
    if (!mapRef.current) return;
    mapRef.current.relayout();
    mapRef.current.setCenter(new kakao.maps.LatLng(pos.lat, pos.lng));
    mapRef.current.setLevel(3);
    setMobileListOpen(false);
  };

  const handleFitAll = () => {
    if (mapRef.current) {
      fitBoundsToList(mapRef.current, filteredRestaurants);
    }
  };

  const handleMarkerClick = (placeUrl: string) => {
    window.open(placeUrl, "_blank", "noopener,noreferrer");
  };

  if (restaurants.length === 0) {
    return (
      <div className="w-full h-[70vh]">
        <EmptySign label="아직 등록된 식당이 없어요" />
      </div>
    );
  }

  return (
    <div className="relative left-1/2 flex h-[70vh] w-screen -translate-x-1/2 gap-4 px-4 md:px-6">
      <div className="hidden w-96 shrink-0 overflow-hidden rounded-2xl bg-white shadow-md md:flex">
        <RestaurantMapList
          restaurants={filteredRestaurants}
          search={search}
          setSearch={handleSearchChange}
          category={category}
          setCategory={handleCategoryChange}
          onSelect={handleSelect}
          onLocate={handleLocate}
        />
      </div>

      <button
        type="button"
        aria-label="식당 목록 열기"
        onClick={() => setMobileListOpen(true)}
        className="absolute top-4 left-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md md:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          width={18}
          height={18}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {mobileListOpen && (
        <div className="absolute inset-0 z-20 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileListOpen(false)}
          />
          <div className="relative flex h-full w-80 flex-col bg-white shadow-xl">
            <button
              type="button"
              aria-label="식당 목록 닫기"
              onClick={() => setMobileListOpen(false)}
              className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
            >
              <svg
                viewBox="0 0 24 24"
                width={16}
                height={16}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <RestaurantMapList
              restaurants={filteredRestaurants}
              search={search}
              setSearch={handleSearchChange}
              category={category}
              setCategory={handleCategoryChange}
              onSelect={handleSelect}
              onLocate={handleLocate}
            />
          </div>
        </div>
      )}

      <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl shadow-md">
        <button
          type="button"
          aria-label="전체 식당이 보이도록 지도 맞추기"
          title="전체 보기"
          onClick={handleFitAll}
          className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50"
        >
          <svg
            viewBox="0 0 24 24"
            width={18}
            height={18}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 3.75H5.25a1.5 1.5 0 0 0-1.5 1.5V9m15-5.25h-3.75m3.75 0V9m0 6v3.75a1.5 1.5 0 0 1-1.5 1.5H15m-6 0H5.25a1.5 1.5 0 0 1-1.5-1.5V15"
            />
          </svg>
        </button>

        <Map
          center={DEFAULT_CENTER}
          level={DEFAULT_LEVEL}
          className="w-full h-full"
          onCreate={handleCreate}
          onIdle={handleIdle}
        >
          <MarkerClusterer averageCenter minLevel={CLUSTER_MIN_LEVEL}>
            {filteredRestaurants.map(
              ({ reviewId, restaurant, foodCategory }) => (
                <MapMarker
                  key={reviewId}
                  position={restaurant.pos}
                  title={
                    foodCategory
                      ? `${restaurant.name} · ${foodCategory}`
                      : restaurant.name
                  }
                  onClick={() => handleMarkerClick(restaurant.placeUrl)}
                />
              ),
            )}
          </MarkerClusterer>
          {zoomLevel < CLUSTER_MIN_LEVEL &&
            filteredRestaurants.map(({ reviewId, restaurant, rating }) => (
              <CustomOverlayMap
                key={reviewId}
                position={restaurant.pos}
                yAnchor={0}
              >
                <div className="pointer-events-none mt-1 flex flex-col items-center whitespace-nowrap rounded-md bg-white px-2 py-1 text-center shadow-md ring-1 ring-black/5">
                  <span className="text-xs font-bold text-gray-900">
                    {restaurant.name}
                  </span>
                  <span className="text-xs font-semibold text-amber-500">
                    ⭐ {rating}
                  </span>
                </div>
              </CustomOverlayMap>
            ))}
        </Map>
      </div>
    </div>
  );
}
