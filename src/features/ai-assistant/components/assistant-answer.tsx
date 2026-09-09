import type { AssistantQueryResponse } from "@/api/services/assistant.service";
import { StatusBadge, WorkspaceCard } from "@/components/common";

export function AssistantAnswer({ response }: { response: AssistantQueryResponse }) {
  return (
    <WorkspaceCard title="Grounded answer">
      <p className="text-sm whitespace-pre-wrap">{response.answer}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge
          label={response.insufficientEvidence ? "Insufficient evidence" : "Evidence found"}
          intent={response.insufficientEvidence ? "warning" : "success"}
        />
        <StatusBadge
          label={response.governance.requiresApproval ? "Approval required" : "Assisted"}
          intent={response.governance.requiresApproval ? "critical" : "ai"}
        />
      </div>
      {response.missingInformation.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-medium">Missing information</p>
          <ul className="mt-1 list-disc pl-5">
            {response.missingInformation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {(response.regulatoryCitations.length > 0 || response.knowledgeReferences.length > 0) && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Sources
          </p>
          {response.regulatoryCitations.map((citation) => (
            <article
              key={`${citation.documentVersionId}:${citation.chunkId}`}
              className="rounded-lg border border-border p-3 text-sm"
            >
              <p className="font-medium">{citation.title}</p>
              <p className="mt-1 text-muted-foreground">
                {citation.authority} · {citation.section || "Section unavailable"}
              </p>
              <p className="mt-2">{citation.excerpt}</p>
            </article>
          ))}
          {response.knowledgeReferences.map((reference) => (
            <article
              key={`${reference.documentVersionId}:${reference.chunkId}`}
              className="rounded-lg border border-border p-3 text-sm"
            >
              <p className="font-medium">{reference.title}</p>
              <p className="mt-1 text-muted-foreground">
                {reference.category} · {reference.section || "Section unavailable"}
              </p>
              <p className="mt-2">{reference.excerpt}</p>
            </article>
          ))}
        </div>
      )}
      {response.conflicts.length > 0 && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Conflicting evidence was returned. Resolve the conflict before taking action.
        </p>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        Decision {response.governance.decisionId} · trace {response.retrievalTraceId}
      </p>
    </WorkspaceCard>
  );
}
