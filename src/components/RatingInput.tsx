import StarRatings from "react-star-ratings";

interface Props {
  rating: number;
  setRating: (rating: number) => void;
}

export default function RatingInput({ rating, setRating }: Props) {
  // const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  return (
    <div className="p-4 flex items-center gap-2">
      <StarRatings
        starRatedColor="#facc15"
        starHoverColor="#facc15"
        starDimension="25px"
        starSpacing="0"
        rating={rating}
        changeRating={handleRatingChange}
      />
      <span>{rating}</span>
    </div>
  );
}
