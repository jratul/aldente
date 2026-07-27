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
      <div className="px-2 pt-2">
        <TextField
          placeholder="식당 이름으로 검색"
          value={search}
          handleChange={setSearch}
        />
      </div>
      <CategoryFilter value={category} onChange={setCategory} />
      <div className="flex-1 overflow-y-auto border-t">
        {restaurants.length === 0 ? (
          <EmptySign label="일치하는 식당이 없어요" />
        ) : (
          restaurants.map(
            ({ reviewId, restaurant, foodCategory, rating, image }) => (
              <button
                key={reviewId}
                type="button"
                onClick={() => onSelect(reviewId)}
                className="flex w-full items-center gap-2 border-b p-2 text-left hover:bg-gray-50"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded">
                  <Image
                    src={image}
                    alt={restaurant.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">
                    {restaurant.name}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    {foodCategory && (
                      <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-blue-600">
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
