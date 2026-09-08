import {pgTable, varchar, timestamp, index, pgEnum } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const userRoleEnum = pgEnum("user_role", [
    "admin",
    "property_manager",
    "auditor",
]);

export const users = pgTable(
    "users",
    {
        id: varchar("id", {length: 255}).primaryKey(),
        organizationId: varchar("organization_id", {length: 36}).notNull().references(() => organizations.id, {onDelete: "restrict"}),
        email: varchar("email", {length: 255}).notNull(),
        firstName: varchar("first_name", {length: 255}),
        lastName: varchar("last_name", {length: 255}),
        role: userRoleEnum("role").default("property_manager").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
        deletedAt: timestamp("deleted_at"), 
    },
    (table) => [
        index("idx_users_organization_id").on(table.organizationId),
        index("idx_users_email").on(table.email),
    ]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;