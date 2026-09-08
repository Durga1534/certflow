import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import {createTenantDb} from '@/db/tenant-db';
import { eq } from "drizzle-orm";

export async function getTenantDb() {
    const {userId, orgId} = await auth();

    if(!userId) {
        throw new Error("[Unauthorized] User is not authenticated.")
    }

    if(!orgId) {
        throw new Error("[Missing Tenant Context] User has not selected an active organization.");
    }

    // Resolve internal DB organationId from Clerk orgId
    const [targetOrg] = await db
      .select({id: organizations.id, status: organizations.status})
      .from(organizations)
      .where(eq(organizations.clerkOrganizationId, orgId))
      .limit(1);

      if(!targetOrg) {
        throw new Error("[Tenant Isolation Error] Active organization record not found in application database.");
      }

      if(targetOrg.status !== "active") {
        throw new Error("[Tenant Suspended] This organization account is currently inactive");
      }

      // Intantiate security wrapper
      return createTenantDb({
        organizationId: targetOrg.id,
        userId,
      });
}