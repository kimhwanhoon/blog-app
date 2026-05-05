import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

export const R2_BUCKET = process.env.R2_BUCKET ?? "";
export const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? "").replace(
  /\/$/,
  "",
);

export const r2Configured = Boolean(
  R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET,
);

export const r2 = r2Configured
  ? new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export async function createPresignedPut(opts: {
  key: string;
  contentType: string;
  expiresIn?: number;
}) {
  if (!r2) throw new Error("R2 is not configured");
  const cmd = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: opts.key,
    ContentType: opts.contentType,
  });
  const url = await getSignedUrl(r2, cmd, {
    expiresIn: opts.expiresIn ?? 60 * 5,
  });
  return { url, publicUrl: `${R2_PUBLIC_URL}/${opts.key}` };
}
