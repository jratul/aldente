"use client";

import { Map, MapMarker } from "react-kakao-maps-sdk";
import useKakaoLoader from "@hooks/useKakaoLoader";
import { Review } from "@models/review";

type Pos = Review["restaurant"]["pos"];

declare global {
  interface Window {
    kakao: any;
  }
}

interface Props {
  pos: Pos;
  placeUrl: string;
}

export default function ReviewMap({ pos, placeUrl }: Props) {
  useKakaoLoader();

  const handleClick = () => {
    window.open(placeUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full h-48 md:h-96">
      <Map center={pos} level={3} className="w-full h-48 md:h-96">
        <MapMarker
          position={{
            lat: pos.lat,
            lng: pos.lng,
          }}
          image={{
            src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
            size: {
              width: 24,
              height: 35,
            },
          }}
          onClick={handleClick}
        />
      </Map>
    </div>
  );
}
