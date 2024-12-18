import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { Review } from "@models/review";

type SubmitReview = Omit<Review, "id" | "uid" | "date" | "images">;

const uploadImagesToS3 = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append("files", file);
  });

  const response = await fetch("/api/upload-images", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  return response.json();
};

const submitReview = async (review: SubmitReview): Promise<string> => {
  const imageUrls = await uploadImagesToS3(review.imageFiles);

  const response = await fetch("/api/review", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...review,
      images: imageUrls,
    }),
  });

  if (!response.ok) {
    throw new Error("Review submission failed");
  }

  return response.json();
};

const useWriteReview = (): UseMutationResult<string, Error, SubmitReview> => {
  return useMutation<string, Error, SubmitReview>({
    mutationFn: submitReview,
  });
};

export default useWriteReview;
