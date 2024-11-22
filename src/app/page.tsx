"use client";

import InfiniteScroll from "react-infinite-scroll-component";
import useReviewList from "@queries/useReviewList";
import ReviewItem from "@components/ReviewItem";

export default function Home() {
  const { data, hasNextPage, loadMore } = useReviewList();

  return (
    <div>
      <InfiniteScroll
        dataLength={data?.length ?? 0}
        hasMore={hasNextPage}
        loader={<></>}
        next={loadMore}
        scrollThreshold="100px"
      >
        {data?.map((review, idx) => <ReviewItem review={review} key={idx} />)}
      </InfiniteScroll>
    </div>
  );
}
