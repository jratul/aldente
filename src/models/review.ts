import { FoodCategory } from "@constants/foodCategories";

export interface Review {
  id: string;
  uid: string;
  date: Date;
  rating: number;
  images: string[];
  imageFiles: File[];
  foodCategory: FoodCategory;
  title: string;
  content: string;
  restaurant: {
    name: string;
    pos: {
      lat: number;
      lng: number;
    };
    address: string;
    roadAddress: string;
    category: string;
    placeUrl: string;
  };
}

export interface RestaurantMapItem {
  reviewId: string;
  restaurant: Review["restaurant"];
  foodCategory: Review["foodCategory"];
  rating: Review["rating"];
  image: string;
}
