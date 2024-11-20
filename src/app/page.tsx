"use client";

import InfiniteScroll from "react-infinite-scroll-component";
import { useReview } from "@queries/useReview";
import ReviewItem from "@components/ReviewItem";

export default function Home() {
  const { data, hasNextPage, loadMore } = useReview();

  console.log(data);

  return (
    <div>
      <InfiniteScroll
        dataLength={data?.length ?? 0}
        hasMore={hasNextPage}
        loader={<></>}
        next={loadMore}
        scrollThreshold="100px"
      >
        <ul>
          {data?.map((review, idx) => <ReviewItem review={review} key={idx} />)}
        </ul>
      </InfiniteScroll>
    </div>
  );
}
