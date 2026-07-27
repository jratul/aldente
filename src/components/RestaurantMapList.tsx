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
}

export default function RestaurantMapList({
  restaurants,
  search,
  setSearch,
  category,
  setCategory,
  onSelect,
}: Props) {
  return (
    <div className="flex h-full flex-col">
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
      <div className="flex-1 overflow-y-auto p-2">
        {restaurants.length === 0 ? (
          <EmptySign label="일치하는 식당이 없어요" />
        ) : (
          restaurants.map(
            ({ reviewId, restaurant, foodCategory, rating, image }) => (
              <button
                key={reviewId}
                type="button"
                onClick={() => onSelect(reviewId)}
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-gray-50"
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
            ),
          )
        )}
      </div>
    </div>
  );
}
