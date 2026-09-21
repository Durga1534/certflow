import { db } from "@/db";
import { auditLogs, auditActionEnum } from "@/db/schema/audit_logs";
import { uuidv7 } from "uuidv7";
import { headers } from "next/headers";

type AuditAction = (typeof auditActionEnum.enumValues)[number];

interface LogAuditEventParams {
    organizationId: string;
    actorUserId: string;
    action: AuditAction;
    entityType: string;
    entityId: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}

// Asynchronously logs a compliance audit event. Captures incoming request headers when available.
export async function logAuditEvent({
    organizationId,
    actorUserId,
    action,
    entityType,
    entityId,
    before,
    after,
    metadata,
} : LogAuditEventParams): Promise<void> {
    try {
        const headerList = await headers();
        const ipAddress = headerList.get("x-forwarded-for")?.split(",")[0] || headerList.get("x-real-ip") || "unknown";
        const userAgent = headerList.get("user-agent") || "unknown";

        await db.insert(auditLogs).values({
            id: uuidv7(),
            organizationId,
            actorUserId,
            actorIpAddress: ipAddress,
            actorUserAgent: userAgent,
            action,
            entityType,
            entityId,
            changes: {
                ...(before && { before }),
                ...(after && { after }),
                ...(metadata && { metadata }),
            }
        })
    } catch (error) {
        console.error("[Audit System Failure] Failed to persist audit log entry: ", error);
    }
}