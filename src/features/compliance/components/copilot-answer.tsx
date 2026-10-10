import { WorkspaceCard } from "@/components/common";
import type { GroundedAnswer } from "@/dto/assistant/assistant.dto";

import { formatComplianceLabel } from "../utils/compliance-display";

export function CopilotAnswer({ answer }: { answer: GroundedAnswer }) {
  return (
    <WorkspaceCard title="Compliance copilot">
      <p className="text-sm whitespace-pre-wrap">{answer.answer}</p>
      {answer.insufficientEvidence && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          The assistant marked this answer as having insufficient evidence.
        </p>
      )}
      {answer.missingInformation.length > 0 && (
        <div className="mt-3 text-sm">
          <p className="font-medium">Missing information</p>
          <ul className="mt-1 list-disc pl-5 text-muted-foreground">
            {answer.missingInformation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        Decision {answer.governance.decisionId} ·{" "}
        {formatComplianceLabel(answer.governance.automationLevel)}
        {answer.governance.requiresApproval ? " · approval required" : ""}
      </p>
    </WorkspaceCard>
  );
}
