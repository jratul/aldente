"use client";

import ImageUpload from "@components/ImageUpload";
import KakaoMap from "@components/KakaoMap";
import RatingInput from "@components/RatingInput";
import { useState } from "react";

const restaurantData = {
  name: "어슬청담",
  pos: {
    lat: 37.28759,
    lnt: 126.9916,
  },
  address: "경기 수원시 장안구 수성로 175 2층 2328호",
  category: "한식",
};

function WritePage() {
  const [rating, setRating] = useState<number>(5);

  return (
    <div>
      <div className="font-bold text-2xl mb-4">당신의 경험을 공유하세요</div>
      <KakaoMap />
      <RatingInput rating={rating} setRating={setRating} />
      <ImageUpload />
    </div>
  );
}

export default WritePage;
