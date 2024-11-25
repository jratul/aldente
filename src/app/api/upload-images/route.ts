import { NextResponse } from "next/server";
import { Upload } from "@aws-sdk/lib-storage";
import { s3Client } from "@utils/s3";

export async function POST(req: Request) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  try {
    const uploadPromises = files.map(file => {
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: `${Date.now()}-${file.name}`,
          Body: file.stream(),
          ContentType: file.type,
        },
      });

      return upload.done();
    });

    const uploadedFiles = await Promise.all(uploadPromises);
    const imageUrls = uploadedFiles.map(file => file.Location);

    return NextResponse.json(imageUrls);
  } catch (error) {
    console.log("Failed to upload images ", error);
    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 },
    );
  }
}
