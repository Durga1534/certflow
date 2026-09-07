"use server"

import { registerDocumentUploadSchema } from "@/lib/validations/vendor-documents";
import { getPresignedUploadUrl } from "@/lib/storage/service";
import { createTenantDb } from "@/db/tenant-db";

async function getAuthenticatedTenantContext() {
    // Mock tenant context prior to Clerk wiring
    return { organizationId: "018f2f4c-1234-7000-8000-000000000001" };
}

export async function requestDocumentUploadAction(input: unknown) {
    const context = await getAuthenticatedTenantContext();

    //1. Strict Runtime Input Validation
    const validatedInput = registerDocumentUploadSchema.parse(input);

    const tenantDb = createTenantDb(context);

    //2. Verify Vendor exists within this tenant
    const vendor = await tenantDb.vendors.findById(validatedInput.vendorId);
    if(!vendor) {
        throw new Error("Vendor not found or access denied.");
    }

    // 3. Generate presigned upload URL
    const {uploadUrl, fileKey} = await getPresignedUploadUrl({
        organizationId: context.organizationId,
        vendorId: validatedInput.vendorId,
        mimeType: validatedInput.mimeType,
        fileSizeBytes: validatedInput.fileSizeBytes,
    });

    //4. Pre-register document in RECEIVED state
    const newDoc = await tenantDb.vendorDocuments.create({
        vendorId: validatedInput.vendorId,
        propertyId: validatedInput.propertyId ?? null,
        documentType: validatedInput.documentType,
        status: "RECEIVED",
        fileKey,
        fileName: validatedInput.fileName,
        fileSizeBytes: validatedInput.fileSizeBytes,
        mimeType: validatedInput.mimeType,
    });

    return {
        documentId: newDoc.id,
        uploadUrl,
        fileKey,
    }
}