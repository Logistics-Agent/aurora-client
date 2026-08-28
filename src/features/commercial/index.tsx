import { BillingPage as BillingComposition } from "./billing";
import { CostEstimatePage as CostEstimateComposition } from "./cost-estimate";
import { InvoiceDetailPage as InvoiceDetailComposition } from "./invoice-detail";
import { NegotiationDetailPage as NegotiationDetailComposition } from "./negotiation-detail";
import { NegotiationsPage as NegotiationsComposition } from "./negotiations";

export function CostEstimatePage() {
  return <CostEstimateComposition />;
}

export function NegotiationsPage() {
  return <NegotiationsComposition />;
}

export function NegotiationDetailPage({
  negotiationId,
}: {
  negotiationId: string;
}) {
  return <NegotiationDetailComposition negotiationId={negotiationId} />;
}

export function BillingPage() {
  return <BillingComposition />;
}

export function InvoiceDetailPage({ invoiceId }: { invoiceId: string }) {
  return <InvoiceDetailComposition invoiceId={invoiceId} />;
}
