"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Map, MapMarker, MarkerClusterer } from "react-kakao-maps-sdk";
import useKakaoLoader from "@hooks/useKakaoLoader";
import useRestaurantMap from "@queries/useRestaurantMap";
import { FoodCategory } from "@constants/foodCategories";
import RestaurantMapList from "./RestaurantMapList";
import EmptySign from "./EmptySign";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
const MAP_STATE_KEY = "aldente:mapState";

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

export default function AllRestaurantsMap() {
  useKakaoLoader();
  const router = useRouter();
  const { restaurants } = useRestaurantMap();

  const mapRef = useRef<kakao.maps.Map | null>(null);
  const [category, setCategory] = useState<FoodCategory>();
  const [search, setSearch] = useState("");
  const [mobileListOpen, setMobileListOpen] = useState(false);

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

      const saved = readMapState();
      if (saved) {
        map.setCenter(new kakao.maps.LatLng(saved.lat, saved.lng));
        map.setLevel(saved.level);
        setCategory(saved.category);
        setSearch(saved.search);
        return;
      }

      if (restaurants.length === 0) {
        return;
      }

      const bounds = new kakao.maps.LatLngBounds();
      restaurants.forEach(({ restaurant }) => {
        bounds.extend(
          new kakao.maps.LatLng(restaurant.pos.lat, restaurant.pos.lng),
        );
      });
      map.setBounds(bounds);
    },
    [restaurants],
  );

  const handleIdle = (map: kakao.maps.Map) => {
    persistState(map);
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
    setMobileListOpen(false);
    router.push(`/review/${reviewId}`);
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
    <div className="relative flex h-[70vh] gap-2">
      <div className="hidden w-64 shrink-0 overflow-hidden rounded border md:flex">
        <RestaurantMapList
          restaurants={filteredRestaurants}
          search={search}
          setSearch={handleSearchChange}
          category={category}
          setCategory={handleCategoryChange}
          onSelect={handleSelect}
        />
      </div>

      <button
        type="button"
        aria-label="식당 목록 열기"
        onClick={() => setMobileListOpen(true)}
        className="absolute top-2 left-2 z-10 flex h-9 w-9 items-center justify-center rounded bg-white shadow md:hidden"
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
          <div className="relative flex h-full w-72 flex-col bg-white shadow-lg">
            <button
              type="button"
              aria-label="식당 목록 닫기"
              onClick={() => setMobileListOpen(false)}
              className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100"
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
            />
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <Map
          center={DEFAULT_CENTER}
          level={7}
          className="w-full h-full"
          onCreate={handleCreate}
          onIdle={handleIdle}
        >
          <MarkerClusterer averageCenter minLevel={6}>
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
        </Map>
      </div>
    </div>
  );
}
