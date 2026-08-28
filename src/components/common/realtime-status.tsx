import { StatusBadge } from "./status-badge";

export type RealtimeState =
  | "live"
  | "stale"
  | "reconnecting"
  | "disconnected"
  | "offline"
  | "unavailable";

export function RealtimeStatus({
  state,
  lastUpdate,
  simulated = false,
}: {
  state: RealtimeState;
  lastUpdate?: string;
  simulated?: boolean;
}) {
  if (state === "live") {
    return (
      <StatusBadge
        label={simulated ? "Simulated current" : "Live"}
        intent="success"
      />
    );
  }
  const labels = {
    stale: "Stale",
    reconnecting: "Reconnecting",
    disconnected: "Disconnected",
    offline: "Offline",
    unavailable: "Unavailable",
  } as const;
  return (
    <span className="inline-flex items-center gap-2">
      <StatusBadge
        label={labels[state]}
        intent={state === "stale" ? "warning" : "neutral"}
      />
      {lastUpdate && (
        <span className="text-xs text-muted-foreground">
          Last update {lastUpdate}
        </span>
      )}
    </span>
  );
}
