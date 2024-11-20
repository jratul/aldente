"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Review } from "@models/review";

interface Props {
  review: Review;
}

export default function ReviewItem({ review }: Props) {
  const router = useRouter();

  return (
    <div className="my-2 cursor-pointer bg-white py-4">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {/* <div className="h-12 w-12 rounded-full">
            <img
              src={
                feed.userImage ??
                "https://cdn4.iconfinder.com/data/icons/music-ui-solid-24px/24/user_account_profile-2-64.png"
              }
              alt="userImage"
              width={48}
              height={48}
            />
          </div> */}
          <div>{review.uid}</div>
        </div>
        <div className="flex items-center">
          <div className="flex flex-col items-end text-sm text-gray-500">
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
        <div className="absolute bottom-3 p-5">
          <div className="mb-2 text-lg font-bold text-white md:text-2xl whitespace-pre-wrap">
            {JSON.parse(review.content).split("\n")[0]}
          </div>
          <div className="whitespace-pre-wrap text-sm text-white md:text-base">
            {JSON.parse(review.content)}
          </div>
        </div>
      </div>
      <div className="flex justify-between p-3">
        <div className="flex flex-col">
          <div className="text-2xl font-bold">{review.restaurant.name}</div>
          <div className="flex items-center gap-1 align-text-top">
            <img
              src="https://cdn1.iconfinder.com/data/icons/christmas-yellow/60/019_-_Star-64.png"
              width={15}
              height={15}
            />
            {review.rating}
          </div>
          <div>
            {review.restaurant.category} · {review.restaurant.address}
          </div>
        </div>
      </div>
    </div>
  );
}
