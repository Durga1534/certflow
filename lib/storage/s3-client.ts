import { S3Client } from "@aws-sdk/client-s3";

if( !process.env.STORAGE_ENDPOINT ||
    !process.env.STORAGE_ACCESS_KEY_ID ||
    !process.env.STORAGE_SECRET_ACCESS_KEY ||
    !process.env.STORAGE_BUCKET_NAME
) {
    throw new Error("[Storage Service Configuration Missing] Check local environment variables.");
}

export const s3Client = new S3Client({
    region: process.env.STORAGE_REGION || "auto",
    endpoint: process.env.STORAGE_ENDPOINT,
    credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
    },
});

export const BUCKET_NAME = process.env.STORAGE_BUCKET_NAME;