import { StatusBadge } from "@/components/common";
import { PageHeader } from "@/components/layout";
import { FindingReview } from "../components/finding-review";
import { complianceFindingMocks } from "../mock";

export function ComplianceCenterPage() {
  const openCount = complianceFindingMocks.filter(
    ({ state }) => state === "Open",
  ).length;

  return (
    <>
      <PageHeader
        title="Compliance Center"
        description="Exception-first compliance findings with explicit resolution."
        actions={<StatusBadge label={`${openCount} open`} intent="critical" />}
      />
      <FindingReview />
    </>
  );
}
