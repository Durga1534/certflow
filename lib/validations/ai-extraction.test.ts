import { describe, expect, it } from "vitest";
import { coiExtractionSchema } from "./ai-extraction";

describe("COI extraction validation", () => {
    it("applies the general liability default", () => {
        const result = coiExtractionSchema.parse({
            insuredName: "Acme Services",
            insurerName: "Northstar Insurance",
            policyNumber: "POL-123",
            effectiveDate: "2026-01-01",
            expiryDate: "2027-01-01",
            generalAggregateLimit: 2000000,
            eachOccurenceLimit: 1000000,
            extractionConfidence: 0.98,
            extractionNotes: null,
        });

        expect(result.policyType).toBe("GENERAL_LIABILITY");
    });

    it("rejects confidence values outside the model contract", () => {
        const input = {
            insuredName: null,
            insurerName: null,
            policyNumber: null,
            policyType: "UNKNOWN" as const,
            effectiveDate: null,
            expiryDate: null,
            generalAggregateLimit: null,
            eachOccurenceLimit: null,
            extractionConfidence: 1.01,
            extractionNotes: null,
        };

        expect(() => coiExtractionSchema.parse(input)).toThrow();
        expect(() => coiExtractionSchema.parse({ ...input, extractionConfidence: -0.01 })).toThrow();
    });
});
