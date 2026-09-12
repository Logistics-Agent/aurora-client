"use client";

import Link from "next/link";

import { StatusBadge, WorkspaceCard } from "@/components/common";
import { getApiErrorMessage } from "@/lib/api-error";
import { useComplianceEvaluationsQuery } from "@/hooks/queries/compliance/use-compliance-evaluations-query";

import { complianceStatusIntent, formatComplianceLabel } from "../utils/compliance-display";

function formatRequestedAt(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ComplianceEvaluationList({ onSelect }: { onSelect: (id: string) => void }) {
  const query = useComplianceEvaluationsQuery();

  return (
    <WorkspaceCard title="Recent evaluations">
      {query.isLoading && <p className="text-sm text-muted-foreground">Loading evaluations…</p>}
      {query.isError && (
        <p role="alert" className="text-sm text-destructive">
          {getApiErrorMessage(query.error)}
        </p>
      )}
      {query.isSuccess && query.data.items.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No compliance evaluations have been started for this tenant.
        </p>
      )}
      {query.isSuccess && query.data.items.length > 0 && (
        <div className="divide-y divide-border rounded-lg border">
          {query.data.items.map((evaluation) => (
            <div
              className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
              key={evaluation.evaluationId}
            >
              <button
                type="button"
                className="min-w-0 text-left hover:text-primary"
                onClick={() => onSelect(evaluation.evaluationId)}
              >
                <p className="truncate font-medium">Shipment {evaluation.externalShipmentId}</p>
                <p className="text-xs text-muted-foreground">
                  {formatRequestedAt(evaluation.requestedAt)} · v{evaluation.snapshotVersion}
                </p>
              </button>
              <div className="flex items-center gap-2">
                <StatusBadge
                  label={formatComplianceLabel(evaluation.status)}
                  intent={complianceStatusIntent(evaluation.status)}
                />
                <StatusBadge
                  label={formatComplianceLabel(evaluation.freshness)}
                  intent={evaluation.freshness === "STALE" ? "warning" : "success"}
                />
                <Link
                  className="text-xs font-medium text-primary hover:underline"
                  href={`/compliance/${encodeURIComponent(evaluation.evaluationId)}`}
                  onClick={() => onSelect(evaluation.evaluationId)}
                >
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </WorkspaceCard>
  );
}
