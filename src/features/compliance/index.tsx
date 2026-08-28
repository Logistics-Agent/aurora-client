import { ComplianceCenterPage as ComplianceCenterComposition } from "./compliance-center";
import { ComplianceDetailPage as ComplianceDetailComposition } from "./compliance-detail";

export function CompliancePage() {
  return <ComplianceCenterComposition />;
}

export function ComplianceDetailPage({ findingId }: { findingId: string }) {
  return <ComplianceDetailComposition findingId={findingId} />;
}
