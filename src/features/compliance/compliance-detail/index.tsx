import { StatusBadge } from "@/components/common";
import { PageHeader } from "@/components/layout";
import { FindingReview } from "../components/finding-review";

export function ComplianceDetailPage({ findingId }: { findingId: string }) {
  return (
    <>
      <PageHeader
        breadcrumb={["Compliance", findingId]}
        title={findingId}
        description="Finding evidence and explicit human resolution."
        actions={<StatusBadge label="Review required" intent="critical" />}
      />
      <FindingReview initialFindingId={findingId} />
    </>
  );
}
