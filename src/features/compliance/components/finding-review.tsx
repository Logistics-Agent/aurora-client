"use client";

import { useState } from "react";
import {
  ConfirmActionDialog,
  StatusBadge,
  WorkspaceCard,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { complianceFindingMocks, resolveFinding } from "../mock";

export function FindingReview({
  initialFindingId,
}: {
  initialFindingId?: string;
}) {
  const [findings, setFindings] = useState(complianceFindingMocks);
  const [selected, setSelected] = useState(
    complianceFindingMocks.find(({ id }) => id === initialFindingId) ??
      complianceFindingMocks[0],
  );
  const [confirm, setConfirm] = useState(false);

  return (
    <>
      <WorkspaceCard title="Findings">
        <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-3">
            {findings.map((finding) => (
              <button
                type="button"
                key={finding.id}
                onClick={() => setSelected(finding)}
                className={`w-full rounded-lg border p-4 text-left ${selected.id === finding.id ? "border-primary bg-blue-50" : "border-border"}`}
              >
                <div className="flex justify-between gap-3">
                  <span className="font-semibold">{finding.title}</span>
                  <StatusBadge
                    label={finding.state}
                    intent={
                      finding.state === "Resolved" ? "success" : "critical"
                    }
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {finding.id} · {finding.severity}
                </p>
              </button>
            ))}
          </div>
          <div>
            <p className="font-semibold">{selected.title}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Evidence is visible to the reviewer. Resolution remains a local
              mock action.
            </p>
            <Button
              className="mt-5 w-full"
              disabled={selected.state === "Resolved"}
              onClick={() => setConfirm(true)}
            >
              Resolve finding
            </Button>
          </div>
        </div>
      </WorkspaceCard>
      <ConfirmActionDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`Resolve ${selected.title}?`}
        consequence="This updates only the local fixture state."
        confirmLabel="Resolve"
        onConfirm={() => {
          const resolved = resolveFinding(selected);
          setFindings((current) =>
            current.map((finding) =>
              finding.id === selected.id ? resolved : finding,
            ),
          );
          setSelected(resolved);
          setConfirm(false);
        }}
      />
    </>
  );
}
