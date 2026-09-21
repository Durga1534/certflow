"use client";

import { useState, useTransition } from "react";
import { verifyDocumentAction, rejectDocumentAction } from "@/actions/verification";

interface ReviewCardProps {
  document: {
    id: string;
    fileName: string;
    documentType: string;
    documentNumber: string | null;
    issueDate: string | null;
    expiryDate: string | null;
    extractedData: unknown;
  };
  vendorName: string;
  previewUrl: string;
}

export function VerificationReviewCard({ document, vendorName, previewUrl }: ReviewCardProps) {
  const [isPending, startTransition] = useTransition();
  const [expiryDate, setExpiryDate] = useState(document.expiryDate || "");
  const [documentNumber, setDocumentNumber] = useState(document.documentNumber || "");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = () => {
    startTransition(async () => {
      await verifyDocumentAction({
        documentId: document.id,
        documentType: document.documentType,
        documentNumber,
        expiryDate,
        issueDate: document.issueDate,
      });
    });
  };

  const handleReject = () => {
    if (!rejectionReason) return;
    startTransition(async () => {
      await rejectDocumentAction({
        documentId: document.id,
        rejectReason: rejectionReason,
      });
    });
  };

  return (
    <div className="border rounded-xl p-5 bg-card shadow-sm flex flex-col justify-between space-y-4">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{vendorName}</h3>
            <p className="text-xs text-muted-foreground">{document.fileName}</p>
          </div>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-secondary px-2.5 py-1 rounded hover:bg-secondary/80 font-medium"
          >
            Preview Document
          </a>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Policy / Doc #
            </label>
            <input
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              className="w-full border rounded px-2.5 py-1.5 text-sm"
              placeholder="Policy Number"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Expiration Date *
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full border rounded px-2.5 py-1.5 text-sm"
              required
            />
          </div>
        </div>

        {isRejecting && (
          <div className="mt-3">
            <textarea
              placeholder="Reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full border border-destructive/50 rounded p-2 text-sm"
              rows={2}
            />
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end pt-3 border-t">
        {!isRejecting ? (
          <>
            <button
              onClick={() => setIsRejecting(true)}
              disabled={isPending}
              className="px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded font-medium"
            >
              Reject Document
            </button>
            <button
              onClick={handleApprove}
              disabled={isPending || !expiryDate}
              className="px-4 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 font-medium disabled:opacity-50"
            >
              {isPending ? "Verifying..." : "Approve & Verify"}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsRejecting(false)}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary rounded font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={isPending || !rejectionReason}
              className="px-4 py-1.5 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 font-medium disabled:opacity-50"
            >
              Confirm Rejection
            </button>
          </>
        )}
      </div>
    </div>
  );
}