import {pgTable, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7"

export const organizationStatusEnum = pgEnum("organization_status", [
    "active",
    "suspended",
    "canceled",
]);

export const organizations = pgTable("organizations", {
    id: varchar("id", {length: 36}).$defaultFn(() => uuidv7()).primaryKey(),
    name: varchar("name", {length: 255}).notNull(),
    slug: varchar("slug", {length: 255}).notNull().unique(),
    status: organizationStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),

    clerkOrganizationId: varchar("clerk_organization_id", {length: 255}).unique(),
});

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;