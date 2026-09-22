import { describe, expect, it } from "vitest";
import { createPropertySchema, createUnitSchema, updateUnitSchema } from "./properties";

const propertyId = "12345678-1234-1234-1234-123456789012";

describe("property and unit validation", () => {
    it("trims property names and defaults the country", () => {
        expect(createPropertySchema.parse({ name: "  Maple House  " })).toMatchObject({
            name: "Maple House",
            country: "CA",
        });
    });

    it("rejects invalid property and unit identifiers", () => {
        expect(() => createPropertySchema.parse({ name: "A" })).toThrow();
        expect(() => createPropertySchema.parse({ name: "Maple House", country: "CAN" })).toThrow();
        expect(() => createUnitSchema.parse({ propertyId: "bad", unitNumber: "101" })).toThrow();
        expect(() => createUnitSchema.parse({ propertyId, unitNumber: "" })).toThrow();
    });

    it("does not require propertyId for unit updates", () => {
        expect(updateUnitSchema.parse({ unitNumber: "101" })).toEqual({ unitNumber: "101" });
    });
});
