import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import ReviewList from "@components/ReviewList";
import { fetchReviewList, reviewQueryKey } from "@queries/useReviewList";

export const dynamic = "force-dynamic";

export default async function Home() {
  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: reviewQueryKey,
    queryFn: fetchReviewList,
    initialPageParam: undefined,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReviewList />
    </HydrationBoundary>
  );
}
