"use client";

import { useEffect, useState } from "react";
import { CircleAlert, ShieldCheck } from "lucide-react";
import {
  AiInsight,
  LogisticsGeoMap,
  MetricCard,
  RealtimeStatus,
  RiskBadge,
  WorkspaceCard,
} from "@/components/common";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { dashboardService, type DashboardSummaryDto } from "@/api/services/dashboard.service";
import { shipmentService } from "@/api/services/shipment.service";
import { trackingService, type MonitoringAlertDto } from "@/api/services/tracking.service";
import { commandExceptions, commandKpis, commandMapMock } from "./mock";

export function CommandCenterPage() {
  const [acknowledged, setAcknowledged] = useState<string[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState("");
  const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);
  const [shipmentCount, setShipmentCount] = useState<number>(0);
  const [alerts, setAlerts] = useState<MonitoringAlertDto[]>([]);

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch Dashboard summary (BFF -> IamTenant + RoutePlanningAgent)
    dashboardService.getSummary().then((data) => {
      if (isMounted && data) setSummary(data);
    }).catch(() => {});

    // 2. Fetch live Shipment count
    shipmentService.listShipments({ limit: 1 }).then((res) => {
      if (isMounted && res?.totalCount !== undefined) {
        setShipmentCount(res.totalCount);
      }
    }).catch(() => {});

    // 3. Fetch GPS monitoring alerts
    trackingService.listMonitoringAlerts({ page: 1, pageSize: 5 }).then((res) => {
      if (isMounted && res?.alerts) {
        setAlerts(res.alerts);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const kpiCards = [
    {
      label: "Active Shipments",
      value: `${shipmentCount}`,
      meta: "Realtime from shipment service",
    },
    {
      label: "Active Routes",
      value: `${summary?.activeRoutesCount ?? 0}`,
      meta: "RoutePlanningAgent",
    },
    {
      label: "On-time reliability",
      value: "99.2%",
      meta: "Fleet performance",
    },
    {
      label: "Active Exceptions",
      value: `${alerts.length}`,
      meta: alerts.length > 0 ? `${alerts.length} require review` : "All systems normal",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Control tower"
        title="Operations Command Center"
        description="Exception-first overview of shipments and network health."
        actions={<RealtimeStatus state="live" />}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((kpi) => (
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
          <LogisticsGeoMap
            routes={commandMapMock.routes}
            markers={commandMapMock.markers}
            selectedMarkerId={selectedMarkerId}
            onMarkerSelect={setSelectedMarkerId}
          >
            <div className="absolute right-4 top-4 z-30 rounded-full bg-white/90 p-1 shadow-sm">
              <RealtimeStatus state="live" />
            </div>
          </LogisticsGeoMap>
        </WorkspaceCard>
        <WorkspaceCard title="Exceptions & Alerts">
          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div
                  className={`rounded-lg border p-3 ${
                    acknowledged.includes(alert.id)
                      ? "border-success/30 bg-emerald-50/40"
                      : "border-border"
                  }`}
                  key={alert.id}
                >
                  <div className="flex items-start gap-3">
                    <CircleAlert className="mt-0.5 size-4 text-critical" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{alert.alertType || "Route Alert"}</p>
                      <p className="text-xs text-muted-foreground">
                        {alert.shipmentId || alert.vehicleId || alert.id} · {alert.message}
                      </p>
                    </div>
                    <RiskBadge level="high" />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={() => {
                      trackingService.resolveMonitoringAlert(alert.id);
                      setAcknowledged((curr) => [...curr, alert.id]);
                    }}
                  >
                    {acknowledged.includes(alert.id) ? "Resolved" : "Resolve Alert"}
                  </Button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="size-5" />
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">All corridors operational</p>
                <p className="text-xs text-muted-foreground">
                  No active exceptions or risk alerts detected across fleet.
                </p>
              </div>
            )}
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
