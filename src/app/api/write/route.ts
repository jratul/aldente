import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs, query, where } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { s3 } from "@utils/s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@utils/authOptions";
import { store } from "@utils/firebase";
import { COLLECTIONS } from "constants/collections";

export async function POST(req: NextRequest) {
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

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  const postData = formData.get("postData");

  if (files.length > 10) {
    return NextResponse.json(
      { error: "최대 10장의 사진만 업로드할 수 있습니다." },
      { status: 400 },
    );
  }

  const uploadedUrls: string[] = [];

  try {
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME || "",
        Key: `aldente/${uuidv4()}-${file.name}`,
        Body: buffer,
        ContentType: file.type,
        ACL: "public-read",
      };

      const uploadResult = await s3.upload(uploadParams).promise();
      uploadedUrls.push(uploadResult.Location);
    }

    return NextResponse.json({ success: true, urls: uploadedUrls });
  } catch (error) {
    console.error("업로드 중 오류 발생:", error);
    return NextResponse.json(
      { error: "업로드에 실패했습니다." },
      { status: 500 },
    );
  }
}
