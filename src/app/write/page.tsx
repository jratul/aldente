"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import ImageUpload from "@components/ImageUpload";
import WriteMap from "@components/WriteMap";
import RatingInput from "@components/RatingInput";
import PlaceCard from "@components/PlaceCard";
import Button from "@components/Button";
import { Place } from "@models/place";
import useAlertStore from "@hooks/useAlertStore";
import useWriteReview from "@queries/useWriteReview";
import TextField from "@components/TextField";
import Loading from "@app/loading";

export default function WritePage() {
  const router = useRouter();
  const [rating, setRating] = useState<number>(5);
  const [step, setStep] = useState<number>(0);
  const [selectedPlace, setSelectedPlace] = useState<Place>();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [title, setTitle] = useState<string>("");
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { openAlert } = useAlertStore();

  const { mutate: writeReview, isPending, isSuccess } = useWriteReview();

  const handleSubmit = () => {
    if (
      !(
        selectedPlace &&
        imageFiles.length > 0 &&
        title &&
        contentRef?.current?.value
      )
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

    writeReview({
      rating,
      imageFiles,
      title,
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
        placeUrl: selectedPlace.place_url,
      },
    });
  };

  if (isPending) {
    return <Loading />;
  }

  if (isSuccess) {
    router.push("/");
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
        <WriteMap setSelectedPlaceAction={setSelectedPlace} />
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
          <Button handleClick={() => setStep(1)} disabled={!selectedPlace}>
            {selectedPlace ? "리뷰 쓸게요" : "식당을 선택해 주세요"}
          </Button>
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
        <TextField
          placeholder="당신의 경험을 한 줄로 표현해 주세요."
          value={title}
          handleChange={setTitle}
          className="px-2"
        />
        <div className="flex justify-center">
          <textarea
            className="w-full h-48 p-3 m-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
