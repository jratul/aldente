export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { COLLECTIONS } from "@constants/collections";
import { getFirebaseStore } from "@utils/firebase";
import { RestaurantMapItem } from "@models/review";

export async function GET() {
  try {
    const reviewsSnapshot = await getDocs(
      collection(getFirebaseStore(), COLLECTIONS.REVIEWS),
    );

    const seen = new Set<string>();
    const restaurants: RestaurantMapItem[] = [];

    reviewsSnapshot.docs.forEach(docItem => {
      const data = docItem.data();
      const key = data.restaurant?.placeUrl;

      if (!key || seen.has(key)) {
        return;
      }
      seen.add(key);

      restaurants.push({
        reviewId: docItem.id,
        restaurant: data.restaurant,
        foodCategory: data.foodCategory,
      });
    });

    return NextResponse.json(restaurants);
  } catch (error) {
    console.error("Failed to fetch restaurants for map:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 },
    );
  }
}
