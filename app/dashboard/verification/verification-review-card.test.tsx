import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { rejectDocumentAction, verifyDocumentAction } from "@/actions/verification";
import { VerificationReviewCard } from "./verification-review-card";

vi.mock("@/actions/verification", () => ({
    rejectDocumentAction: vi.fn().mockResolvedValue({ success: true }),
    verifyDocumentAction: vi.fn().mockResolvedValue({ success: true }),
}));

const document = {
    id: "12345678-1234-1234-1234-123456789012",
    fileName: "certificate.pdf",
    documentType: "COI",
    documentNumber: "POL-123",
    issueDate: "2026-01-01",
    expiryDate: "2027-01-01",
    extractedData: null,
};

function renderCard() {
    return render(
        <VerificationReviewCard
            document={document}
            vendorName="Acme Services"
            previewUrl="https://example.com/certificate.pdf"
        />
    );
}

describe("VerificationReviewCard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders document context and preview link", () => {
        renderCard();

        expect(screen.getByRole("heading", { name: "Acme Services" })).toBeInTheDocument();
        expect(screen.getByText("certificate.pdf")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Preview Document" })).toHaveAttribute(
            "href",
            "https://example.com/certificate.pdf"
        );
    });

    it("sends edited fields when approving a document", async () => {
        const user = userEvent.setup();
        renderCard();

        const policyInput = screen.getByPlaceholderText("Policy Number");
        const expiryInput = screen.getByLabelText("Expiration Date *");
        await user.clear(policyInput);
        await user.type(policyInput, "POL-456");
        await user.clear(expiryInput);
        await user.type(expiryInput, "2028-06-30");
        await user.click(screen.getByRole("button", { name: "Approve & Verify" }));

        expect(verifyDocumentAction).toHaveBeenCalledWith({
            documentId: document.id,
            documentType: "COI",
            documentNumber: "POL-456",
            expiryDate: "2028-06-30",
            issueDate: "2026-01-01",
        });
    });

    it("requires an expiration date before approval", () => {
        render(
            <VerificationReviewCard
                document={{ ...document, expiryDate: null }}
                vendorName="Acme Services"
                previewUrl="https://example.com/certificate.pdf"
            />
        );

        expect(screen.getByRole("button", { name: "Approve & Verify" })).toBeDisabled();
    });

    it("requires a rejection reason and sends it when confirmed", async () => {
        const user = userEvent.setup();
        renderCard();

        await user.click(screen.getByRole("button", { name: "Reject Document" }));
        const confirmButton = screen.getByRole("button", { name: "Confirm Rejection" });
        expect(confirmButton).toBeDisabled();

        await user.type(screen.getByPlaceholderText("Reason for rejection..."), "Expired certificate");
        await user.click(confirmButton);

        expect(rejectDocumentAction).toHaveBeenCalledWith({
            documentId: document.id,
            rejectReason: "Expired certificate",
        });
    });
});
