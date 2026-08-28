import { StatusBadge } from "@/components/common";
import { PageHeader } from "@/components/layout";
import { CommercialSummary } from "../components/commercial-summary";
import { NegotiationOffers } from "../components/negotiation-offers";

export function NegotiationDetailPage({
  negotiationId,
}: {
  negotiationId: string;
}) {
  return (
    <>
      <PageHeader
        breadcrumb={["Negotiations", negotiationId]}
        title={negotiationId}
        description="Carrier negotiation detail for SHP-2026-00128."
        actions={
          <StatusBadge label="Human approval required" intent="warning" />
        }
      />
      <CommercialSummary />
      <div className="mt-5">
        <NegotiationOffers />
      </div>
    </>
  );
}
