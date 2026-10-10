import { StatusBadge, WorkspaceCard } from "@/components/common";
import type { ComplianceFinding } from "@/dto/compliance/compliance.dto";

import { complianceStatusIntent, formatComplianceLabel } from "../utils/compliance-display";

export function FindingList({
  findings,
  selectedFindingId,
  onSelect,
}: {
  findings: ComplianceFinding[];
  selectedFindingId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <WorkspaceCard title={`Findings (${findings.length})`}>
      {findings.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No findings were returned by this evaluation.
        </p>
      ) : (
        <div className="space-y-2">
          {findings.map((finding) => (
            <button
              key={finding.findingId}
              type="button"
              className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted ${selectedFindingId === finding.findingId ? "border-primary bg-muted" : "border-border"}`}
              onClick={() => onSelect(finding.findingId)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{finding.title}</span>
                <StatusBadge
                  label={formatComplianceLabel(finding.severity)}
                  intent={complianceStatusIntent(finding.severity)}
                />
              </div>
              <span className="mt-1 block text-sm text-muted-foreground">
                {finding.description}
              </span>
            </button>
          ))}
        </div>
      )}
    </WorkspaceCard>
  );
}
