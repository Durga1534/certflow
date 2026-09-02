import { pgTable, varchar, text, timestamp, index, uniqueIndex, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { organizations } from "./organizations";

export const vendorStatusEnum = pgEnum("vendor_status", [
    "active",
    "inactive",
    "archived",
]);

export const vendorComplianceStatusEnum = pgEnum("vendor_compliance_status", [
    "compliant",
    "non_compliant",
    "pending_review",
    "extempt",
]);

export const vendors = pgTable("vendors", {
    id: varchar("id", {length: 36}).$defaultFn(() => uuidv7()).primaryKey(),
    organizationId: varchar("organization_id", {length: 36}).notNull().references(() => organizations.id, {onDelete: "restrict"}),
    name: varchar("name", {length: 255}).notNull(),
    companyNumber: varchar("company_number", {length: 100}),

    // Primary Contact Details (Used for compliance notification)
    contactName: varchar("contact_name", {length: 255}),
    email: varchar("email", {length: 255}),
    phone: varchar("phone", {length: 50}),

    // Status tracking
    status: vendorStatusEnum("status").default("active").notNull(),
    complianceStatus: vendorComplianceStatusEnum("compliance_status").default("pending_review").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at").defaultNow(),
}, (table) => [
    // Fast tenant filter
    index("idx_vendors_organization_id").on(table.organizationId),

    // Fast status & dashboard compliance filtering
    index("idx_vendors_org_compliance").on(table.organizationId, table.complianceStatus),
    index("idx_vendors_org_email").on(table.organizationId, table.email),

    // Enforce unique vendor company per tenant (active records only)
    uniqueIndex("uq_vendors_org_name_active").on(table.organizationId, table.name).where(sql`${table.deletedAt} IS NULL`)
]);

export type Vendor = typeof vendors.$inferSelect;
export type NewVendor = typeof vendors.$inferInsert;

