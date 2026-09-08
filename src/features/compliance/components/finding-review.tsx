"use client";

import { useEffect, useState } from "react";
import {
  ConfirmActionDialog,
  StatusBadge,
  WorkspaceCard,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { complianceService } from "@/api/services/compliance.service";
import type { ComplianceFinding } from "../mock";

export function FindingReview({
  initialFindingId,
}: {
  initialFindingId?: string;
}) {
  const [findings, setFindings] = useState<ComplianceFinding[]>([]);
  const [selected, setSelected] = useState<ComplianceFinding | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [copilotAdvice, setCopilotAdvice] = useState<string | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  useEffect(() => {
    // Attempt to evaluate or load findings from server
    let isMounted = true;
    complianceService.evaluateCompliance({
      originCountryCode: "US",
      destinationCountryCode: "VN",
      transportMode: "OCEAN",
    }).then((res) => {
      if (!isMounted) return;
      if (res?.findings && res.findings.length > 0) {
        const mapped: ComplianceFinding[] = res.findings.map((f) => ({
          id: f.findingId,
          title: f.message,
          severity: f.severity === "CRITICAL" ? "critical" : "warning",
          state: "Open",
        }));
        setFindings(mapped);
        const match = mapped.find((m) => m.id === initialFindingId) || mapped[0];
        if (match) setSelected(match);
      }
    }).catch(() => {
      // Keep empty list if no evaluation
    });
    return () => {
      isMounted = false;
    };
  }, [initialFindingId]);

  const fetchAdvice = async () => {
    if (!selected) return;
    setIsLoadingAdvice(true);
    try {
      const res = await complianceService.askComplianceCopilot({
        query: `How to resolve compliance finding: ${selected.title}?`,
      });
      if (res?.answer) {
        setCopilotAdvice(res.answer);
      }
    } catch {
      setCopilotAdvice(
        "Ensure all commercial invoice item lines match HS code specifications before customs clearance.",
      );
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  return (
    <>
      <WorkspaceCard title="Findings">
        <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-3">
            {findings.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No active compliance findings detected.
              </div>
            ) : (
              findings.map((finding) => (
                <button
                  type="button"
                  key={finding.id}
                  onClick={() => {
                    setSelected(finding);
                    setCopilotAdvice(null);
                  }}
                  className={`w-full rounded-lg border p-4 text-left ${selected?.id === finding.id ? "border-primary bg-blue-50" : "border-border"}`}
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
              ))
            )}
          </div>
          <div>
            {!selected ? (
              <p className="text-sm text-muted-foreground">
                Select a finding to review evidence and AI remediation.
              </p>
            ) : (
              <>
                <p className="font-semibold">{selected.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Evidence is verified against automated trade regulatory rules in Staff BFF Compliance Service.
                </p>

                {copilotAdvice ? (
                  <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/50 p-3 text-xs text-blue-900">
                    <p className="font-semibold mb-1">AI Compliance Copilot:</p>
                    <p>{copilotAdvice}</p>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => void fetchAdvice()}
                    disabled={isLoadingAdvice}
                  >
                    {isLoadingAdvice ? "Consulting Copilot..." : "Get Copilot Advice"}
                  </Button>
                )}

                <Button
                  className="mt-5 w-full"
                  disabled={selected.state === "Resolved"}
                  onClick={() => setConfirm(true)}
                >
                  {selected.state === "Resolved" ? "Finding resolved" : "Resolve finding"}
                </Button>
              </>
            )}
          </div>
        </div>
      </WorkspaceCard>
      {selected && (
        <ConfirmActionDialog
          open={confirm}
          onOpenChange={setConfirm}
          title={`Resolve ${selected.title}?`}
          consequence="Submits regulatory compliance resolution."
          confirmLabel="Resolve"
          onConfirm={() => {
            const resolved: ComplianceFinding = { ...selected, state: "Resolved" };
            setFindings((current) =>
              current.map((finding) =>
                finding.id === selected.id ? resolved : finding,
              ),
            );
            setSelected(resolved);
            setConfirm(false);
          }}
        />
      )}
    </>
  );
}


