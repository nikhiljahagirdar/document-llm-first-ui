import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || "nikhiljag-bucket";

/**
 * Extracts the S3 key from various input formats:
 * - s3://bucket/key
 * - https://bucket.s3.region.amazonaws.com/key
 * - /key or key
 */
const extractKey = (input: string): string => {
  if (!input) return "";
  
  try {
    if (input.startsWith('s3://')) {
      const url = new URL(input);
      // s3://bucket/key -> hostname is bucket, pathname is /key
      return url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
    }
    
    if (input.startsWith('http')) {
      const url = new URL(input);
      let pathname = decodeURIComponent(url.pathname);
      
      const hostParts = url.hostname.split('.');
      if (hostParts[0] === BUCKET_NAME) {
        return pathname.startsWith('/') ? pathname.slice(1) : pathname;
      } else {
        const pathParts = pathname.split('/').filter(Boolean);
        if (pathParts[0] === BUCKET_NAME) {
          return pathParts.slice(1).join('/');
        } else {
          return pathname.startsWith('/') ? pathname.slice(1) : pathname;
        }
      }
    }
  } catch (err) {
    console.warn("Key extraction warning:", err);
  }

  // Fallback: strip leading slash
  return input.startsWith("/") ? input.slice(1) : input;
};

export const getS3SignedUrl = async (input: string) => {
  if (!input) return null;

  // If it already looks like a signed URL, return it
  if (input.toLowerCase().includes('x-amz-signature') || input.toLowerCase().includes('x-amz-algorithm')) {
    return input;
  }

  const key = extractKey(input);

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  try {
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (err) {
    console.error("S3 Sign Error:", err);
    return input.startsWith('http') ? input : null;
  }
};

export const getS3BlobUrl = async (input: string) => {
  if (!input) return null;

  const key = extractKey(input);
  const ext = key.split('.').pop()?.toLowerCase() || "";
  const isOfficeDoc = ["docx", "pptx", "xlsx", "doc", "ppt", "xls"].includes(ext);

  // Office documents cannot be rendered via blob URLs in most browser-based viewers (like react-doc-viewer with MS Office Online)
  if (isOfficeDoc) {
    return await getS3SignedUrl(input);
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    
    if (!response.Body) {
      throw new Error("S3 Response Body is empty");
    }

    // Convert ReadableStream to Blob with the correct Content-Type from S3 metadata
    const blob = await new Response(response.Body as any, {
      headers: { "Content-Type": response.ContentType || "application/octet-stream" }
    }).blob();
    
    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn("S3 direct fetch failed, falling back to signed URL:", err);
    return await getS3SignedUrl(input);
  }
};
