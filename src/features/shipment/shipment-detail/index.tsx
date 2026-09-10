"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LogisticsGeoMap,
  MetricCard,
  RealtimeStatus,
  RiskBadge,
  StatusBadge,
  WorkspaceCard,
  type LogisticsGeoMarker,
  type LogisticsGeoRoute,
} from "@/components/common";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Route as RouteIcon,
  ShieldCheck,
  Edit,
  ExternalLink,
  Plus,
  Package,
} from "lucide-react";
import { shipmentService, type ShipmentDto } from "@/api/services/shipment.service";
import { trackingService, type CurrentLocationDto } from "@/api/services/tracking.service";
import { ShipmentNotificationSubscription } from "./components/shipment-notification-subscription";
import { UpdateShipmentDialog } from "../components/update-shipment-dialog";
import { mapBackendShipmentToPlanningItem } from "@/features/route-tracking/route-planning/utils/route-planning-mapper";
import { useRoutePlanningStore } from "@/features/route-tracking/route-planning/stores/use-route-planning-store";

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
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  // Sync route planning store data
  const planningShipments = useRoutePlanningStore((state) => state.shipments);
  const fetchLiveBackendData = useRoutePlanningStore((state) => state.fetchLiveBackendData);

  useEffect(() => {
    if (planningShipments.length === 0) {
      fetchLiveBackendData();
    }
  }, [planningShipments.length, fetchLiveBackendData]);

  const planningShipment = useMemo(() => {
    return planningShipments.find(
      (s) => s.id === shipmentId || s.shipmentNo === shipmentId || s.orderId === shipmentId
    );
  }, [planningShipments, shipmentId]);

  // Load shipment details from API
  const loadShipmentData = () => {
    shipmentService
      .getShipment(shipmentId)
      .then((data) => {
        if (data) setShipment(data);
      })
      .catch(() => {
        // Keep fallback fixtures if any
      });
  };

  useEffect(() => {
    loadShipmentData();
  }, [shipmentId]);

  // Polling GPS telemetry every 2.5s for live tracking
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

  const customerName = shipment?.customerName || planningShipment?.customerName || "Enterprise Customer";
  const originAddress = shipment?.originAddress || planningShipment?.origin.address || "San José Central Cargo Hub, Costa Rica";
  const destAddress = shipment?.destinationAddress || planningShipment?.destination.address || "Puerto Barrios Logistics Hub, Guatemala";
  const status = shipment?.status || planningShipment?.status || "In Transit";

  // Derive planning item from active shipment data or route-planning store
  const planningItem = useMemo(() => {
    if (planningShipment) return planningShipment;
    if (shipment) return mapBackendShipmentToPlanningItem(shipment);
    return null;
  }, [planningShipment, shipment]);

  // Check assigned route: either from store, from shipment entity, or localStorage
  const storedAssignedRouteId = typeof window !== "undefined"
    ? localStorage.getItem(`shipment_assigned_route_${shipmentId}`) ||
      (shipment?.shipmentNo ? localStorage.getItem(`shipment_assigned_route_${shipment.shipmentNo}`) : null)
    : null;

  const assignedRouteId =
    planningShipment?.assignedRouteId ||
    shipment?.assignedRouteId ||
    storedAssignedRouteId ||
    planningItem?.routes[0]?.id;

  const activeRoute =
    planningItem?.routes.find((r) => r.id === assignedRouteId) ||
    planningItem?.routes[0];

  // Dynamically compute map routes for Central America corridor matching route-planning
  const dynamicMapRoutes = useMemo((): LogisticsGeoRoute[] => {
    if (activeRoute?.coordinates && activeRoute.coordinates.length > 0) {
      return [
        {
          id: activeRoute.id,
          label: activeRoute.name,
          kind: "current",
          shipmentId,
          coordinates: activeRoute.coordinates,
        },
      ];
    }
    return planningItem?.mapRoutes || [];
  }, [activeRoute, planningItem, shipmentId]);

  // Dynamically compute map markers from actual route stops / facilities in Central America
  const dynamicMapMarkers = useMemo((): LogisticsGeoMarker[] => {
    const baseMarkers: LogisticsGeoMarker[] = [];

    if (activeRoute?.stops && activeRoute.stops.length > 0) {
      activeRoute.stops.forEach((stop, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === activeRoute.stops.length - 1;
        const tone = isFirst
          ? ("origin" as const)
          : isLast
            ? ("destination" as const)
            : stop.stopType === "Customs" || stop.stopType === "Port"
              ? ("alert" as const)
              : ("current" as const);

        baseMarkers.push({
          id: `stop-${stop.id || idx}`,
          label: `${stop.sequence}. ${stop.locationName}`,
          detail: `${stop.stopType} · ${stop.address}`,
          position: { longitude: stop.longitude, latitude: stop.latitude },
          tone,
        });
      });
    } else if (planningItem?.markers && planningItem.markers.length > 0) {
      baseMarkers.push(...planningItem.markers);
    }

    if (currentGps && typeof currentGps.latitude === "number" && typeof currentGps.longitude === "number") {
      return [
        {
          id: "tracking-current",
          position: { latitude: currentGps.latitude, longitude: currentGps.longitude },
          label: "Live Vehicle Position",
          tone: "current" as const,
        },
        ...baseMarkers.filter((m) => m.id !== "tracking-current"),
      ];
    }

    return baseMarkers;
  }, [activeRoute, planningItem, currentGps]);

  const effectiveShipment: ShipmentDto | null = useMemo(() => {
    if (shipment) return shipment;
    if (planningShipment) {
      return {
        id: planningShipment.id || shipmentId,
        shipmentNo: planningShipment.shipmentNo || shipmentId,
        orderId: planningShipment.orderId,
        customerName: planningShipment.customerName,
        originAddress: planningShipment.origin.address,
        destinationAddress: planningShipment.destination.address,
        status: planningShipment.status || "Draft",
        priority: (planningShipment.priority as any) || "Normal",
        transportMode: (planningShipment.transportMode as any) || "Road",
        assignedRouteId: planningShipment.assignedRouteId || assignedRouteId,
        cargoItems: [
          {
            name: planningShipment.cargo.commodity,
            quantity: 1,
            weightKg: planningShipment.cargo.weightKg,
            volumeM3: planningShipment.cargo.volumeM3,
            packageType: planningShipment.cargo.packageType,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    return {
      id: shipmentId,
      shipmentNo: shipmentId,
      customerName,
      originAddress,
      destinationAddress: destAddress,
      status,
      priority: "Normal",
      transportMode: "Road",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [shipment, planningShipment, shipmentId, customerName, originAddress, destAddress, status, assignedRouteId]);

  return (
    <>
      <PageHeader
        breadcrumb={["Shipments", shipmentId]}
        title={shipment?.shipmentNo || shipmentId}
        description={`${customerName} · ${originAddress} → ${destAddress}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge label={status} intent="info" />
            <RiskBadge level={shipment?.riskLevel ?? (activeRoute?.risk.toLowerCase() as any) ?? "low"} />
            
            {/* Update Shipment Flow Action */}
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs shadow-xs"
              onClick={() => setIsUpdateDialogOpen(true)}
            >
              <Edit className="size-3.5" />
              Edit Shipment
            </Button>

            <ShipmentNotificationSubscription shipmentId={shipmentId} />
          </div>
        }
      />

      <WorkspaceCard>
        <div className="flex flex-wrap items-center justify-between border-b border-border pb-3">
          <div className="flex flex-wrap gap-2">
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

          {/* Quick jump to Route Planning */}
          <Link
            href={`/route-planning?shipmentId=${shipment?.shipmentNo || shipmentId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <RouteIcon className="size-3.5" />
            <span>Open in Route Planning</span>
            <ExternalLink className="size-3" />
          </Link>
        </div>

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard
                label="Current Position"
                value={
                  currentGps
                    ? `${currentGps.latitude.toFixed(4)}, ${currentGps.longitude.toFixed(4)}`
                    : activeRoute?.stops?.[0]
                      ? `${activeRoute.stops[0].locationName}`
                      : "Telemetry active"
                }
              />
              <MetricCard
                label="ETA"
                value={shipment?.estimatedEta || (activeRoute ? activeRoute.duration : "On schedule")}
              />
              <MetricCard
                label="Route Corridor Status"
                value={assignedRouteId ? "Route Bound & Active" : "Planning Corridor Ready"}
              />
            </div>

            <div className="rounded-xl border border-border bg-slate-50/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-foreground uppercase tracking-wide">
                  Summary & Assigned Corridor Details
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => setIsUpdateDialogOpen(true)}
                >
                  <Edit className="size-3" /> Chỉnh sửa
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Customer:</span>
                  <span className="font-semibold text-foreground">{customerName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Transport Mode:</span>
                  <span className="font-semibold text-foreground">{shipment?.transportMode || "Road (OSRM Highway)"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Origin:</span>
                  <span>{originAddress}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Destination:</span>
                  <span>{destAddress}</span>
                </div>
              </div>

              {activeRoute && (
                <div className="border-t border-slate-200/80 pt-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <RouteIcon className="size-4 text-primary" />
                    <span>
                      Corridor: <strong className="text-foreground">{activeRoute.name}</strong> ({activeRoute.distance})
                    </span>
                  </div>
                  <Link
                    href={`/route-planning?shipmentId=${shipment?.shipmentNo || shipmentId}`}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Xem trên Route Planning →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CARGO TAB */}
        {tab === "cargo" && (
          <div className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard
                label="Commodity"
                value={
                  shipment?.cargoItems?.[0]?.name ||
                  planningItem?.cargo?.commodity ||
                  "Export Produce & Commercial Cargo"
                }
              />
              <MetricCard
                label="Weight"
                value={
                  shipment?.cargoItems?.[0]?.weightKg
                    ? `${shipment.cargoItems[0].weightKg.toLocaleString()} kg`
                    : planningItem?.cargo?.weightKg
                      ? `${planningItem.cargo.weightKg.toLocaleString()} kg`
                      : "18,420 kg"
                }
              />
              <MetricCard
                label="Equipment"
                value={planningItem?.cargo?.packageType || "1 × 40’ High Cube Reefer"}
              />
            </div>

            <div className="rounded-xl border border-border p-4 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-foreground uppercase tracking-wide">
                  Danh sách mặt hàng vận chuyển (Cargo Items)
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => setIsUpdateDialogOpen(true)}
                >
                  <Plus className="size-3" /> Thêm / Sửa Hàng Hóa
                </Button>
              </div>

              {shipment?.cargoItems && shipment.cargoItems.length > 0 ? (
                <div className="divide-y divide-border border rounded-lg text-xs">
                  {shipment.cargoItems.map((item, idx) => (
                    <div key={item.id || idx} className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-muted-foreground text-[11px]">
                          Số lượng: {item.quantity} · Khối lượng: {item.weightKg} kg {item.hsCode ? `· Mã HS: ${item.hsCode}` : ""}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-medium">
                        {item.packageType || "Container Cargo"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-slate-50 text-center text-xs text-muted-foreground">
                  <Package className="size-6 mx-auto text-slate-400 mb-1" />
                  Mặt hàng mặc định: {planningItem?.cargo?.commodity || "Standard Commercial Cargo"} (
                  {planningItem?.cargo?.weightKg?.toLocaleString() || "18,420"} kg)
                </div>
              )}
            </div>
          </div>
        )}

        {/* ROUTE TAB (Synchronized with Route Planning) */}
        {tab === "route" && (
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.55fr_0.85fr]">
            <LogisticsGeoMap
              className="h-[34rem] min-h-[30rem]"
              routes={dynamicMapRoutes}
              markers={dynamicMapMarkers}
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
              {/* Active Route Overview matching Route Planning */}
              <div className="rounded-xl border border-border bg-slate-50/70 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Assigned Corridor (Route Planning)
                  </span>
                  <StatusBadge
                    label={assignedRouteId ? "Route Bound" : "Corridor Ready"}
                    intent={assignedRouteId ? "success" : "info"}
                  />
                </div>
                <p className="font-semibold text-sm text-foreground">
                  {activeRoute?.name || "Pan-American Highway Corridor (Central America)"}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Total Distance</span>
                    <strong className="text-foreground font-mono">{activeRoute?.distance || "845 km"}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Est. Duration</span>
                    <strong className="text-foreground font-mono">{activeRoute?.duration || "15h (OSRM)"}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Rate: <strong className="text-emerald-600 font-semibold">{activeRoute?.cost || "$95 / CBM"}</strong>
                  </span>
                  <Link
                    href={`/route-planning?shipmentId=${shipment?.shipmentNo || shipmentId}`}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Change in Route Planning</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>

              {/* Route Stops / Milestones */}
              {activeRoute?.stops && activeRoute.stops.length > 0 && (
                <div className="rounded-xl border border-border p-3.5 bg-card space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <RouteIcon className="size-3.5 text-primary" />
                    Route Stops & Waypoints ({activeRoute.stops.length})
                  </span>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {activeRoute.stops.map((stop) => (
                      <div
                        key={stop.id || stop.sequence}
                        className="flex items-center justify-between text-xs bg-slate-50/80 p-2 rounded-lg border border-slate-100"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="font-semibold text-foreground truncate">
                            {stop.sequence}. {stop.locationName}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">{stop.address}</p>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0 bg-white">
                          {stop.stopType}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Telemetry Metrics */}
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard
                  label="Current GPS"
                  value={
                    currentGps
                      ? `${currentGps.latitude.toFixed(4)}, ${currentGps.longitude.toFixed(4)}`
                      : activeRoute?.stops?.[0]
                        ? `${activeRoute.stops[0].latitude.toFixed(4)}, ${activeRoute.stops[0].longitude.toFixed(4)}`
                        : "Central America Corridor"
                  }
                />
                <MetricCard
                  label="Speed"
                  value={
                    currentGps?.speedKph !== undefined
                      ? `${Math.round(currentGps.speedKph)} km/h`
                      : "58 km/h"
                  }
                />
                <MetricCard
                  label="Heading"
                  value={
                    currentGps?.headingDegrees !== undefined
                      ? `${Math.round(currentGps.headingDegrees)}°`
                      : "North-West"
                  }
                />
                <MetricCard
                  label="Last Telemetry"
                  value={
                    currentGps?.recordedAt
                      ? new Date(currentGps.recordedAt).toLocaleTimeString()
                      : "Telemetry Active"
                  }
                  meta={activeRoute ? `Risk: ${activeRoute.risk}` : undefined}
                />
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {tab === "documents" && (
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between">
              <StatusBadge label="Documents Verified" intent="success" />
            </div>
            <div className="rounded-lg border border-border p-4 text-xs text-muted-foreground">
              Commercial invoice, packing list, and phytosanitary certificate linked for Central American customs clearance.
            </div>
          </div>
        )}

        {/* TIMELINE TAB */}
        {tab === "timeline" && (
          <div className="mt-5 space-y-3">
            <div className="rounded-lg border border-border p-3">
              <p className="font-semibold text-xs text-foreground">Shipment Created & Order Registered</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {originAddress} → {destAddress}
              </p>
            </div>
            {assignedRouteId && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-emerald-900">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  Route Corridor Bound & Dispatched
                </div>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  {activeRoute?.name || "Pan-American Highway Corridor"} ({activeRoute?.distance || "OSRM Route"})
                </p>
              </div>
            )}
            <div className="rounded-lg border border-border p-3">
              <p className="font-semibold text-xs text-foreground">Status: {status}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Carrier assigned and GPS tracking initialized for Central American transport corridor.
              </p>
            </div>
          </div>
        )}
      </WorkspaceCard>

      {/* Update Shipment Modal */}
      <UpdateShipmentDialog
        shipment={effectiveShipment}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        onUpdated={(updated) => {
          setShipment(updated);
          loadShipmentData();
        }}
      />
    </>
  );
}
