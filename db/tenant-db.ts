import { eq, and, isNull, SQL } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
import { db } from "./index";
import { properties, vendors, vendorDocuments, workOrders } from "./schema";
import { TenantContext } from "./tenant-context";
import { logAuditEvent } from "@/lib/audit/logger";

/**
 * Creates a tenant-scoped database client wrapper.
 * Enforces multi-tenant isolation, soft-delete filtering, and audit logging.
 */
export function createTenantDb(context: TenantContext) {
  const { organizationId, userId } = context;

  if (!organizationId) {
    throw new Error(
      "[TenantDB Security Violation] Attempted to instantiate TenantDB without an organizationId."
    );
  }

  // Helper to append org context & soft-delete filter
  const withTenantGuard = <T extends PgTable>(
    table: T & { organizationId: any; deletedAt?: any }, // eslint-disable-line @typescript-eslint/no-explicit-any
    additionalConditions?: SQL
  ): SQL => {
    const baseConditions = [
      eq((table as any).organizationId, organizationId), // eslint-disable-line @typescript-eslint/no-explicit-any
      (table as any).deletedAt ? isNull((table as any).deletedAt) : undefined, // eslint-disable-line @typescript-eslint/no-explicit-any
    ].filter(Boolean) as SQL[];

    if (additionalConditions) {
      baseConditions.push(additionalConditions);
    }

    return and(...baseConditions)!;
  };

  return {
    organizationId,
    userId,
    db, // Exposes root db instance when interactive transactions are required

    properties: {
      async findMany(where?: SQL) {
        return db
          .select()
          .from(properties)
          .where(withTenantGuard(properties, where));
      },

      async findById(id: string) {
        const [result] = await db
          .select()
          .from(properties)
          .where(withTenantGuard(properties, eq(properties.id, id)))
          .limit(1);
        return result ?? null;
      },

      async create(
        data: Omit<
          typeof properties.$inferInsert,
          "id" | "organizationId" | "createdAt" | "updatedAt"
        >
      ) {
        const [inserted] = await db
          .insert(properties)
          .values({
            ...data,
            organizationId,
          })
          .returning();

        if (inserted && userId) {
          await logAuditEvent({
            organizationId,
            actorUserId: userId,
            action: "PROPERTY_CREATED",
            entityType: "properties",
            entityId: inserted.id,
            after: inserted,
          });
        }

        return inserted;
      },

      async update(
        id: string,
        data: Partial<Omit<typeof properties.$inferInsert, "id" | "organizationId">>
      ) {
        const [updated] = await db
          .update(properties)
          .set(data)
          .where(withTenantGuard(properties, eq(properties.id, id)))
          .returning();
        return updated ?? null;
      },

      async softDelete(id: string) {
        const [deleted] = await db
          .update(properties)
          .set({ deletedAt: new Date() })
          .where(withTenantGuard(properties, eq(properties.id, id)))
          .returning();
        return deleted ?? null;
      },
    },

    vendors: {
      async findMany(where?: SQL) {
        return db
          .select()
          .from(vendors)
          .where(withTenantGuard(vendors, where));
      },

      async findById(id: string) {
        const [result] = await db
          .select()
          .from(vendors)
          .where(withTenantGuard(vendors, eq(vendors.id, id)))
          .limit(1);
        return result ?? null;
      },

      async create(
        data: Omit<
          typeof vendors.$inferInsert,
          "id" | "organizationId" | "createdAt" | "updatedAt"
        >
      ) {
        const [inserted] = await db
          .insert(vendors)
          .values({
            ...data,
            organizationId,
          })
          .returning();

        if (inserted && userId) {
          await logAuditEvent({
            organizationId,
            actorUserId: userId,
            action: "VENDOR_CREATED",
            entityType: "vendors",
            entityId: inserted.id,
            after: inserted,
          });
        }

        return inserted;
      },

      async update(
        id: string,
        data: Partial<Omit<typeof vendors.$inferInsert, "id" | "organizationId">>
      ) {
        const [updated] = await db
          .update(vendors)
          .set(data)
          .where(withTenantGuard(vendors, eq(vendors.id, id)))
          .returning();
        return updated ?? null;
      },

      async updateComplianceStatus(
        vendorId: string,
        newStatus: "compliant" | "non_compliant" | "pending_review",
        reason?: string
      ) {
        const existing = await this.findById(vendorId);
        if (!existing) {
          throw new Error("Vendor not found or cross-tenant access denied.");
        }

        const [updated] = await db
          .update(vendors)
          .set({ complianceStatus: newStatus, updatedAt: new Date() })
          .where(withTenantGuard(vendors, eq(vendors.id, vendorId)))
          .returning();

        if (userId) {
          await logAuditEvent({
            organizationId,
            actorUserId: userId,
            action: "VENDOR_COMPLIANCE_CHANGED",
            entityType: "vendors",
            entityId: vendorId,
            before: { complianceStatus: existing.complianceStatus },
            after: { complianceStatus: updated.complianceStatus },
            metadata: { reason },
          });
        }

        return updated;
      },
    },

    vendorDocuments: {
      async findMany(where?: SQL) {
        return db
          .select()
          .from(vendorDocuments)
          .where(withTenantGuard(vendorDocuments, where));
      },

      async findById(id: string) {
        const [result] = await db
          .select()
          .from(vendorDocuments)
          .where(withTenantGuard(vendorDocuments, eq(vendorDocuments.id, id)))
          .limit(1);
        return result ?? null;
      },

      async create(
        data: Omit<
          typeof vendorDocuments.$inferInsert,
          "id" | "organizationId" | "createdAt" | "updatedAt"
        >
      ) {
        const [inserted] = await db
          .insert(vendorDocuments)
          .values({
            ...data,
            organizationId,
          })
          .returning();

        if (inserted && userId) {
          await logAuditEvent({
            organizationId,
            actorUserId: userId,
            action: "DOCUMENT_UPLOADED",
            entityType: "vendor_documents",
            entityId: inserted.id,
            after: inserted,
          });
        }

        return inserted;
      },
    },

    workOrders: {
      async findMany(where?: SQL) {
        return db
          .select()
          .from(workOrders)
          .where(withTenantGuard(workOrders, where));
      },

      async findById(id: string) {
        const [result] = await db
          .select()
          .from(workOrders)
          .where(withTenantGuard(workOrders, eq(workOrders.id, id)))
          .limit(1);
        return result ?? null;
      },

      async create(
        data: Omit<
          typeof workOrders.$inferInsert,
          "id" | "organizationId" | "createdAt" | "updatedAt"
        >
      ) {
        const [inserted] = await db
          .insert(workOrders)
          .values({
            ...data,
            organizationId,
          })
          .returning();

        if (inserted && userId) {
          await logAuditEvent({
            organizationId,
            actorUserId: userId,
            action: "WORK_ORDER_CREATED",
            entityType: "work_orders",
            entityId: inserted.id,
            after: inserted,
          });
        }

        return inserted;
      },
    },
  };
}

export type TenantDb = ReturnType<typeof createTenantDb>;