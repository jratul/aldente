import { useCallback } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

async function fetchReviewList({ pageParam }: { pageParam?: string }) {
  const url = pageParam
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/review?lastVisible=${pageParam}`
    : `${process.env.NEXT_PUBLIC_BASE_URL}/api/review`;

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
  } = useSuspenseInfiniteQuery({
    queryKey: ["review"],
    queryFn: fetchReviewList,
    getNextPageParam: lastPage =>
      lastPage.hasMore ? lastPage.lastVisible : null,
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
