import { WorkspaceCard } from "@/components/common";
import { PageHeader } from "@/components/layout";
import { AdminRecords } from "../components/admin-records";

export function AuditLogPage() {
  return (
    <>
      <PageHeader
        title="Audit Log"
        description="Administration records and role-aware actions."
      />
      <WorkspaceCard title="Records">
        <AdminRecords />
      </WorkspaceCard>
    </>
  );
}
