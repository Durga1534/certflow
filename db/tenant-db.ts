import { eq, and, isNull, SQL } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
import { db } from "./index";
import { properties, vendors, vendorDocuments, workOrders } from "./schema";
import { TenantContext } from "./tenant-context";

/**
 * Creates a tenant-scoped database client wrapper.
 * Enforces multi-tenant isolation and active record filtering by default.
 */
export function createTenantDb(context: TenantContext) {
  const { organizationId } = context;

  if (!organizationId) {
    throw new Error("[TenantDB Security Violation] Attempted to instantiate TenantDB without an organizationId.");
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

      async create(data: Omit<typeof properties.$inferInsert, "id" | "organizationId" | "createdAt" | "updatedAt">) {
        const [inserted] = await db
          .insert(properties)
          .values({
            ...data,
            organizationId,
          })
          .returning();
        return inserted;
      },

      async update(id: string, data: Partial<Omit<typeof properties.$inferInsert, "id" | "organizationId">>) {
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

      async create(data: Omit<typeof vendors.$inferInsert, "id" | "organizationId" | "createdAt" | "updatedAt">) {
        const [inserted] = await db
          .insert(vendors)
          .values({
            ...data,
            organizationId,
          })
          .returning();
        return inserted;
      },

      async update(id: string, data: Partial<Omit<typeof vendors.$inferInsert, "id" | "organizationId">>) {
        const [updated] = await db
          .update(vendors)
          .set(data)
          .where(withTenantGuard(vendors, eq(vendors.id, id)))
          .returning();
        return updated ?? null;
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

      async create(data: Omit<typeof vendorDocuments.$inferInsert, "id" | "organizationId" | "createdAt" | "updatedAt">) {
        const [inserted] = await db
          .insert(vendorDocuments)
          .values({
            ...data,
            organizationId,
          })
          .returning();
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

      async create(data: Omit<typeof workOrders.$inferInsert, "id" | "organizationId" | "createdAt" | "updatedAt">) {
        const [inserted] = await db
          .insert(workOrders)
          .values({
            ...data,
            organizationId,
          })
          .returning();
        return inserted;
      },
    },
  };
}

export type TenantDb = ReturnType<typeof createTenantDb>;