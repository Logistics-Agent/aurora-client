import { PageHeader } from "@/components/layout";

import { FindingReview } from "../components/finding-review";

export function ComplianceDetailPage({ findingId }: { findingId: string }) {
  return (
    <>
      <PageHeader
        breadcrumb={["Compliance", findingId]}
        title={findingId}
        description="Load the persisted evaluation that contains this finding to inspect its evidence."
      />
      <FindingReview initialEvaluationId={findingId} />
    </>
  );
}
