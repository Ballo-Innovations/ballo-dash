import { S3Client } from "@aws-sdk/client-s3";
import { serviceUnavailable } from "@/server/errors";

let client: S3Client | undefined;

/** S3 client and bucket, or a 503 ApiError when storage is not configured. */
export function getS3(): { client: S3Client; bucket: string; region: string } {
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!region || !bucket || !accessKeyId || !secretAccessKey) {
    throw serviceUnavailable("File storage is not configured");
  }
  client ??= new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
  return { client, bucket, region };
}
