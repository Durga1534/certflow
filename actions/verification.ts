"use server";

import { verifyDocumentSchema, rejectDocumentSchema } from "@/lib/validations/vendor-documents";
import { getTenantDb } from "@/lib/auth/get-tenant-db";
import { getPresignedDownloadUrl } from "@/lib/storage/service";
import { vendorDocuments, vendors } from "@/db/schema";
import { db } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPendingVerificationQueueAction() {
    const tenantDb = await getTenantDb();

  const pendingDocs = await db.select({document: vendorDocuments, vendorName: vendors.name}).from(vendorDocuments).innerJoin(vendors, eq(vendorDocuments.vendorId, vendors.id)).where(and(eq(vendorDocuments.organizationId, tenantDb.organizationId), eq(vendorDocuments.status, "NEEDS_REVIEW"))).orderBy(desc(vendorDocuments.createdAt))
    const itemsWithUrls = await Promise.all(pendingDocs.map(async (item) => ({
        ...item,
        previewUrl: await getPresignedDownloadUrl(item.document.fileKey, item.document.fileName),
    })))
    return itemsWithUrls;
}

export async function verifyDocumentAction(input: unknown) {
    const tenantDb = await getTenantDb();
    const data = verifyDocumentSchema.parse(input);

    const now = new Date();
    const parsedExpiry = new Date(data.expiryDate);

    await db.transaction(async (tx) => {
        //1. Target document record
        const [existingDoc] = await tx
          .select()
          .from(vendorDocuments)
          .where(and(eq(vendorDocuments.id, data.documentId), eq(vendorDocuments.organizationId, tenantDb.organizationId)))
          .limit(1);

          if(!existingDoc) {
            throw new Error("Document not found or access denied.");
          }

          //2. Determine compliance status based on expiry
          const isExpired = parsedExpiry < now;
          const documentStatus = isExpired ? "EXPIRED" : "VERIFIED";

          //3. Update document with verified metadata
          await tx
           .update(vendorDocuments)
           .set({
            status: documentStatus,
            documentType: data.documentType,
            documentNumber: data.documentNumber || null,
            issueDate: data.issueDate || null,
            expiryDate: data.expiryDate,
            propertyId: data.propertyId ?? null,
            verifiedByUserId: tenantDb.userId,
            verifiedAt: now,
            updatedAt: now,
           })
           .where(eq(vendorDocuments.id, data.documentId));

           //4. Update parent vendor status
           await tx
            .update(vendors)
            .set({
                complianceStatus: isExpired ? "non_compliant" : "compliant",
                updatedAt: now,
            })
            .where(eq(vendors.id, existingDoc.vendorId));
    })

    revalidatePath("/dashboard/verification");
    revalidatePath("/dashboard/vendors");

    return { success: true};
}

// Manager action to reject an invalid compliance document.
export async function rejectDocumentAction(input: unknown) {
    const tenantDb = await getTenantDb()
    const data = rejectDocumentSchema.parse(input);

    const now = new Date();

    await db.transaction(async(tx) => {
        const [existingDoc] = await tx
          .select()
          .from(vendorDocuments)
          .where(and(eq(vendorDocuments.id, data.documentId), eq(vendorDocuments.organizationId, tenantDb.organizationId)))
          .limit(1);

          if(!existingDoc) {
            throw new Error("Document not found or access denied.");
          }

          await tx
        .update(vendorDocuments)
        .set({
            status: "REJECTED",
            rejectionReason: data.rejectReason,
            verifiedByUserId: tenantDb.userId,
            verifiedAt: now,
            updatedAt: now,
        })
        .where(eq(vendorDocuments.id, data.documentId));

        // Shift vendor status to non_compliant
        await tx
         .update(vendors)
         .set({
            complianceStatus: "non_compliant",
            updatedAt: now,
         })
         .where(eq(vendors.id, existingDoc.vendorId));
    });

    revalidatePath("/dashboard/verification");
    revalidatePath("/dashboard/vendors");

    return {success: true};
}