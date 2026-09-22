import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VendorTable } from "./vendor-table";

describe("VendorTable", () => {
    it("renders all vendor information and compliance statuses", () => {
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
                {
                    id: "vendor2",
                    name: "Northstar Plumbing",
                    contactName: null,
                    email: null,
                    phone: "555-0100",
                    status: "inactive",
                    complianceStatus: "non_compliant",
                },
                {
                    id: "vendor3",
                    name: "Elevate Inspections",
                    contactName: "Sam Lee",
                    email: null,
                    phone: null,
                    status: "archived",
                    complianceStatus: "pending_review",
                },
                {
                    id: "vendor4",
                    name: "Clearline Electric",
                    contactName: "Alex Kim",
                    email: "alex@clearline.com",
                    phone: null,
                    status: "active",
                    complianceStatus: "exempt",
                },
              ]}
            />  
        );

        expect(screen.getByText("Acme Services")).toBeInTheDocument();
        expect(screen.getByText("Jane Doe (jane@acme.com)")).toBeInTheDocument();
        expect(screen.getByText("555-0100")).toBeInTheDocument();
        expect(screen.getByText("Sam Lee")).toBeInTheDocument();
        expect(screen.getByText("Compliant")).toBeInTheDocument();
        expect(screen.getByText("Non-Compliant")).toBeInTheDocument();
        expect(screen.getByText("Pending Review")).toBeInTheDocument();
        expect(screen.getByText("Exempt")).toBeInTheDocument();
        expect(screen.getAllByText("active")).toHaveLength(2);
        expect(screen.getByText("inactive")).toBeInTheDocument();
        expect(screen.getByText("archived")).toBeInTheDocument();
    });

    it("renders an em dash when a vendor has no contact details", () => {
        render(
            <VendorTable
              initialVendors={[{
                  id: "vendor1",
                  name: "Acme Services",
                  contactName: "Jane Doe",
                  email: null,
                  phone: null,
                  status: "active",
                  complianceStatus: "compliant",
              }]}
            />
        );

        expect(screen.getByText("Jane Doe")).toBeInTheDocument();
        expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
    });

    it("renders the table headers and one row per vendor", () => {
        render(
            <VendorTable initialVendors={[{
                id: "vendor1",
                name: "Acme Services",
                contactName: null,
                email: "hello@acme.com",
                phone: null,
                status: "active",
                complianceStatus: "compliant",
            }]} />
        );

        const table = screen.getByRole("table");
        expect(within(table).getAllByRole("columnheader")).toHaveLength(4);
        expect(within(table).getAllByRole("row")).toHaveLength(2);
    });

    it("renders the empty state when there are no vendors", () => {
        render(<VendorTable initialVendors={[]} />);

        expect (
            screen.getByText("No vendors found. Add your first vendor to start tracking compliance."),
        ).toBeInTheDocument();
    })
})