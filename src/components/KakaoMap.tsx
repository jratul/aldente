"use client";

import { useEffect, useState } from "react";
import { Map } from "react-kakao-maps-sdk";
import useKakaoLoader from "@hooks/useKakaoLoader";

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMap() {
  useKakaoLoader();
  const [map, setMap] = useState<kakao.maps.Map>();
  const [pos, setPos] = useState<{ lat: number; lng: number }>({
    lat: 33.450701,
    lng: 126.570667,
  });
  const [level, setLevel] = useState<number>(3);

  return (
    <div className="w-full h-96 overflow-hidden relative my-4">
      <Map
        id="map"
        center={pos}
        level={level}
        className="w-full h-96"
        onCreate={map => setMap(map)}
      ></Map>
    </div>
  );
}
