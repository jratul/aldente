import Image from "next/image";
import { Review } from "@models/review";

export default function RestaurantCard({ review }: { review: Review }) {
  return (
    <div className="flex flex-col p-3">
      <div className="flex justify-between items-center gap-2">
        <div className="text-lg md:text-2xl font-bold w-1/2 break-keep">
          {review.restaurant.name}
        </div>
        <div className="text-blue-600 text-sm md:text-base">
          {review.restaurant.category}
        </div>
      </div>
      <div className="flex items-center gap-1 align-text-top">
        <Image
          src="https://cdn1.iconfinder.com/data/icons/christmas-yellow/60/019_-_Star-64.png"
          alt="별점"
          width={15}
          height={15}
          sizes="15px"
        />
        <div className="text-sm md:text-base">{review.rating}</div>
      </div>
      <div className="text-gray-600 text-sm md:text-base">
        {review.restaurant.roadAddress}
      </div>
    </div>
  );
}
