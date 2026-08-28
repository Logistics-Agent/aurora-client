import { StatusBadge, WorkspaceCard } from "@/components/common";
import { PageHeader } from "@/components/layout";
import { CommercialSummary } from "../components/commercial-summary";
import { CostComposition } from "../components/cost-composition";

export function InvoiceDetailPage({ invoiceId }: { invoiceId: string }) {
  return (
    <>
      <PageHeader
        breadcrumb={["Billing", invoiceId]}
        title={invoiceId}
        description="Invoice detail scoped to shipment SHP-2026-00128."
        actions={<StatusBadge label="Pending" intent="warning" />}
      />
      <CommercialSummary />
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <CostComposition title="Invoice lines" />
        <WorkspaceCard title="Invoice status">
          <p className="font-semibold">Due 31 Aug</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Payment processing remains unavailable in this UI-only phase.
          </p>
        </WorkspaceCard>
      </div>
    </>
  );
}
