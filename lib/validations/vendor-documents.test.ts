import { describe, expect, it } from "vitest";
import {
    registerDocumentUploadSchema,
    rejectDocumentSchema,
    verifyDocumentSchema,
} from "./vendor-documents";

const id = "12345678-1234-1234-1234-123456789012";

const validUpload = {
    vendorId: id,
    propertyId: null,
    fileName: "certificate.pdf",
    fileSizeBytes: 1024,
    mimeType: "application/pdf" as const,
};

describe("vendor document validation", () => {
    it("defaults uploads to certificates of insurance", () => {
        expect(registerDocumentUploadSchema.parse(validUpload).documentType).toBe("COI");
    });

    it("accepts supported file types and enforces upload limits", () => {
        for (const mimeType of ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const) {
            expect(registerDocumentUploadSchema.parse({ ...validUpload, mimeType }).mimeType).toBe(mimeType);
        }

        expect(registerDocumentUploadSchema.parse({ ...validUpload, fileSizeBytes: 20 * 1024 * 1024 })).toBeTruthy();
        expect(() => registerDocumentUploadSchema.parse({ ...validUpload, fileSizeBytes: 0 })).toThrow();
        expect(() => registerDocumentUploadSchema.parse({ ...validUpload, fileSizeBytes: 20 * 1024 * 1024 + 1 })).toThrow();
        expect(() => registerDocumentUploadSchema.parse({ ...validUpload, mimeType: "text/plain" })).toThrow();
    });

    it("validates verification dates and rejection reasons", () => {
        expect(verifyDocumentSchema.parse({
            documentId: id,
            documentType: "COI",
            expiryDate: "2027-12-31",
        })).toMatchObject({ documentId: id, expiryDate: "2027-12-31" });
        expect(() => verifyDocumentSchema.parse({
            documentId: id,
            documentType: "COI",
            expiryDate: "31-12-2027",
        })).toThrow();
        expect(() => rejectDocumentSchema.parse({ documentId: id, rejectReason: "no" })).toThrow();
        expect(rejectDocumentSchema.parse({ documentId: id, rejectReason: "Missing policy number" })).toBeTruthy();
    });
});
