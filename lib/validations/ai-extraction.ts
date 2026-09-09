import { z } from "zod";

export const coiExtractionSchema = z.object({
    insuredName: z.string().nullable().describe("Legal name of the insured entity listed on the certificate."),
    insurerName: z.string().nullable().describe("Name of the primary insurance underwriting company"),
    policyNumber: z.string().nullable().describe("Policy identifier number"),
    policyType: z.enum(["GENERAL_LIABILITY", "WSIB_WORKERS_COMP", "AUTOMOBILE", "UMBRELLA", "PROPERTY", "UNKNOWN"]).default("GENERAL_LIABILITY"),
    effectiveDate: z.string().nullable().describe("Coverage start date in YYYY-MM-DD format"),
    expiryDate: z.string().nullable().describe("Coverage termination/expiration date in YYYY-MM-DD format"),
    generalAggregateLimit: z.number().nullable().describe("General aggregate coverage limit in numerical currency value"),
    eachOccurenceLimit: z.number().nullable().describe("Per-occurence coverage limit in numerical currency value"),
    extractionConfidence: z.number().min(0).max(1).describe("Overall extraction confidence score between 0.0 and 1.0"),
    extractionNotes: z.string().nullable().describe("Notes regarding unreadable text, missing fields, or ambiguity")
});

export type CoiExtractionResult = z.infer<typeof coiExtractionSchema>