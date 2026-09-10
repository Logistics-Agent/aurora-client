import { StatusBadge, WorkspaceCard } from "@/components/common";
import type { ComplianceEvaluation } from "@/dto/compliance/compliance.dto";

import { complianceStatusIntent, formatComplianceLabel } from "../utils/compliance-display";

export function EvaluationSummary({ evaluation }: { evaluation: ComplianceEvaluation }) {
  return (
    <WorkspaceCard title="Evaluation summary">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">Status</p>
          <StatusBadge
            label={formatComplianceLabel(evaluation.status)}
            intent={complianceStatusIntent(evaluation.status)}
          />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Risk level</p>
          <StatusBadge
            label={formatComplianceLabel(evaluation.riskLevel)}
            intent={complianceStatusIntent(evaluation.riskLevel)}
          />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Evidence</p>
          <StatusBadge
            label={formatComplianceLabel(evaluation.evidenceSufficiency)}
            intent={complianceStatusIntent(evaluation.evidenceSufficiency)}
          />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Confidence</p>
          <p className="mt-1 font-semibold tabular-nums">
            {Math.round(evaluation.complianceConfidence * 100)}%
          </p>
        </div>
      </div>
      {evaluation.missingDocuments.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-medium">Missing documents</p>
          <ul className="mt-1 list-disc pl-5">
            {evaluation.missingDocuments.map((document) => (
              <li key={document}>{document}</li>
            ))}
          </ul>
        </div>
      )}
      {evaluation.assumptions.length > 0 && (
        <div className="mt-4 rounded-lg border border-border p-3 text-sm">
          <p className="font-medium">Assumptions</p>
          <ul className="mt-1 list-disc pl-5 text-muted-foreground">
            {evaluation.assumptions.map((assumption) => (
              <li key={assumption}>{assumption}</li>
            ))}
          </ul>
        </div>
      )}
    </WorkspaceCard>
  );
}
