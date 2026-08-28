"use client";

import { useState } from "react";
import {
  AiInsight,
  LogisticsGeoMap,
  MetricCard,
  RealtimeStatus,
  RiskBadge,
  StatusBadge,
  WorkspaceCard,
} from "@/components/common";
import { PageHeader } from "@/components/layout";
import { shipmentDetailMapMock, shipmentGpsMock } from "../mock";

const DETAIL_TABS = [
  "overview",
  "route",
  "cargo",
  "documents",
  "timeline",
] as const;
type DetailTab = (typeof DETAIL_TABS)[number];

export function ShipmentDetailPage({ shipmentId }: { shipmentId: string }) {
  const [tab, setTab] = useState<DetailTab>("overview");
  const [selectedMarkerId, setSelectedMarkerId] = useState(
    "shipment-current-gps",
  );

  return (
    <>
      <PageHeader
        breadcrumb={["Shipments", shipmentId]}
        title={shipmentId}
        description="Acme Electronics · HCM → Singapore · shipment context"
        actions={
          <>
            <StatusBadge label="In Transit" intent="info" />
            <RiskBadge level="medium" />
          </>
        }
      />
      <WorkspaceCard>
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {DETAIL_TABS.map((item) => (
            <button
              type="button"
              className={`rounded-lg px-3 py-2 text-sm ${tab === item ? "bg-blue-50 font-semibold text-primary" : "text-muted-foreground"}`}
              key={item}
              onClick={() => setTab(item)}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
        {tab === "overview" && (
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <MetricCard label="Current position" value="Near Cat Lai Port" />
            <MetricCard label="ETA" value="14 Jun · 18:40" />
            <MetricCard label="Exception" value="Port congestion" />
          </div>
        )}
        {tab === "cargo" && (
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <MetricCard label="Commodity" value="Electronics" />
            <MetricCard label="Weight" value="18,420 kg" />
            <MetricCard label="Equipment" value="2 × 40’ reefer" />
          </div>
        )}
        {tab === "route" && (
          <div className="mt-5 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
            <LogisticsGeoMap
              routes={shipmentDetailMapMock.routes}
              markers={shipmentDetailMapMock.markers}
              selectedMarkerId={selectedMarkerId}
              onMarkerSelect={setSelectedMarkerId}
            >
              <div className="absolute right-4 top-4 z-30 rounded-full bg-white/90 p-1 shadow-sm">
                <RealtimeStatus state="live" simulated />
              </div>
            </LogisticsGeoMap>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <MetricCard
                label="Current GPS"
                value={shipmentGpsMock.coordinates}
              />
              <MetricCard label="Speed" value={shipmentGpsMock.speed} />
              <MetricCard label="Heading" value={shipmentGpsMock.heading} />
              <MetricCard
                label="Last GPS"
                value={shipmentGpsMock.lastUpdate}
                meta={`Route progress ${shipmentGpsMock.progress}`}
              />
            </div>
          </div>
        )}
        {tab === "documents" && (
          <div className="mt-5">
            <StatusBadge label="11 verified · 1 pending" intent="warning" />
          </div>
        )}
        {tab === "timeline" && (
          <div className="mt-5 space-y-3">
            {[
              "Departed VSIP warehouse",
              "Gate-in Cat Lai Port",
              "Near Cat Lai Port",
            ].map((event) => (
              <div className="rounded-lg border border-border p-3" key={event}>
                {event}
              </div>
            ))}
          </div>
        )}
        <AiInsight
          result="Port congestion may add 20–35 minutes."
          confidence={68}
          reason="Berth allocation is changing."
          sources={["Port feed"]}
          timestamp="Updated locally"
          suggestedAction="Monitor berth allocation"
        />
      </WorkspaceCard>
    </>
  );
}
