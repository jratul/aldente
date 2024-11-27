"use client";

import { useRouter } from "next/navigation";
import { Review } from "@models/review";
import { User } from "@models/user";
import RestaurantCard from "./RestaurantCard";
import UserCard from "./UserCard";

interface Props {
  review: Review & User;
}

export default function ReviewItem({ review }: Props) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/review/${review.id}`);
  };

  return (
    <div className="mb-2 cursor-pointer bg-white py-2" onClick={handleClick}>
      <UserCard
        photoURL={review.photoURL}
        displayName={review.displayName}
        date={review.date}
      />
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
            "{review.title}"
          </div>
          <div className="whitespace-pre-wrap text-sm text-white md:text-base">
            {JSON.parse(review.content).split("\n")[0]}
          </div>
        </div>
      </div>
      <RestaurantCard review={review} />
    </div>
  );
}
