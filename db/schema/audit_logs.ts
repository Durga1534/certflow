import { pgTable, varchar, timestamp, jsonb, index, pgEnum } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const auditActionEnum = pgEnum("audit_action", [
    "DOCUMENT_UPLOADED",
    "DOCUMENT_EXTRACTED",
    "DOCUMENT_VERIFIED",
    "DOCUMENT_REJECTED",
    "VENDOR_CREATED",
    "VENDOR_UPDATED",
    "VENDOR_COMPLIANCE_CHANGED",
    "PROPERTY_CREATED",
    "WORK_ORDER_CREATED",
]);

export const auditLogs = pgTable("audit_logs", {
    id: varchar("id", {length: 36}).primaryKey(),
    organizationId: varchar("organization_id", {length: 36}).notNull().references(() => organizations.id, {onDelete: "restrict"}),
    actorUserId: varchar("actor_user_id", {length: 255}).notNull(),
    actorIpAddress: varchar("actor_ip_address", {length: 45}),
    actorUserAgent: varchar("actor_user_agent", {length: 512}),

    // Action & Domain Entity Targets
    action: auditActionEnum("action").notNull(),
    entityType: varchar("entity_type", {length: 100}).notNull(),
    entityId: varchar("entity_id", {length: 36}).notNull(),

    // Structured Delta Snapshot
    changes: jsonb("changes").$type<{
        before?: Record<string, unknown>;
        after?: Record<string, unknown>;
        metadata?: Record<string, unknown>;
    }>(),

    createdAt: timestamp("created_at", {withTimezone: true, mode: "date"}).defaultNow().notNull(),
}, (table) => [
    index("idx_-audit_logs_organization_id").on(table.organizationId),
    index("idx_audit_logs_entity").on(table.entityType, table.entityId),
    index("idx_audit_logs_actor").on(table.actorUserId),
    index("idx_audit_logs_created_at").on(table.createdAt),
]);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;