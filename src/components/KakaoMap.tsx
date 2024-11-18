"use client";

import { useState } from "react";
import {
  CustomOverlayMap,
  Map,
  MapMarker,
  MarkerClusterer,
} from "react-kakao-maps-sdk";
import useKakaoLoader from "@hooks/useKakaoLoader";
import { Place } from "@models/place";
import PlaceSearch from "./PlaceSearch";
import MapOverlay from "./MapOverlay";
// import MapOverlay from "./MapOverlay";

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMap() {
  useKakaoLoader();

  const [map, setMap] = useState<kakao.maps.Map>();
  const [pos, setPos] = useState<Place["pos"]>({
    lat: 33.450701,
    lng: 126.570667,
  });
  const [level, setLevel] = useState<number>(3);
  const [searchText, setSearchText] = useState<string>("");
  const [places, setPlaces] = useState<Place[]>([]);

  const handleSearch = () => {
    if (!searchText || !map) {
      setPlaces([]);
      return;
    }

    const ps = new kakao.maps.services.Places();

    ps.keywordSearch(searchText, (result, status, pagination) => {
      if (status === kakao.maps.services.Status.OK) {
        const bounds = new kakao.maps.LatLngBounds();
        let places: Place[] = [];

        console.log("data", result);

        for (let i = 0; i < result.length; i++) {
          places.push({
            address_name: result[i].address_name,
            category_name: result[i].category_name,
            category_group_name: result[i].category_group_name,
            place_name: result[i].place_name,
            road_address_name: result[i].road_address_name,
            pos: {
              lat: Number(result[i].y),
              lng: Number(result[i].x),
            },
            place_url: result[i].place_url,
          });
          // @ts-ignore
          bounds.extend(new kakao.maps.LatLng(result[i].y, result[i].x));
        }
        setPlaces(places);

        map.setBounds(bounds);
      }
    });
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 my-4 gap-4">
      <div className="col-span-1 h-96">
        <Map
          id="map"
          center={pos}
          level={level}
          className="w-full h-96"
          onCreate={map => setMap(map)}
        >
          <MarkerClusterer averageCenter={true} minLevel={5}>
            {places.map(place => (
              <MapMarker
                key={place.place_name}
                position={{
                  lat: place.pos.lat,
                  lng: place.pos.lng,
                }}
              />
            ))}
          </MarkerClusterer>
        </Map>
      </div>
      <div className="bg-white col-span-1 h-96">
        <PlaceSearch
          searchText={searchText}
          setSearchText={setSearchText}
          handleSearch={handleSearch}
          places={places}
          setPos={({ lat, lng }) => {
            setPos({ lat, lng });
            map?.setLevel(3);
            setLevel(3);
          }}
        />
      </div>
    </div>
  );
}
