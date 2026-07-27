"use client";

import { Map, MapMarker, MarkerClusterer } from "react-kakao-maps-sdk";
import useKakaoLoader from "@hooks/useKakaoLoader";
import useRestaurantMap from "@queries/useRestaurantMap";
import EmptySign from "./EmptySign";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

export default function AllRestaurantsMap() {
  useKakaoLoader();
  const { restaurants } = useRestaurantMap();

  if (restaurants.length === 0) {
    return (
      <div className="w-full h-[70vh]">
        <EmptySign label="아직 등록된 식당이 없어요" />
      </div>
    );
  }

  const handleCreate = (map: kakao.maps.Map) => {
    const bounds = new kakao.maps.LatLngBounds();
    restaurants.forEach(({ restaurant }) => {
      bounds.extend(
        new kakao.maps.LatLng(restaurant.pos.lat, restaurant.pos.lng),
      );
    });
    map.setBounds(bounds);
  };

  const handleMarkerClick = (placeUrl: string) => {
    window.open(placeUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full h-[70vh]">
      <Map
        center={DEFAULT_CENTER}
        level={7}
        className="w-full h-full"
        onCreate={handleCreate}
      >
        <MarkerClusterer averageCenter minLevel={6}>
          {restaurants.map(({ reviewId, restaurant, foodCategory }) => (
            <MapMarker
              key={reviewId}
              position={restaurant.pos}
              title={`${restaurant.name} · ${foodCategory}`}
              onClick={() => handleMarkerClick(restaurant.placeUrl)}
            />
          ))}
        </MarkerClusterer>
      </Map>
    </div>
  );
}
