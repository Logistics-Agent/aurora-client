import { StatusBadge } from "./status-badge";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export function RiskBadge({ level }: { level: RiskLevel }) {
  const intent =
    level === "low" ? "success" : level === "medium" ? "warning" : "critical";
  return <StatusBadge label={`Risk · ${level}`} intent={intent} />;
}
