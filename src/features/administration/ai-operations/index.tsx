import { StatusBadge, WorkspaceCard } from "@/components/common";
import { PageHeader } from "@/components/layout";
import { AdminRecords } from "../components/admin-records";

export function AiOperationsPage() {
  return (
    <>
      <PageHeader
        title="AI Operations"
        description="Review explainable AI executions and their human-review state."
        actions={<StatusBadge label="1 needs review" intent="warning" />}
      />
      <WorkspaceCard title="Executions">
        <AdminRecords />
      </WorkspaceCard>
    </>
  );
}
