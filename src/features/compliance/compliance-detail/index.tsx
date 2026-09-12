import { PageHeader } from "@/components/layout";

import { FindingReview } from "../components/finding-review";

export function ComplianceDetailPage({ evaluationId }: { evaluationId: string }) {
  return (
    <>
      <PageHeader
        breadcrumb={["Compliance", evaluationId]}
        title={evaluationId}
        description="Inspect the persisted evaluation, evidence and freshness state."
      />
      <FindingReview initialEvaluationId={evaluationId} />
    </>
  );
}
