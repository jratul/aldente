import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import AllRestaurantsMap from "@components/AllRestaurantsMap";
import {
  fetchRestaurants,
  restaurantMapQueryKey,
} from "@queries/useRestaurantMap";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: restaurantMapQueryKey,
    queryFn: fetchRestaurants,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AllRestaurantsMap />
    </HydrationBoundary>
  );
}
