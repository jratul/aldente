import BackButton from "@components/BackButton";
import RestaurantCard from "@components/RestaurantCard";

async function fetchReview(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/review/${slug}`,
  );

  if (!res.ok) {
    if (res.status === 404) {
      return { notFound: true };
    }
    throw new Error("Failed to fetch review");
  }

  return res.json();
}

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const review = await fetchReview(slug);

  if (!review) {
    throw new Error("Review data is missing");
  }

  return (
    <div>
      <BackButton />
      <RestaurantCard review={review} />
    </div>
  );
}
