"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Review } from "@models/review";
import { User } from "@models/user";
import RestaurantCard from "./RestaurantCard";

interface Props {
  review: Review & User;
}

export default function ReviewItem({ review }: Props) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/review/${review.id}`);
  };

  return (
    <div className="my-2 cursor-pointer bg-white py-2" onClick={handleClick}>
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <img
            src={
              review.photoURL ??
              "https://cdn4.iconfinder.com/data/icons/music-ui-solid-24px/24/user_account_profile-2-64.png"
            }
            alt="userImage"
            className="h-8 w-8 md:h-12 md:w-12 rounded-full"
          />
          <div>{review.displayName}</div>
        </div>
        <div className="flex items-center">
          <div className="flex flex-col items-end text-xs md:text-sm text-gray-500">
            <div>최근 방문일</div>
            <div>{format(review.date, "yyyy.MM.dd")}</div>
          </div>
        </div>
      </div>
      <div className="relative aspect-[4/3] w-full">
        <img
          src={review.images[0]}
          alt={review.restaurant.name}
          className="aspect-[4/3] w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-gray-800 opacity-80"
        />
        <div className="absolute bottom-2 p-5">
          <div className="mb-1 text-base font-bold text-white md:text-2xl whitespace-pre-wrap">
            "{JSON.parse(review.content).split("\n")[0]}"
          </div>
          <div className="whitespace-pre-wrap text-sm text-white md:text-base">
            {JSON.parse(review.content).split("\n")[1]}
          </div>
        </div>
      </div>
      <RestaurantCard review={review} />
    </div>
  );
}
