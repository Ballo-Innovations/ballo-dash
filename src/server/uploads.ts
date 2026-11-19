/**
 * Company image uploads (H-03). The server picks the object key, so a client
 * can only write under its own company's prefix, and the signed URL pins the
 * content type and exact size.
 */
import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3 } from "@/lib/aws";
import { badRequest } from "./errors";

export const IMAGE_TYPES = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
} as const;
export type ImageContentType = keyof typeof IMAGE_TYPES;

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const UPLOAD_KINDS = ["logo"] as const;
export type UploadKind = (typeof UPLOAD_KINDS)[number];

export function companyImageKey(companyId: string, kind: UploadKind, contentType: ImageContentType, id: string = randomUUID()): string {
  return `companies/${companyId}/${kind}/${id}.${IMAGE_TYPES[contentType]}`;
}

export function publicUrlFor(bucket: string, region: string, key: string): string {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

/** True when `url` is an object this company uploaded through companyImageKey. */
export function isCompanyImageUrl(url: string, companyId: string, bucket: string, region: string, kind: UploadKind): boolean {
  const prefix = publicUrlFor(bucket, region, `companies/${companyId}/${kind}/`);
  if (!url.startsWith(prefix)) return false;
  const rest = url.slice(prefix.length);
  return /^[0-9a-f-]{36}\.(png|jpg|webp)$/.test(rest);
}

export async function createCompanyImageUpload(params: {
  companyId: string;
  kind: UploadKind;
  contentType: ImageContentType;
  size: number;
}): Promise<{ uploadUrl: string; fileUrl: string; key: string; expiresIn: number }> {
  if (params.size <= 0 || params.size > MAX_IMAGE_BYTES) {
    throw badRequest(`Images must be at most ${MAX_IMAGE_BYTES / 1024 / 1024} MB`);
  }
  const { client, bucket, region } = getS3();
  const key = companyImageKey(params.companyId, params.kind, params.contentType);
  const expiresIn = 60;
  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: params.contentType, ContentLength: params.size }),
    { expiresIn }
  );
  return { uploadUrl, fileUrl: publicUrlFor(bucket, region, key), key, expiresIn };
}
