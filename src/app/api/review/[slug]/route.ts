import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { COLLECTIONS } from "@constants/collections";
import { store } from "@utils/firebase";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  if (!params.slug) {
    return NextResponse.json({ error: "not found" }, { status: 400 });
  }

  try {
    const reviewDoc = await getDoc(
      doc(store, COLLECTIONS.REVIEWS, params.slug),
    );

    console.log(reviewDoc.id);

    return NextResponse.json({
      id: reviewDoc.id,
      ...reviewDoc.data(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch a review",
      },
      { status: 500 },
    );
  }
}
