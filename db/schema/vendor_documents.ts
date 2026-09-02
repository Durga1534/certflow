import { pgTable, varchar, text, integer, date, timestamp, jsonb, index, pgEnum } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { organizations } from "./organizations";
import { vendors } from "./vendors";
import { properties } from "./properties";

export const documentTypeEnum = pgEnum("document_type", [
    "COI",
    "WSIB",
    "FIRE_INSPECTION",
    "ELEVATOR",
    "LICENSE",
    "OTHER",
]);

export const documentStatusEnum = pgEnum("document_status", [
    "RECEIVED",
    "EXTRACTED",
    "NEEDS_REVIEW",
    "VERIFIED",
    "REJECTED",
    "EXPIRED",
    "SUPERSEDED",
]);

export const vendorDocuments = pgTable("vendor_documents", {
    id: varchar("id", {length: 36}).$defaultFn(() => uuidv7()).primaryKey(),
    organizationId: varchar("organization_id", {length: 36}).notNull().references(() => organizations.id, {onDelete: "restrict"}),
    vendorId: varchar("vendor_id", {length: 36}).notNull().references(() => vendors.id, {onDelete: "restrict"}),
    propertyId: varchar("property_id", {length: 36}).references(() => properties.id, {onDelete: "set null"}),
    documentType: documentTypeEnum("document_type").notNull(),
    status: documentStatusEnum("status").default("RECEIVED").notNull(),

    // Object Storage References
    fileKey: varchar("file_key", {length: 512}).notNull(),
    fileName: varchar("file_name", {length: 255}).notNull(),
    fileSizeBytes: integer("file_size_bytes"),
    mimeType: varchar("mime_type", {length: 100}),

    // Extracted / Verified Metadata
    documentNumber: varchar("document_number", {length: 100}),
    issueDate: date("issue_date", {mode: "string"}),
    expiryDate: date("expiry_date", {mode: "string"}),

    // Raw AI Extraction Payload & Confidence Audit
    extractedData: jsonb("extracted_data"),
    rejectionReason: text("rejection_reason"),

    // Audit trail of human verification
    verifiedByUserId: varchar("verified_by_user_id", {length: 255}),
    verifiedAt: timestamp("verified_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
    deletedAt: timestamp("deleted_at"),

}, (table) => [
    index("idx_vdocs_organization_id").on(table.organizationId),
    index("idx_vdocs_vendor_id").on(table.vendorId),
    index("idx_vdocs_expiry_date").on(table.organizationId, table.expiryDate),
    index("idx_vdocs_status_queue").on(table.organizationId, table.status),
]);

export type VendorDocument = typeof vendorDocuments.$inferSelect;
export type NewVendorDocument = typeof vendorDocuments.$inferInsert;