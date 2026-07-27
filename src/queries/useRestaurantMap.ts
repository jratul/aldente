import { useSuspenseQuery } from "@tanstack/react-query";
import { RestaurantMapItem } from "@models/review";

export const restaurantMapQueryKey = ["restaurants", "map"];

export async function fetchRestaurants(): Promise<RestaurantMapItem[]> {
  const baseUrl =
    typeof window === "undefined"
      ? (process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000")
      : "";

  const response = await fetch(`${baseUrl}/api/review/restaurants`);
  if (!response.ok) {
    throw new Error("Failed to fetch restaurants");
  }

  return response.json();
}

function useRestaurantMap() {
  const { data } = useSuspenseQuery({
    queryKey: restaurantMapQueryKey,
    queryFn: fetchRestaurants,
    staleTime: 1000 * 60 * 5,
  });

  return { restaurants: data };
}

export default useRestaurantMap;
