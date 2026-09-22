import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VendorTable } from "./vendor-table";

describe("VendorTable", () => {
    it("renders vendor information and compliance status", () => {
        render(
            <VendorTable
              initialVendors={[
                {
                    id: "vendor1",
                    name: "Acme Services",
                    contactName: "Jane Doe",
                    email: "jane@acme.com",
                    phone: "123-456-7890",
                    status: "active",
                    complianceStatus: "compliant",
                },
              ]}
            />  
        );

        expect(screen.getByText("Acme Services")).toBeInTheDocument();
        expect(screen.getByText("Jane Doe (jane@acme.com)")).toBeInTheDocument();
        expect(screen.getByText("Compliant")).toBeInTheDocument();
        expect(screen.getByText("active")).toBeInTheDocument();
    });

    it("renders the empty state when there are no vendors", () => {
        render(<VendorTable initialVendors={[]} />);

        expect (
            screen.getByText("No vendors found. Add your first vendor to start tracking compliance."),
        ).toBeInTheDocument();
    })
})