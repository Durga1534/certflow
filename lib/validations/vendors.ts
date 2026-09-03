import { z } from "zod";

export const vendorStatusSchema = z.enum(["active", "inactive", "archived"]);
export const vendorComplianceStatusSchema = z.enum([
    "compliant",
    "non_compliant",
    "pending_review",
    "extempt",
]);

export const createVendorSchema = z.object({
    name: z.string({error: "Vendor company name is required"}).trim().min(2, "Vendor name must be at least 2 characters").max(255, "Vendor name cannot exceed 255 characters"),
    companyNumber: z.string().trim().max(100, "Company number cannot exceed 100 characters").optional().or(z.literal("")),
    contactName: z.string().trim().max(255, "Contact name cannot exceed 255 characters").optional().or(z.literal("")),
    email: z.string().trim().email("Invalied email address format").max(255, "Email cannot exceed 255 characters").optional().or(z.literal("")),
    phone: z.string().trim().max(50, "Phone number cannot exceed 50 characters").optional().or(z.literal("")),
    status: vendorStatusSchema.default("active"),
    complianceStatus: vendorComplianceStatusSchema.default("pending_review"),
    notes: z.string().trim().optional().or(z.literal("")),
});

export const updateVendorSchema = createVendorSchema.partial();

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;