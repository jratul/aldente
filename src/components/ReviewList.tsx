"use client";

import InfiniteScroll from "react-infinite-scroll-component";
import useReviewList from "@queries/useReviewList";
import ReviewItem from "@components/ReviewItem";
import Loader from "./shared/Loader";

export default function ReviewList() {
  const { data, hasNextPage, loadMore } = useReviewList();

  return (
    <InfiniteScroll
      dataLength={data?.length ?? 0}
      hasMore={hasNextPage}
      loader={<Loader />}
      next={loadMore}
      scrollThreshold="100px"
      // pullDownToRefresh={false}
    >
      {data?.map((review, idx) => <ReviewItem review={review} key={idx} />)}
    </InfiniteScroll>
  );
}
