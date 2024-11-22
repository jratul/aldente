import { useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

async function fetchReviewList({ pageParam }: { pageParam?: string }) {
  const url = pageParam
    ? `/api/review?lastVisible=${pageParam}`
    : `/api/review`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch reviews");
  }

  return response.json();
}

function useReviewList() {
  const {
    data,
    hasNextPage = false,
    fetchNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ["review"],
    queryFn: fetchReviewList,
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

export default useReviewList;
