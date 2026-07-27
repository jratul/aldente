import clsx from "clsx";
import { FOOD_CATEGORIES, FoodCategory } from "@constants/foodCategories";

interface Props {
  value?: FoodCategory;
  onChange: (category: FoodCategory) => void;
}

export default function CategorySelect({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 p-4">
      {FOOD_CATEGORIES.map(category => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={clsx(
            "px-3 py-1 rounded-full border text-sm",
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
