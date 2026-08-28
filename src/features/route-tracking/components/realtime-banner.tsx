import { WifiOff } from "lucide-react";
import { RealtimeStatus } from "@/components/common";
import { Button } from "@/components/ui/button";
import type { RouteRealtimeState } from "../types";

export function RealtimeBanner({
  state,
  shipmentId,
  onReconnect,
}: {
  state: RouteRealtimeState;
  shipmentId?: string;
  onReconnect?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white/90 px-3 py-2 shadow-sm">
      <div className="flex items-center gap-2">
        {state !== "live" && <WifiOff className="size-4 text-amber-600" />}
        <RealtimeStatus
          state={state}
          lastUpdate={state === "stale" ? "18 mins ago" : undefined}
          simulated
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs text-muted-foreground">
          {shipmentId && `${shipmentId} · `}
          {state === "live"
            ? "Simulated GPS snapshot · updated 18 sec ago"
            : state === "stale"
              ? "Showing the last known GPS position"
              : state === "reconnecting"
                ? "Restoring the local GPS fixture"
                : "Live movement is not available"}
        </p>
        {state === "disconnected" && onReconnect && (
          <Button type="button" size="sm" onClick={onReconnect}>
            Reconnect
          </Button>
        )}
      </div>
    </div>
  );
}
