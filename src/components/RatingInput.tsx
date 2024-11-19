interface Props {
  rating: number;
  setRating: (rating: number) => void;
}

export default function RatingInput({ rating, setRating }: Props) {
  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (value >= 1 && value <= 5) {
      setRating(parseFloat(value.toFixed(2)));
    }
  };

  return (
    <div className="p-4">
      <span className="mb-2 text-gray-700 mr-2">평점</span>
      <input
        type="number"
        min="1"
        max="5"
        step="0.01"
        value={rating}
        onChange={handleRatingChange}
        className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-400 focus:ring-opacity-50"
      />
    </div>
  );
}
