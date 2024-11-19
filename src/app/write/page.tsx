"use client";

import { useState } from "react";
import ImageUpload from "@components/ImageUpload";
import KakaoMap from "@components/KakaoMap";
import RatingInput from "@components/RatingInput";
import { Place } from "@models/place";
import PlaceCard from "@components/PlaceCard";
import Button from "@components/Button";
import SlideDown from "@components/SlideDown";

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
  const [step, setStep] = useState<number>(0);
  const [selectedPlace, setSelectedPlace] = useState<Place>();

  return (
    <div>
      <div className="font-bold text-xl md:text-2xl mb-4">
        당신의 경험을 공유하세요
      </div>
      <SlideDown open={step === 0}>
        <KakaoMap setSelectedPlaceAction={setSelectedPlace} />
      </SlideDown>
      {step === 1 && selectedPlace && (
        <div className="m-2">
          <Button handleClick={() => setStep(0)}>다른 장소에요</Button>
        </div>
      )}
      {selectedPlace && (
        <>
          <PlaceCard place={selectedPlace} />
        </>
      )}
      {step === 0 && selectedPlace && (
        <div className="m-2">
          <Button handleClick={() => setStep(1)}>리뷰 쓸게요</Button>
        </div>
      )}
      <SlideDown open={step === 1}>
        <RatingInput rating={rating} setRating={setRating} />
        <ImageUpload />
      </SlideDown>
    </div>
  );
}

export default WritePage;
