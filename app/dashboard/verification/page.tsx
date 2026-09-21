import { getPendingVerificationQueueAction } from "@/actions/verification";
import { VerificationReviewCard } from "./verification-review-card";

export default async function VerificationQueuePage() {
  const pendingItems = await getPendingVerificationQueueAction();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Compliance Verification Queue</h1>
          <p className="text-muted-foreground text-sm">
            Review AI-extracted compliance certificates and sign off on verification.
          </p>
        </div>
        <div className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
          {pendingItems.length} Pending Review
        </div>
      </div>

      {pendingItems.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-card">
          <p className="text-muted-foreground">Queue clear! No documents awaiting verification.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingItems.map((item) => (
            <VerificationReviewCard
              key={item.document.id}
              document={item.document}
              vendorName={item.vendorName}
              previewUrl={item.previewUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}