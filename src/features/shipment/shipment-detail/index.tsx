"use client";

import { useEffect, useState } from "react";
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
import { shipmentService, type ShipmentDto } from "@/api/services/shipment.service";
import { trackingService, type CurrentLocationDto } from "@/api/services/tracking.service";
import { shipmentDetailMapMock, shipmentGpsMock } from "../mock";
import { ShipmentNotificationSubscription } from "./components/shipment-notification-subscription";

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
  const [selectedMarkerId, setSelectedMarkerId] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [shipment, setShipment] = useState<ShipmentDto | null>(null);
  const [currentGps, setCurrentGps] = useState<CurrentLocationDto | null>(null);

  // Load shipment details
  useEffect(() => {
    let isMounted = true;
    shipmentService.getShipment(shipmentId).then((data) => {
      if (isMounted && data) setShipment(data);
    }).catch(() => {
      // Keep fallback fixtures
    });
    return () => {
      isMounted = false;
    };
  }, [shipmentId]);

  // Polling GPS telemetry every 2.5s for live demo
  useEffect(() => {
    let isMounted = true;
    const pollGps = async () => {
      const loc = await trackingService.getCurrentLocation(shipmentId);
      if (isMounted && loc) {
        setCurrentGps(loc);
      }
    };

    pollGps();
    const interval = setInterval(pollGps, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [shipmentId]);

  const customerName = shipment?.customerName || "Enterprise Customer";
  const originAddress = shipment?.originAddress || "Origin Warehouse";
  const destAddress = shipment?.destinationAddress || "Destination Port";
  const status = shipment?.status || "In Transit";

  const aiInsightContent = (
    <AiInsight
      result="Port congestion may add 20–35 minutes."
      confidence={68}
      reason="Berth allocation is changing."
      sources={["Port feed"]}
      timestamp="Updated locally"
      suggestedAction="Monitor berth allocation"
    />
  );

  const mapMarkers = currentGps
    ? [
        {
          id: "tracking-current",
          latitude: currentGps.latitude,
          longitude: currentGps.longitude,
          label: "Live Vehicle Position",
          tone: "primary" as const,
        },
        ...shipmentDetailMapMock.markers.filter((m) => m.id !== "tracking-current"),
      ]
    : shipmentDetailMapMock.markers;

  return (
    <>
      <PageHeader
        breadcrumb={["Shipments", shipmentId]}
        title={shipment?.shipmentNo || shipmentId}
        description={`${customerName} · ${originAddress} → ${destAddress}`}
        actions={
          <>
            <StatusBadge label={status} intent="info" />
            <RiskBadge level={shipment?.riskLevel ?? "medium"} />
            <ShipmentNotificationSubscription shipmentId={shipmentId} />
          </>
        }
      />
      <WorkspaceCard>
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {DETAIL_TABS.map((item) => (
            <button
              type="button"
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                tab === item
                  ? "bg-blue-50 font-semibold text-primary"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
              key={item}
              onClick={() => setTab(item)}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
        {tab === "overview" && (
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <MetricCard
              label="Current position"
              value={
                currentGps
                  ? `${currentGps.latitude.toFixed(4)}, ${currentGps.longitude.toFixed(4)}`
                  : "Telemetry active"
              }
            />
            <MetricCard label="ETA" value={shipment?.estimatedEta || "On schedule"} />
            <MetricCard label="Exception" value="No active exceptions" />
          </div>
        )}
        {tab === "cargo" && (
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <MetricCard
              label="Commodity"
              value={shipment?.cargoItems?.[0]?.name || "Electronics"}
            />
            <MetricCard
              label="Weight"
              value={
                shipment?.cargoItems?.[0]?.weightKg
                  ? `${shipment.cargoItems[0].weightKg} kg`
                  : "18,420 kg"
              }
            />
            <MetricCard label="Equipment" value="Standard Road Carrier" />
          </div>
        )}
        {tab === "route" && (
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.55fr_0.85fr]">
            <LogisticsGeoMap
              className="h-[34rem] min-h-[30rem]"
              routes={shipmentDetailMapMock.routes}
              markers={mapMarkers}
              selectedRouteId={selectedRouteId}
              selectedMarkerId={selectedMarkerId}
              onMarkerSelect={setSelectedMarkerId}
              onRouteSelect={setSelectedRouteId}
            >
              <div className="absolute right-4 top-4 z-30 rounded-full bg-white/90 p-1 shadow-sm">
                <RealtimeStatus state="live" simulated />
              </div>
            </LogisticsGeoMap>
            <div className="flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard
                  label="Current GPS"
                  value={
                    currentGps
                      ? `${currentGps.latitude.toFixed(4)}, ${currentGps.longitude.toFixed(4)}`
                      : shipmentGpsMock.coordinates
                  }
                />
                <MetricCard
                  label="Speed"
                  value={
                    currentGps?.speedKph !== undefined
                      ? `${Math.round(currentGps.speedKph)} km/h`
                      : shipmentGpsMock.speed
                  }
                />
                <MetricCard
                  label="Heading"
                  value={
                    currentGps?.headingDegrees !== undefined
                      ? `${Math.round(currentGps.headingDegrees)}°`
                      : shipmentGpsMock.heading
                  }
                />
                <MetricCard
                  label="Last GPS"
                  value={
                    currentGps?.recordedAt
                      ? new Date(currentGps.recordedAt).toLocaleTimeString()
                      : shipmentGpsMock.lastUpdate
                  }
                  meta={`Route progress ${shipmentGpsMock.progress}`}
                />
              </div>
              {aiInsightContent}
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
        {tab !== "route" && <div className="mt-5">{aiInsightContent}</div>}
      </WorkspaceCard>
    </>
  );
}
