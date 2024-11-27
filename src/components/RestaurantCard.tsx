import { Review } from "@models/review";

export default function RestaurantCard({ review }: { review: Review }) {
  return (
    <div className="flex flex-col p-3">
      <div className="flex justify-between items-center">
        <div className="text-lg md:text-2xl font-bold">
          {review.restaurant.name}
        </div>
        <div className="text-blue-500 text-sm md:text-base">
          {review.restaurant.category}
        </div>
      </div>
      <div className="flex items-center gap-1 align-text-top">
        <img
          src="https://cdn1.iconfinder.com/data/icons/christmas-yellow/60/019_-_Star-64.png"
          width={15}
          height={15}
        />
        <div className="text-sm md:text-base">{review.rating}</div>
      </div>
      <div className="text-gray-500 text-sm md:text-base">
        {review.restaurant.roadAddress}
      </div>
    </div>
  );
}
