import { pgTable, varchar, text, boolean, timestamp, index, uniqueIndex, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { organizations } from "./organizations";
import { properties } from "./properties";
import { units } from "./units";
import { vendors } from "./vendors";

export const workOrderStatusEnum = pgEnum("work_order_status", [
    "DRAFT",
    "PENDING_COMPLIANCE",
    "SCHEDULED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
]);

export const workOrderPriorityEnum = pgEnum("work_order_priority", [
    "LOW",
    "MEDIUM",
    "HIGH",
    "EMERGENCY",
]);

export const workOrders = pgTable("work_orders", {
    id: varchar("id", {length: 36}).$defaultFn(() => uuidv7()).primaryKey(),
    organizationId: varchar("organization_id", {length: 36}).notNull().references(() => organizations.id, {onDelete: "restrict"}),
    propertyId: varchar("property_id", {length: 36}).notNull().references(() => properties.id, {onDelete: "restrict"}),
    unitId: varchar("unit_id", {length: 36}).references(() => units.id, {onDelete: "set null"}),
    vendorId: varchar("vendor_id", {length: 36}).references(() => vendors.id, {onDelete: "set null"}),

    // Work Order Identification & Details
    workOrderNumber: varchar("work_order_number", {length: 100}).notNull(),
    title: varchar("title", {length: 255}).notNull(),
    description: text("description"),

    // Classification & State
    status: workOrderStatusEnum("status").default("DRAFT").notNull(),
    priority: workOrderPriorityEnum("priority").default("MEDIUM").notNull(),

    // Dispatch Scheduling
    scheduledStartDate: timestamp("scheduled_start_date", { mode: "date",}),

    // Compliance Audit Override
    complianceOverride: boolean("compliance_error").default(false).notNull(),
    complianceOverrideReason: text("compliance_override_reason"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
    deletedAt: timestamp("deleted_at"),
}, (table) => [
    index("idx_work_orders_organization_id").on(table.organizationId),
    index("idx_work_orders_property_id").on(table.propertyId),
    index("idx_work_orders_vendor_id").on(table.vendorId),
    index("idx_work_orders_org_status").on(table.organizationId, table.status),

    uniqueIndex("uq_work_orders_org_number_active").on(table.organizationId, table.workOrderNumber).where(sql`${table.deletedAt} IS NULL`),
])

export type WorkOrder = typeof workOrders.$inferSelect;
export type NewWorkOrder = typeof workOrders.$inferInsert;