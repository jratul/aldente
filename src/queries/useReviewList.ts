import { useCallback } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

export const reviewQueryKey = ["review"];

export async function fetchReviewList({ pageParam }: { pageParam?: string }) {
  const baseUrl =
    typeof window === "undefined"
      ? (process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000")
      : "";
  const url = pageParam
    ? `${baseUrl}/api/review?lastVisible=${pageParam}`
    : `${baseUrl}/api/review`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch reviews");
  }

  return response.json();
}

function useReviewList() {
  const { data, error, hasNextPage, fetchNextPage, isFetching } =
    useSuspenseInfiniteQuery({
      queryKey: reviewQueryKey,
      queryFn: fetchReviewList,
      getNextPageParam: lastPage =>
        lastPage.hasMore ? lastPage.lastVisible : null,
      initialPageParam: undefined,
      staleTime: 1000 * 60 * 5,
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
    error,
  };
}

export default useReviewList;
