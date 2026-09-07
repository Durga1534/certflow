import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, BUCKET_NAME } from "./s3-client";
import { uuidv7 } from "uuidv7";

interface GeneratePresignedUploadParams {
    organizationId: string;
    vendorId: string;
    mimeType: string;
    fileSizeBytes: number;
}


interface PresignedUploadResult {
    uploadUrl: string;
    fileKey: string;
    expiresInSeconds: number;
}

const UPLOAD_EXPIRATION_SECONDS = 300; // 5 minute upload window
const DOWNLOAD_EXPIRATION_SECONDS = 900; // 15 Minute view window

// Generate a predesigned URL for direct secure client upload.
export async function getPresignedUploadUrl({
    organizationId,
    vendorId,
    mimeType,
}: GeneratePresignedUploadParams) : Promise<PresignedUploadResult> {
    const fileId = uuidv7();
    const currentYear = new Date().getUTCFullYear();
    const fileKey = `${organizationId}/vendors/${vendorId}/${currentYear}/${fileId}.pdf`;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        ContentType: mimeType,
        Metadata: {
            organizationId,
            vendorId,
        }
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
        expiresIn: UPLOAD_EXPIRATION_SECONDS,
    });

    return {
        uploadUrl,
        fileKey,
        expiresInSeconds: UPLOAD_EXPIRATION_SECONDS,
    };
}

// Generates a temporary presigned URL for secure document viewing/downloading
export async function getPresignedDownloadUrl(
    fileKey: string,
    originalFileName: string
): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        ResponseContentDisposition: `inline; filename="${encodeURIComponent(originalFileName)}"`,
    });

    return await getSignedUrl(s3Client, command, {
        expiresIn: DOWNLOAD_EXPIRATION_SECONDS,
    });
}
