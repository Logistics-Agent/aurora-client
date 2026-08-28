import { StatusBadge } from "@/components/common";
import { PageHeader } from "@/components/layout";
import { CommercialSummary } from "../components/commercial-summary";
import { NegotiationOffers } from "../components/negotiation-offers";

export function NegotiationsPage() {
  return (
    <>
      <PageHeader
        title="Negotiations"
        description="Compare carrier offers with explicit human approval."
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
