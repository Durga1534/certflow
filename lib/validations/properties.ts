import { z } from "zod";

// Create Property Schema
export const createPropertySchema = z.object({
    name: z.string({ error: "Property name is required" }).trim().min(2, "Property name must be at least 2 characters").max(255, "Property name cannot exceed 255 characters"),
    addressLine1: z.string().trim().max(255, "Address Line 1 cannot exceed 255 characters").optional().or(z.literal("")),
    addressLine2: z.string().trim().max(255, "Address Line 2 cannot exceed 255 characters").optional().or(z.literal("")),
    city: z.string().trim().max(100, "City cannot exceed 100 characters").optional().or(z.literal("")),
    stateProvince: z.string().trim().max(100, "State/Province cannot exceed 100 characters").optional().or(z.literal("")),
    postalCode: z.string().trim().max(20, "Postal code cannot exceed 20 characters").optional().or(z.literal("")),
    country: z.string().trim().length(2, "Country must be a 2-letter ISO code").default("CA")
});

export const updatePropertySchema = createPropertySchema.partial();

// Create Unit Schema
export const createUnitSchema = z.object({
    propertyId: z.string({ error: "Property ID is required" }).length(36, "Invalid property ID"),
    unitNumber: z.string({ error: "Unit number is required" }).trim().min(1, "Unit number cannot be empty").max(50, "Unit number cannot exceed 50 characters"),
    notes: z.string().trim().optional().or(z.literal("")),
}) ;

export const updateUnitSchema = createUnitSchema.omit({propertyId: true}).partial();

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;