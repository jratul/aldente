import clsx from "clsx";
import { FOOD_CATEGORIES, FoodCategory } from "@constants/foodCategories";

interface Props {
  value?: FoodCategory;
  onChange: (category?: FoodCategory) => void;
}

export default function CategoryFilter({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5 p-2">
      <button
        type="button"
        onClick={() => onChange(undefined)}
        className={clsx(
          "px-2.5 py-1 rounded-full border text-xs",
          !value
            ? "bg-blue-500 text-white border-blue-500"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100",
        )}
      >
        전체
      </button>
      {FOOD_CATEGORIES.map(category => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(value === category ? undefined : category)}
          className={clsx(
            "px-2.5 py-1 rounded-full border text-xs",
            value === category
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100",
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
