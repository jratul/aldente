import clsx from "clsx";
import { FOOD_CATEGORIES, FoodCategory } from "@constants/foodCategories";

interface Props {
  value?: FoodCategory;
  onChange: (category?: FoodCategory) => void;
}

export default function CategoryFilter({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5 py-2">
      <button
        type="button"
        onClick={() => onChange(undefined)}
        className={clsx(
          "rounded-full px-3 py-1 text-xs font-medium transition-colors",
          !value
            ? "bg-blue-500 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200",
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
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            value === category
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200",
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
