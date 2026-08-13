import Image from "next/image";
import TextField from "@components/shared/TextField";
import CategoryFilter from "./CategoryFilter";
import EmptySign from "./EmptySign";
import { RestaurantMapItem } from "@models/review";
import { FoodCategory } from "@constants/foodCategories";

interface Props {
  restaurants: RestaurantMapItem[];
  search: string;
  setSearch: (search: string) => void;
  category?: FoodCategory;
  setCategory: (category?: FoodCategory) => void;
  onSelect: (reviewId: string) => void;
  onLocate: (pos: { lat: number; lng: number }) => void;
}

export default function RestaurantMapList({
  restaurants,
  search,
  setSearch,
  category,
  setCategory,
  onSelect,
  onLocate,
}: Props) {
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <div className="p-4 pb-2">
        <TextField
          placeholder="식당 이름으로 검색"
          value={search}
          handleChange={setSearch}
        />
      </div>
      <div className="px-3">
        <CategoryFilter value={category} onChange={setCategory} />
      </div>
      <div className="min-w-0 flex-1 overflow-y-auto p-2">
        {restaurants.length === 0 ? (
          <EmptySign label="일치하는 식당이 없어요" />
        ) : (
          restaurants.map(
            ({ reviewId, restaurant, foodCategory, rating, image }) => (
              <div
                key={reviewId}
                className="flex items-center gap-1 rounded-xl transition-colors hover:bg-gray-50"
              >
                <button
                  type="button"
                  onClick={() => onSelect(reviewId)}
                  className="flex min-w-0 flex-1 items-center gap-3 p-2 text-left"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    <Image
                      src={image}
                      alt={restaurant.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">
                      {restaurant.name}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                      {foodCategory && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-600">
                          {foodCategory}
                        </span>
                      )}
                      <span>⭐ {rating}</span>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  aria-label={`${restaurant.name} 위치로 지도 이동`}
                  title="지도에서 위치 보기"
                  onClick={() => onLocate(restaurant.pos)}
                  className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-blue-500"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width={18}
                    height={18}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                    />
                  </svg>
                </button>
              </div>
            ),
          )
        )}
      </div>
    </div>
  );
}
