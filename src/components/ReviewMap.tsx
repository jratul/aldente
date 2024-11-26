"use client";

// import Script from "next/script";
import { Map, MapMarker } from "react-kakao-maps-sdk";
// import useKakaoLoader from "@hooks/useKakaoLoader";
import { useKakaoLoader } from "react-kakao-maps-sdk";
import { Review } from "@models/review";

type Pos = Review["restaurant"]["pos"];

interface Props {
  pos: Pos;
  placeUrl: string;
}

export default function ReviewMap({ pos, placeUrl }: Props) {
  useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY ?? "",
    libraries: ["clusterer", "drawing", "services"],
  });

  const handleClick = () => {
    window.open(placeUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full h-48 md:h-96">
      {/* <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY}&libraries=clusterer,drawing,services&autoload=false`}
        strategy="beforeInteractive"
        onError={(e: Error) => {
          console.error("Script failed to load", e);
        }}
      /> */}
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
