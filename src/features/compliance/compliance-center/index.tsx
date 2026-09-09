import { PageHeader } from "@/components/layout";

import { FindingReview } from "../components/finding-review";

export function ComplianceCenterPage() {
  return (
    <>
      <PageHeader
        title="Compliance Center"
        description="Inspect persisted evaluation findings with evidence and governance metadata."
      />
      <FindingReview />
    </>
  );
}
