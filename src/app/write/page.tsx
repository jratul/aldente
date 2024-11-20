"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import ImageUpload from "@components/ImageUpload";
import KakaoMap from "@components/KakaoMap";
import RatingInput from "@components/RatingInput";
import PlaceCard from "@components/PlaceCard";
import Button from "@components/Button";
import { Place } from "@models/place";
import useAlertStore from "@hooks/useAlertStore";
import { useWriteReview } from "@queries/useWriteReview";

function WritePage() {
  const [rating, setRating] = useState<number>(5);
  const [step, setStep] = useState<number>(0);
  const [selectedPlace, setSelectedPlace] = useState<Place>();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { openAlert } = useAlertStore();

  const {
    mutate: writeReview,
    isPending,
    isError,
    isSuccess,
  } = useWriteReview();

  const handleSubmit = () => {
    if (
      !selectedPlace ||
      imageFiles.length === 0 ||
      !contentRef?.current?.value
    ) {
      openAlert({
        title: "잠시만요!",
        content: (
          <>
            아직 <span className="text-blue-500">리뷰</span>가 완성되지 않았어요
          </>
        ),
      });

      return;
    }

    console.log(contentRef?.current?.value);
    console.log(contentRef?.current?.value?.replaceAll("<br>", "\r\n"));

    writeReview({
      rating,
      imageFiles,
      content: JSON.stringify(
        contentRef?.current?.value?.replaceAll("<br>", "\r\n") ?? "",
      ),
      restaurant: {
        name: selectedPlace.place_name,
        pos: {
          lat: selectedPlace.pos.lat,
          lng: selectedPlace.pos.lng,
        },
        address: selectedPlace.address_name,
        roadAddress: selectedPlace.road_address_name,
        category: selectedPlace.category_name,
      },
    });
  };

  if (isPending) {
    return <>전송 중입니다</>;
  }

  if (isSuccess) {
    return <>리뷰 업데이트가 완료됐어요</>;
  }

  if (isError) {
    return <>리뷰 업데이트에 실패했어요</>;
  }

  return (
    <div>
      <div className="font-bold text-xl md:text-2xl mb-4">
        당신의 경험을 공유하세요
      </div>
      <div
        className={clsx(
          step === 0 && "slide-in-top",
          step === 1 && "slide-out-top",
        )}
      >
        <KakaoMap setSelectedPlaceAction={setSelectedPlace} />
      </div>
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
      <div
        className={clsx(
          step === 0 && "slide-out-bottom",
          step === 1 && "slide-in-bottom",
        )}
      >
        <RatingInput rating={rating} setRating={setRating} />
        <ImageUpload files={imageFiles} setFilesAction={setImageFiles} />
        <div className="flex justify-center">
          <textarea
            className="w-full h-48 p-4 m-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="무엇을 공유할까요?"
            ref={contentRef}
          />
        </div>
        <div className="m-2">
          <Button handleClick={handleSubmit}>작성을 마쳤어요</Button>
        </div>
      </div>
    </div>
  );
}

export default WritePage;
