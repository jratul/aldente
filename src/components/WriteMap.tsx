"use client";

import { useEffect, useState } from "react";
import { Map, MapMarker, MarkerClusterer } from "react-kakao-maps-sdk";
import useKakaoLoader from "@hooks/useKakaoLoader";
import { Place } from "@models/place";
import PlaceSearch from "./PlaceSearch";

interface Props {
  setSelectedPlaceAction: (selectedPlace: Place) => void;
}

export default function WriteMap({
  setSelectedPlaceAction: setSelectedPlace,
}: Props) {
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

    ps.keywordSearch(
      searchText,
      (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
          const bounds = new kakao.maps.LatLngBounds();
          const places: Place[] = [];

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
            // @ts-expect-error: This is expected to throw a type error
            bounds.extend(new kakao.maps.LatLng(result[i].y, result[i].x));
          }
          setPlaces(places);

          map.setBounds(bounds);
        }
      },
      {
        category_group_code: ["FD6", "CE7"],
      },
    );
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        setPos({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, []);

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 my-4 gap-4">
      <div className="col-span-1 h-48 md:h-96">
        <Map
          id="map"
          center={pos}
          level={level}
          className="w-full h-48 md:h-96"
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
                image={{
                  src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                  size: {
                    width: 24,
                    height: 35,
                  },
                }}
                onClick={() => {
                  setSelectedPlace(place);
                }}
              />
            ))}
          </MarkerClusterer>
        </Map>
      </div>
      <div className="bg-white col-span-1 h-48 md:h-96 m-2">
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
          setSelectedPlace={setSelectedPlace}
        />
      </div>
    </div>
  );
}
