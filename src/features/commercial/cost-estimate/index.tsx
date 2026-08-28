import { AiInsight, StatusBadge, WorkspaceCard } from "@/components/common";
import { PageHeader } from "@/components/layout";
import { CommercialSummary } from "../components/commercial-summary";
import { CostComposition } from "../components/cost-composition";

export function CostEstimatePage() {
  return (
    <>
      <PageHeader
        title="Cost Estimate"
        description="Commercial values remain scoped to shipment context and local mock state."
        actions={
          <StatusBadge label="Human approval required" intent="warning" />
        }
      />
      <CommercialSummary />
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <CostComposition />
        <WorkspaceCard title="Explainable recommendation">
          <AiInsight
            result="Estimated cost is within the expected lane range."
            confidence={79}
            reason="Comparable lane rates support the current estimate."
            sources={["Lane benchmark", "Shipment cost lines"]}
            timestamp="Updated locally"
            suggestedAction="Review before commercial approval"
          />
        </WorkspaceCard>
      </div>
    </>
  );
}
