"use server";

import { revalidatePath } from "next/cache";
import { getTenantDb } from "@/lib/auth/get-tenant-db";
import { units } from "@/db/schema";
import { createPropertySchema, createUnitSchema, type CreatePropertyInput, type CreateUnitInput } from "@/lib/validations/properties";

export async function createPropertyAction(input: CreatePropertyInput) {
    const tenantDb = await getTenantDb();
    const validatedInput = createPropertySchema.parse(input);

    const property = await tenantDb.properties.create({
        name: validatedInput.name,
        addressLine1: validatedInput.addressLine1 || null,
        addressLine2: validatedInput.addressLine2 || null,
        city: validatedInput.city || null,
        stateProvince: validatedInput.stateProvince || null,
        postalCode: validatedInput.postalCode || null,
        country: validatedInput.country || "CA",
    });

    revalidatePath("/dashboard/properties");

    return {
        id: property.id,
        name: property.name,
        organizationId: property.organizationId,
        addressLine1: property.addressLine1,
        addressLine2: property.addressLine2,
        city: property.city,
        stateProvince: property.stateProvince,
        postalCode: property.postalCode,
        country: property.country,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
        deletedAt: property.deletedAt,
    };
}

export async function createUnitAction(input: CreateUnitInput) {
    const tenantDb = await getTenantDb();
    const validatedInput = createUnitSchema.parse(input);

    const property = await tenantDb.properties.findById(validatedInput.propertyId);
    if (!property) {
        throw new Error("Property not found or cross-tenant access prohibited.");
    }

    const [insertedUnit] = await tenantDb.db
        .insert(units)
        .values({
            organizationId: tenantDb.organizationId,
            propertyId: validatedInput.propertyId,
            unitNumber: validatedInput.unitNumber,
            notes: validatedInput.notes ?? null,
        })
        .returning();

    revalidatePath("/dashboard/properties");
    return insertedUnit;
}