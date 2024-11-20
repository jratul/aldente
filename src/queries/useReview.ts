import { useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

const fetchReviews = async ({ pageParam }: { pageParam?: string }) => {
  const url = pageParam
    ? `/api/review?lastVisible=${pageParam}`
    : `/api/review`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch reviews");
  }

  return response.json();
};

export function useReview() {
  const {
    data,
    hasNextPage = false,
    fetchNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ["review"],
    queryFn: fetchReviews,
    getNextPageParam: lastPage => lastPage.lastVisible || undefined,
    initialPageParam: undefined,
  });

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetching) {
      return;
    }

    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetching]);

  const reviews = data?.pages.map(({ items }) => items).flat();

  return {
    data: reviews,
    loadMore,
    isFetching,
    hasNextPage,
  };
}
