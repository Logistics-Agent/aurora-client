import { StatusBadge, WorkspaceCard } from "@/components/common";
import type { ComplianceFinding } from "@/dto/compliance/compliance.dto";

import { complianceStatusIntent, formatComplianceLabel } from "../utils/compliance-display";

export function FindingDetails({ finding }: { finding: ComplianceFinding }) {
  return (
    <WorkspaceCard
      title={finding.title}
      action={
        <StatusBadge
          label={formatComplianceLabel(finding.severity)}
          intent={complianceStatusIntent(finding.severity)}
        />
      }
    >
      <p className="text-sm text-muted-foreground">{finding.description}</p>
      <div className="mt-4 space-y-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Regulatory citations ({finding.citations.length})
        </p>
        {finding.citations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No citations were returned for this finding.
          </p>
        ) : (
          finding.citations.map((citation) => (
            <article
              key={`${citation.documentVersionId}:${citation.chunkId}`}
              className="rounded-lg border border-border p-3 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{citation.title}</p>
                <span className="text-xs text-muted-foreground">
                  {Math.round(citation.relevanceScore * 100)}% relevant
                </span>
              </div>
              <p className="mt-1 text-muted-foreground">
                {citation.authority} · {citation.sectionLabel || "Section unavailable"}
              </p>
              <p className="mt-2">{citation.excerpt}</p>
            </article>
          ))
        )}
      </div>
    </WorkspaceCard>
  );
}
