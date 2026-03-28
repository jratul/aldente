export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { Upload } from "@aws-sdk/lib-storage";
import { getServerSession } from "next-auth";
import { s3Client } from "@utils/s3";
import { authOptions } from "@utils/authOptions";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `허용되지 않는 파일 형식입니다: ${file.type}` },
        { status: 400 },
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "파일 크기는 5MB를 초과할 수 없습니다." },
        { status: 400 },
      );
    }
  }

  try {
    const uploadPromises = files.map(async file => {
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: `${Date.now()}-${file.name}`,
          Body: Buffer.from(await file.arrayBuffer()),
          ContentType: file.type,
        },
      });

      return upload.done();
    });

    const uploadedFiles = await Promise.all(uploadPromises);
    const imageUrls = uploadedFiles
      .map(file => file.Location)
      .filter((url): url is string => !!url);

    return NextResponse.json(imageUrls);
  } catch (error) {
    console.error("Failed to upload images:", error);
    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 },
    );
  }
}
