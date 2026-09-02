import {pgTable, varchar, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { uuidv7 } from "uuidv7"
import { organizations } from "./organizations";

export const properties = pgTable("properties", {
    id: varchar("id", {length: 36}).$defaultFn(() => uuidv7()).primaryKey(),
    organizationId: varchar("organization_id", {length: 36}).notNull().references(() => organizations.id, {onDelete: "restrict"}),
    name: varchar("name", {length: 255}).notNull(),


    // Address Details
    addressLine1: varchar("address_line1", {length: 255}),
    addressLine2: varchar("address_line2", {length: 255}),
    city: varchar("city", {length: 100}),
    stateProvince: varchar("state_province", {length: 100}),
    postalCode: varchar("postal_code", {length: 20}),
    country: varchar("country", {length: 2}).default("CA"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
    deletedAt: timestamp("deleted_at"),
}, (table) => [
    // Fast lookup for all properties within an organization
    index("idx_properties_organization_id").on(table.organizationId),

    // Ensure property names are unique per tenant(excluding soft-deleted rows)
    uniqueIndex("uq_properties_org_name_active").on(table.organizationId, table.name).where(sql`${table.deletedAt} IS NULL` ),
]);

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;