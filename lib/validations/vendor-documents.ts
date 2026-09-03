import { z } from "zod";

export const documentTypeSchema = z.enum([
    "COI",
    "WSIB",
    "FIRE_INSPECTION",
    "ELEVATOR",
    "LICENSE",
    "OTHER",
]);

export const documentStatusSchema = z.enum([
    "RECEIVED",
    "EXTRACTED",
    "NEEDS_REVIEW",
    "VERIFIED",
    "REJECTED",
    "EXPIRED",
    "SUPERSEDED",
]);

// Upload metadata schema for signed upload URL requests.
export const registerDocumentUploadSchema = z.object({
    vendorId: z.string({error: "Vendor ID is required"}).length(36),
    propertyId: z.string().length(36).optional().nullable(),
    fileName: z.string({error: "File name is required"}).trim().min(1, "File name cannot be empty").max(255),
    fileSizeBytes: z.number().positive("File size must be greater than 0").max(20 * 1024 * 1024, "File size cannot exceed 20MB"),
    mimeType: z.enum([
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
    ], {error: "Only PDF, JPEG, PNG, or WEBP files are allowed "}),
    documentType: documentTypeSchema.default("COI"),
});

// Human verification / Approval form schema
export const verifyDocumentSchema = z.object({
    documentId: z.string().length(36),
    documentType: documentTypeSchema,
    documentNumber: z.string().trim().max(100, "Document cannot exceed 100 characters").optional().or(z.literal("")),
    // ISO Date Strings (YYYY-MM-DD)
    issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Issue date must be in YYYY-MM-DD format").optional().or(z.literal("")),
    expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expiry date must be in YYYY-MM-DD format").optional().or(z.literal("")),
    propertyId: z.string().length(36).optional().nullable(),
});

// Document Rejection Schema
export const rejectDocumentSchema = z.object({
    documentId: z.string().length(36),
    rejectReason: z.string({error: "A rejection reason is required"}).trim().min(5, "Rejection reason must be at least 5 characters").max(1000),
});

export type RegisterDocumentUploadInput = z.infer<typeof registerDocumentUploadSchema>;
export type VerifyDocumentInput = z.infer<typeof verifyDocumentSchema>;
export type RejectDocumentInput = z.infer<typeof rejectDocumentSchema>;