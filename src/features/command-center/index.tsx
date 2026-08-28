"use client";

import { useState } from "react";
import { CircleAlert } from "lucide-react";
import {
  AiInsight,
  LogisticsMap,
  MetricCard,
  RealtimeStatus,
  RiskBadge,
  WorkspaceCard,
} from "@/components/common";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { commandExceptions, commandKpis, commandMapMock } from "./mock";

export function CommandCenterPage() {
  const [acknowledged, setAcknowledged] = useState<string[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState("command-shp-128");

  return (
    <>
      <PageHeader
        eyebrow="Control tower"
        title="Operations Command Center"
        description="Exception-first overview of shipments and network health."
        actions={<RealtimeStatus state="live" />}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {commandKpis.map((kpi) => (
          <MetricCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            meta={kpi.meta}
          />
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_0.8fr]">
        <WorkspaceCard title="Network overview">
          <LogisticsMap
            routes={commandMapMock.routes}
            markers={commandMapMock.markers}
            selectedMarkerId={selectedMarkerId}
            onMarkerSelect={setSelectedMarkerId}
          >
            <div className="absolute right-4 top-4 z-30 rounded-full bg-white/90 p-1 shadow-sm">
              <RealtimeStatus state="live" />
            </div>
          </LogisticsMap>
        </WorkspaceCard>
        <WorkspaceCard title="Exceptions first">
          <div className="space-y-3">
            {commandExceptions.map((item) => (
              <div
                className={`rounded-lg border p-3 ${acknowledged.includes(item.id) ? "border-success/30 bg-emerald-50/40" : "border-border"}`}
                key={item.id}
                onMouseEnter={() => setSelectedMarkerId(item.markerId)}
              >
                <div className="flex items-start gap-3">
                  <CircleAlert className="mt-0.5 size-4 text-critical" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{item.flag}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.id} · {item.customer}
                    </p>
                  </div>
                  <RiskBadge level={item.risk} />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() =>
                    setAcknowledged((current) =>
                      current.includes(item.id)
                        ? current.filter((id) => id !== item.id)
                        : [...current, item.id],
                    )
                  }
                >
                  {acknowledged.includes(item.id)
                    ? "Acknowledged"
                    : "Acknowledge"}
                </Button>
              </div>
            ))}
          </div>
        </WorkspaceCard>
      </div>
      <div className="mt-5">
        <WorkspaceCard title="AI risk insight">
          <AiInsight
            result="Port congestion may add 55–80 minutes to SHP-2026-00128."
            confidence={87}
            reason="Berth queue increased 34% and vessel missed its original window."
            sources={["Port feed", "Vessel schedule"]}
            timestamp="Updated locally"
            suggestedAction="Review alternative arrival slot · human approval required"
          />
        </WorkspaceCard>
      </div>
    </>
  );
}
