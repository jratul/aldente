import BackButton from "@components/shared/BackButton";
import ImageSwiper from "@components/ImageSwiper";
import RestaurantCard from "@components/RestaurantCard";
import ReviewMap from "@components/ReviewMap";
import UserCard from "@components/UserCard";
import { Review } from "@models/review";
import { User } from "@models/user";

async function fetchReview(slug: string): Promise<(Review & User) | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/review/${slug}`,
  );

  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    throw new Error("Failed to fetch review");
  }

  return res.json();
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const review = await fetchReview(slug);

  if (!review) {
    throw new Error("Review data is missing");
  }

  return (
    <div className="mb-4">
      <BackButton />
      <UserCard
        photoURL={review.photoURL}
        displayName={review.displayName}
        date={review.date}
      />
      <ImageSwiper
        images={review.images}
        restaurantName={review.restaurant.name}
      />
      <RestaurantCard review={review} />
      <div className="text-lg font-bold my-2">{review.title}</div>
      <div className="mb-4 text-gray-600">{JSON.parse(review.content)}</div>
      <ReviewMap
        pos={review.restaurant.pos}
        placeUrl={review.restaurant.placeUrl}
      />
    </div>
  );
}
