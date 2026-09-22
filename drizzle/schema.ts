import { pgEnum, pgTable, varchar, text, timestamp, integer, date, boolean, jsonb, index, uniqueIndex, foreignKey, primaryKey, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const organizationStatus = pgEnum("organization_status", ["active", "suspended", "canceled"])
export const vendorComplianceStatus = pgEnum("vendor_compliance_status", ["compliant", "non_compliant", "pending_review", "extempt"])
export const vendorStatus = pgEnum("vendor_status", ["active", "inactive", "archived"])
export const documentStatus = pgEnum("document_status", ["RECEIVED", "EXTRACTED", "NEEDS_REVIEW", "VERIFIED", "REJECTED", "EXPIRED", "SUPERSEDED"])
export const documentType = pgEnum("document_type", ["COI", "WSIB", "FIRE_INSPECTION", "ELEVATOR", "LICENSE", "OTHER"])
export const workOrderPriority = pgEnum("work_order_priority", ["LOW", "MEDIUM", "HIGH", "EMERGENCY"])
export const workOrderStatus = pgEnum("work_order_status", ["DRAFT", "PENDING_COMPLIANCE", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])


export const organizations = pgTable("organizations", {
	id: varchar({ length: 36 }).primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	status: organizationStatus().default("active").notNull(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
	deletedAt: timestamp("deleted_at"),
}, (table) => [
	unique("organizations_slug_key").on(table.slug),]);

export const properties = pgTable("properties", {
	id: varchar({ length: 36 }).primaryKey(),
	organizationId: varchar("organization_id", { length: 36 }).notNull().references(() => organizations.id, { onDelete: "restrict" } ),
	name: varchar({ length: 255 }).notNull(),
	addressLine1: varchar("address_line1", { length: 255 }),
	addressLine2: varchar("address_line2", { length: 255 }),
	city: varchar({ length: 100 }),
	stateProvince: varchar("state_province", { length: 100 }),
	postalCode: varchar("postal_code", { length: 20 }),
	country: varchar({ length: 2 }).default("CA"),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
	deletedAt: timestamp("deleted_at"),
}, (table) => [
	index("idx_properties_organization_id").using("btree", table.organizationId.asc().nullsLast()),
	uniqueIndex("uq_properties_org_name_active").using("btree", table.organizationId.asc().nullsLast(), table.name.asc().nullsLast()).where(sql`(deleted_at IS NULL)`),
]);

export const units = pgTable("units", {
	id: varchar({ length: 36 }).primaryKey(),
	organizationId: varchar("organization_id", { length: 36 }).notNull().references(() => organizations.id, { onDelete: "restrict" } ),
	propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id, { onDelete: "restrict" } ),
	unitNumber: varchar("unit_number", { length: 50 }).notNull(),
	notes: text(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
	deletedAt: timestamp("deleted_at"),
}, (table) => [
	index("idx_units_organization_id").using("btree", table.organizationId.asc().nullsLast()),
	index("idx_units_property_id").using("btree", table.propertyId.asc().nullsLast()),
	uniqueIndex("uq_units_property_number_active").using("btree", table.propertyId.asc().nullsLast(), table.unitNumber.asc().nullsLast()).where(sql`(deleted_at IS NULL)`),
]);

export const vendorDocuments = pgTable("vendor_documents", {
	id: varchar({ length: 36 }).primaryKey(),
	organizationId: varchar("organization_id", { length: 36 }).notNull().references(() => organizations.id, { onDelete: "restrict" } ),
	vendorId: varchar("vendor_id", { length: 36 }).notNull().references(() => vendors.id, { onDelete: "restrict" } ),
	propertyId: varchar("property_id", { length: 36 }).references(() => properties.id, { onDelete: "set null" } ),
	documentType: documentType("document_type").notNull(),
	status: documentStatus().default("RECEIVED").notNull(),
	fileKey: varchar("file_key", { length: 512 }).notNull(),
	fileName: varchar("file_name", { length: 255 }).notNull(),
	fileSizeBytes: integer("file_size_bytes"),
	mimeType: varchar("mime_type", { length: 100 }),
	documentNumber: varchar("document_number", { length: 100 }),
	issueDate: date("issue_date"),
	expiryDate: date("expiry_date"),
	extractedData: jsonb("extracted_data"),
	rejectionReason: text("rejection_reason"),
	verifiedByUserId: varchar("verified_by_user_id", { length: 255 }),
	verifiedAt: timestamp("verified_at"),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
	deletedAt: timestamp("deleted_at"),
}, (table) => [
	index("idx_vdocs_expiry_date").using("btree", table.organizationId.asc().nullsLast(), table.expiryDate.asc().nullsLast()),
	index("idx_vdocs_organization_id").using("btree", table.organizationId.asc().nullsLast()),
	index("idx_vdocs_status_queue").using("btree", table.organizationId.asc().nullsLast(), table.status.asc().nullsLast()),
	index("idx_vdocs_vendor_id").using("btree", table.vendorId.asc().nullsLast()),
]);

export const vendors = pgTable("vendors", {
	id: varchar({ length: 36 }).primaryKey(),
	organizationId: varchar("organization_id", { length: 36 }).notNull().references(() => organizations.id, { onDelete: "restrict" } ),
	name: varchar({ length: 255 }).notNull(),
	companyNumber: varchar("company_number", { length: 100 }),
	contactName: varchar("contact_name", { length: 255 }),
	email: varchar({ length: 255 }),
	phone: varchar({ length: 50 }),
	status: vendorStatus().default("active").notNull(),
	complianceStatus: vendorComplianceStatus("compliance_status").default("pending_review").notNull(),
	notes: text(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
	deletedAt: timestamp("deleted_at").default(sql`now()`),
}, (table) => [
	index("idx_vendors_org_compliance").using("btree", table.organizationId.asc().nullsLast(), table.complianceStatus.asc().nullsLast()),
	index("idx_vendors_org_email").using("btree", table.organizationId.asc().nullsLast(), table.email.asc().nullsLast()),
	index("idx_vendors_organization_id").using("btree", table.organizationId.asc().nullsLast()),
	uniqueIndex("uq_vendors_org_name_active").using("btree", table.organizationId.asc().nullsLast(), table.name.asc().nullsLast()).where(sql`(deleted_at IS NULL)`),
]);

export const workOrders = pgTable("work_orders", {
	id: varchar({ length: 36 }).primaryKey(),
	organizationId: varchar("organization_id", { length: 36 }).notNull().references(() => organizations.id, { onDelete: "restrict" } ),
	propertyId: varchar("property_id", { length: 36 }).notNull().references(() => properties.id, { onDelete: "restrict" } ),
	unitId: varchar("unit_id", { length: 36 }).references(() => units.id, { onDelete: "set null" } ),
	vendorId: varchar("vendor_id", { length: 36 }).references(() => vendors.id, { onDelete: "set null" } ),
	workOrderNumber: varchar("work_order_number", { length: 100 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	status: workOrderStatus().default("DRAFT").notNull(),
	priority: workOrderPriority().default("MEDIUM").notNull(),
	scheduledStartDate: timestamp("scheduled_start_date"),
	complianceError: boolean("compliance_error").default(false).notNull(),
	complianceOverrideReason: text("compliance_override_reason"),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
	deletedAt: timestamp("deleted_at"),
}, (table) => [
	index("idx_work_orders_org_status").using("btree", table.organizationId.asc().nullsLast(), table.status.asc().nullsLast()),
	index("idx_work_orders_organization_id").using("btree", table.organizationId.asc().nullsLast()),
	index("idx_work_orders_property_id").using("btree", table.propertyId.asc().nullsLast()),
	index("idx_work_orders_vendor_id").using("btree", table.vendorId.asc().nullsLast()),
	uniqueIndex("uq_work_orders_org_number_active").using("btree", table.organizationId.asc().nullsLast(), table.workOrderNumber.asc().nullsLast()).where(sql`(deleted_at IS NULL)`),
]);
