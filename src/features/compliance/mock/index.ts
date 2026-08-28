// UI-only fixture until backend integration phase.
export type ComplianceFinding = {
  id: string;
  title: string;
  severity: "critical" | "warning";
  state: "Open" | "Resolved";
};

export const complianceFindingMocks: ComplianceFinding[] = [
  {
    id: "FND-2848",
    title: "Commercial invoice mismatch",
    severity: "critical",
    state: "Open",
  },
  {
    id: "FND-2849",
    title: "HS code needs review",
    severity: "warning",
    state: "Open",
  },
];

export function resolveFinding(finding: ComplianceFinding): ComplianceFinding {
  return { ...finding, state: "Resolved" };
}
