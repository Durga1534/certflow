import { inngest } from "@/inngest/client";
import { db } from "@/db";
import { vendorDocuments, vendors } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "@/lib/storage/s3-client";
import { extractDocumentMetadata } from "@/lib/ai/extractor";

export const processDocumentJob = inngest.createFunction(
  {
    id: "process-vendor-document",
    retries: 3,
    concurrency: { limit: 5 }, // Prevents LLM rate-limit throttling
    triggers: [{ event: "document.uploaded" }],
  },
  async ({ event, step }) => {
    const { documentId, organizationId } = event.data;

    // Step 1: Fetch document metadata from DB
    const doc = await step.run("fetch-document-record", async () => {
      const [record] = await db
        .select()
        .from(vendorDocuments)
        .where(
          and(
            eq(vendorDocuments.id, documentId),
            eq(vendorDocuments.organizationId, organizationId)
          )
        )
        .limit(1);

      if (!record) throw new Error(`Document record ${documentId} not found.`);
      return record;
    });

    // Step 2: Stream PDF/Image file bytes from Object Storage
    const fileBase64 = await step.run("download-from-storage", async () => {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: doc.fileKey,
      });

      const response = await s3Client.send(command);
      const byteArray = await response.Body?.transformToByteArray();
      if (!byteArray) throw new Error("Failed to read storage byte stream.");
      
      return Buffer.from(byteArray).toString("base64");
    });

    // Step 3: Run Structured LLM Extraction
    const extraction = await step.run("extract-llm-metadata", async () => {
      const fileBuffer = Buffer.from(fileBase64, "base64");
      return await extractDocumentMetadata({
        fileBuffer,
        mimeType: doc.mimeType ?? "application/octet-stream",
      });
    });

    // Step 4: Update Database with Extracted Metadata and flag for Human Verification
    await step.run("persist-extraction-results", async () => {
      const targetStatus = "NEEDS_REVIEW" as const;

      await db
        .update(vendorDocuments)
        .set({
          status: targetStatus,
          documentNumber: extraction.policyNumber,
          issueDate: extraction.effectiveDate,
          expiryDate: extraction.expiryDate,
          extractedData: extraction,
          updatedAt: new Date(),
        })
        .where(eq(vendorDocuments.id, documentId));

      // Optional: Auto-update vendor status to non_compliant if document is already expired
      if (extraction.expiryDate && new Date(extraction.expiryDate) < new Date()) {
        await db
          .update(vendors)
          .set({ complianceStatus: "non_compliant" })
          .where(eq(vendors.id, doc.vendorId));
      }
    });

    return { success: true, documentId };
  }
);