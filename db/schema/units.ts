import {pgTable, varchar, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import {sql} from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { organizations } from "./organizations";
import { properties } from "./properties";

export const units = pgTable("units", {
    id: varchar("id", {length: 36}).$defaultFn(() => uuidv7()).primaryKey(),
    //Explicit tenant boundary for direct authorization checks
    organizationId: varchar("organization_id", {length: 36}).notNull().references(() => organizations.id, {onDelete: "restrict"}),
    //Parent property relationship
    propertyId: varchar("property_id", {length: 36}).notNull().references(() => properties.id, {onDelete: "restrict"}),
    unitNumber: varchar("unit_number", {length: 50}).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
    deletedAt: timestamp("deleted_at"),
}, (table) => [
    // Fast tenant filter
    index("idx_units_organization_id").on(table.organizationId),

    // Fast property unit listing
    index("idx_units_property_id").on(table.propertyId),

    // Enforce unique unit designantion per property for active records
    uniqueIndex("uq_units_property_number_active").on(table.propertyId, table.unitNumber).where(sql`${table.deletedAt} IS NULL`),
]);

export type Unit = typeof units.$inferSelect;
export type NewUnit = typeof units.$inferInsert;