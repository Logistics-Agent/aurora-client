import { AiInsight, StatusBadge, WorkspaceCard } from "@/components/common";
import { PageHeader } from "@/components/layout";

export function AiExecutionDetailPage({
  executionId,
}: {
  executionId: string;
}) {
  return (
    <>
      <PageHeader
        breadcrumb={["AI Operations", executionId]}
        title={executionId}
        description="Explainable execution detail with explicit human-review context."
        actions={<StatusBadge label="Needs review" intent="warning" />}
      />
      <WorkspaceCard title="Execution result">
        <AiInsight
          result="A route recommendation was prepared for SHP-2026-00128."
          confidence={79}
          reason="Port schedule and shipment constraints matched the recommended route."
          sources={["Shipment constraints", "Port schedule"]}
          timestamp="Prepared locally"
          suggestedAction="Review before operational use"
        />
      </WorkspaceCard>
    </>
  );
}
