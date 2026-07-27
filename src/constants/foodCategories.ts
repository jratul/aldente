export const FOOD_CATEGORIES = [
  "한식",
  "중식",
  "일식",
  "양식",
  "카페",
  "분식",
  "디저트",
  "술집",
  "기타",
] as const;

export type FoodCategory = (typeof FOOD_CATEGORIES)[number];
