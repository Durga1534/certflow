import { describe, expect, it } from "vitest";
import { createVendorSchema, updateVendorSchema } from "./vendors";

describe("vendor validation", () => {
    it("applies defaults and accepts every supported status", () => {
        const result = createVendorSchema.parse({ name: "  Acme Services  " });

        expect(result).toMatchObject({
            name: "Acme Services",
            status: "active",
            complianceStatus: "pending_review",
        });

        for (const complianceStatus of ["compliant", "non_compliant", "pending_review", "exempt"] as const) {
            expect(createVendorSchema.parse({ name: "Acme Services", complianceStatus }).complianceStatus)
                .toBe(complianceStatus);
        }
    });

    it("rejects invalid values and boundary violations", () => {
        expect(() => createVendorSchema.parse({ name: "A" })).toThrow();
        expect(() => createVendorSchema.parse({ name: "Acme Services", email: "invalid" })).toThrow();
        expect(() => createVendorSchema.parse({ name: "Acme Services", complianceStatus: "extempt" })).toThrow();
        expect(() => createVendorSchema.parse({ name: "Acme Services", phone: "1".repeat(51) })).toThrow();
    });

    it("allows partial updates without applying create defaults", () => {
        expect(updateVendorSchema.parse({ email: "owner@example.com" })).toEqual({
            email: "owner@example.com",
        });
    });
});
