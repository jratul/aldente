import { NextResponse } from "next/server";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@constants/collections";
import { store } from "@utils/firebase";
import { Review } from "@models/review";
import { User } from "@models/user";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: "not found" }, { status: 400 });
  }

  try {
    const reviewDoc = await getDoc(doc(store, COLLECTIONS.REVIEWS, slug));

    const review: Partial<Review> = {
      id: reviewDoc.id,
      ...reviewDoc.data(),
      date:
        reviewDoc?.data()?.date instanceof Timestamp
          ? reviewDoc?.data()?.date?.toDate()
          : reviewDoc?.data()?.date,
    };

    const userDoc = await getDoc(
      doc(store, COLLECTIONS.USERS, review.uid as ""),
    );

    const userData = userDoc.data() as User;

    return NextResponse.json({
      ...review,
      ...userData,
    });
  } catch (error) {
    console.log("Failed to get review data.", error);
    return NextResponse.json(
      {
        error: "Failed to get review data.",
      },
      { status: 500 },
    );
  }
}
