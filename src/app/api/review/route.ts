import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  setDoc,
  startAfter,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { COLLECTIONS } from "@constants/collections";
import { authOptions } from "@utils/authOptions";
import { store } from "@utils/firebase";
import { User } from "@models/user";
import { Review } from "@models/review";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lastVisibleId = searchParams.get("lastVisible");

  try {
    const reviewsQuery =
      lastVisibleId == null
        ? query(
            collection(store, COLLECTIONS.REVIEWS),
            orderBy("date", "desc"),
            limit(10),
          )
        : query(
            collection(store, COLLECTIONS.REVIEWS),
            orderBy("date", "desc"),
            startAfter(lastVisibleId),
            limit(10),
          );

    const reviewsSnapshot = await getDocs(reviewsQuery);

    const items = await Promise.all(
      reviewsSnapshot.docs.map(async docItem => {
        const review: Partial<Review> = {
          id: docItem.id,
          ...docItem.data(),
          date:
            docItem.data().date instanceof Timestamp
              ? docItem.data().date.toDate()
              : docItem.data().date,
        };

        const userDoc = await getDoc(
          doc(store, COLLECTIONS.USERS, review.uid as ""),
        );
        const userData = userDoc.data() as User;

        return {
          ...review,
          ...userData,
        };
      }),
    );

    const lastVisible =
      reviewsSnapshot.docs[reviewsSnapshot.docs.length - 1]?.id;

    return NextResponse.json({
      items,
      lastVisible,
    });
  } catch (error) {
    console.error("Failed to fetch reviews with user info:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  const userEmail = session?.user?.email;
  if (!userEmail) {
    return NextResponse.json(
      { error: "사용자 인증에 실패했습니다." },
      { status: 400 },
    );
  }

  let userUid;
  try {
    const userQuery = query(
      collection(store, COLLECTIONS.USERS),
      where("email", "==", userEmail),
    );

    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    userUid = userSnapshot.docs[0].id;
  } catch (error) {
    console.error("Firestore에서 사용자 정보를 가져오는 중 오류 발생:", error);
    return NextResponse.json(
      { error: "사용자 정보를 가져오는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }

  if (!userUid) {
    return NextResponse.json(
      {
        error: "사용자 정보를 가져오는 데 실패했습니다.",
      },
      {
        status: 500,
      },
    );
  }

  const body = await req.json();

  try {
    const review = {
      uid: userUid,
      date: new Date(),
      rating: body.rating,
      images: body.images,
      title: body.title,
      content: body.content,
      restaurant: body.restaurant,
    };

    await setDoc(doc(collection(store, COLLECTIONS.REVIEWS)), review);

    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save review" },
      { status: 500 },
    );
  }
}
