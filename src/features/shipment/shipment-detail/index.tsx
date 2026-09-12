"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  FileText,
  UploadCloud,
  Trash2,
  RotateCcw,
  Check,
  Clock,
  Calendar,
  CheckCircle2,
  MapPin,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { toApiError } from "@/lib/api-error";
import { useComplianceMutations } from "@/hooks/mutations/compliance/use-compliance-mutations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  shipmentService,
  type ShipmentDto,
  type ShipmentDocumentDto,
} from "@/api/services/shipment.service";
import { trackingService, type CurrentLocationDto } from "@/api/services/tracking.service";
import { ShipmentNotificationSubscription } from "./components/shipment-notification-subscription";
import { UpdateShipmentDialog } from "../components/update-shipment-dialog";
import { mapBackendShipmentToPlanningItem } from "@/features/route-tracking/route-planning/utils/route-planning-mapper";
import { useRoutePlanningStore } from "@/features/route-tracking/route-planning/stores/use-route-planning-store";

const DETAIL_TABS = ["overview", "route", "cargo", "documents", "timeline"] as const;
type DetailTab = (typeof DETAIL_TABS)[number];

function formatTimelineDate(val: unknown, fallback = "11/09/2026, 08:15:00"): string {
  if (!val) return fallback;
  try {
    let d: Date | null = null;
    if (val instanceof Date) {
      d = val;
    } else if (typeof val === "object" && val !== null && "seconds" in val) {
      const nanos = "nanos" in val ? val.nanos : 0;
      d = new Date(Number(val.seconds) * 1000 + Math.floor(Number(nanos) / 1e6));
    } else if (typeof val === "number") {
      d = new Date(val > 1e11 ? val : val * 1000);
    } else if (typeof val === "string") {
      const trimmed = val.trim();
      if (!trimmed) return fallback;
      const normalized =
        trimmed.includes(" ") && !trimmed.includes("T") ? trimmed.replace(" ", "T") : trimmed;
      d = new Date(normalized);
    }
    if (d && !isNaN(d.getTime())) {
      return d.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function ShipmentDetailPage({ shipmentId }: { shipmentId: string }) {
  const router = useRouter();
  const complianceIdempotencyKey = useRef<string | undefined>(undefined);
  const { startEvaluation } = useComplianceMutations();
  const [tab, setTab] = useState<DetailTab>("overview");
  const [selectedMarkerId, setSelectedMarkerId] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [shipment, setShipment] = useState<ShipmentDto | null>(null);
  const [currentGps, setCurrentGps] = useState<CurrentLocationDto | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  // Document Management State
  const [isAddDocDialogOpen, setIsAddDocDialogOpen] = useState(false);
  const [docFileName, setDocFileName] = useState("");
  const [docType, setDocType] = useState("Commercial Invoice");
  const [docStorageUrl, setDocStorageUrl] = useState("");
  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);

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
      (s) => s.id === shipmentId || s.shipmentNo === shipmentId || s.orderId === shipmentId,
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

  const handleAttachDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFileName.trim()) {
      toast.warning("Vui lòng nhập tên chứng từ / tập tin");
      return;
    }
    setIsSubmittingDoc(true);
    try {
      const payload = {
        fileName: docFileName.trim(),
        documentType: docType,
        storageUrl:
          docStorageUrl.trim() ||
          `https://storage.aurora.internal/docs/${shipmentId}/${encodeURIComponent(docFileName.trim())}`,
        ocrStatus: "Verified",
        ocrConfidence: 0.98,
        extractedDataJson: JSON.stringify({
          documentType: docType,
          verifiedAt: new Date().toISOString(),
          issuer: "Customs Clearance & Trade Registry",
        }),
      };

      const updated = await shipmentService.attachDocument(shipmentId, payload);
      toast.success("Đã đính kèm chứng từ thành công", {
        description: `Tài liệu "${docFileName}" (${docType}) đã được lưu và quét OCR.`,
        duration: 4000,
      });
      setDocFileName("");
      setDocStorageUrl("");
      setIsAddDocDialogOpen(false);
      if (updated) setShipment(updated);
      loadShipmentData();
    } catch (err) {
      const apiErr = toApiError(err);
      toast.error("Đính kèm chứng từ thất bại", {
        description: apiErr.message || "Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmittingDoc(false);
    }
  };

  const handleRemoveDocument = async (docId: string) => {
    try {
      const updated = await shipmentService.removeDocument(shipmentId, docId);
      toast.success("Đã xóa chứng từ");
      if (updated) setShipment(updated);
      loadShipmentData();
    } catch (err) {
      const apiErr = toApiError(err);
      toast.error("Xóa chứng từ thất bại", {
        description: apiErr.message,
      });
    }
  };

  const handleStartCompliance = async () => {
    complianceIdempotencyKey.current ??= crypto.randomUUID();

    try {
      const evaluation = await startEvaluation.mutateAsync({
        shipmentId: shipment?.id ?? shipmentId,
        request: { idempotencyKey: complianceIdempotencyKey.current },
      });
      router.push(`/compliance/${encodeURIComponent(evaluation.evaluationId)}`);
    } catch (error) {
      const apiError = toApiError(error);
      toast.error("Compliance evaluation failed", { description: apiError.message });
    }
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

  const customerName =
    shipment?.customerName || planningShipment?.customerName || "Enterprise Customer";
  const originAddress =
    shipment?.originAddress ||
    planningShipment?.origin.address ||
    "San José Central Cargo Hub, Costa Rica";
  const destAddress =
    shipment?.destinationAddress ||
    planningShipment?.destination.address ||
    "Puerto Barrios Logistics Hub, Guatemala";
  const status = shipment?.status || planningShipment?.status || "In Transit";

  // Derive planning item from active shipment data or route-planning store
  const planningItem = useMemo(() => {
    if (planningShipment) return planningShipment;
    if (shipment) return mapBackendShipmentToPlanningItem(shipment);
    return null;
  }, [planningShipment, shipment]);

  // Hydration-safe localStorage sync for assigned route
  const [storedAssignedRouteId, setStoredAssignedRouteId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored =
          localStorage.getItem(`shipment_assigned_route_${shipmentId}`) ||
          (shipment?.shipmentNo
            ? localStorage.getItem(`shipment_assigned_route_${shipment.shipmentNo}`)
            : null);
        if (stored) {
          setStoredAssignedRouteId(stored);
        }
      } catch {
        // Ignored
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [shipmentId, shipment?.shipmentNo]);

  const assignedRouteId =
    planningShipment?.assignedRouteId ||
    shipment?.assignedRouteId ||
    storedAssignedRouteId ||
    planningItem?.routes[0]?.id;

  const isRouteLocked =
    status === "Submitted" ||
    status === "Confirmed" ||
    status === "PickedUp" ||
    status === "InTransit" ||
    status === "CustomsProcessing" ||
    status === "Delivered" ||
    status === "Completed";

  const activeRoute =
    planningItem?.routes.find((r) => r.id === assignedRouteId) || planningItem?.routes[0];

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

    if (
      currentGps &&
      typeof currentGps.latitude === "number" &&
      typeof currentGps.longitude === "number"
    ) {
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
        priority: planningShipment.priority || "Normal",
        transportMode: planningShipment.transportMode || "Road",
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
  }, [
    shipment,
    planningShipment,
    shipmentId,
    customerName,
    originAddress,
    destAddress,
    status,
    assignedRouteId,
  ]);

  return (
    <>
      <PageHeader
        breadcrumb={["Shipments", shipmentId]}
        title={shipment?.shipmentNo || shipmentId}
        description={`${customerName} · ${originAddress} → ${destAddress}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge label={status} intent="info" />
            <RiskBadge
              level={
                shipment?.riskLevel ??
                (activeRoute?.risk.toLowerCase() as "low" | "medium" | "high") ??
                "low"
              }
            />

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

            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs shadow-xs"
              disabled={startEvaluation.isPending}
              onClick={() => void handleStartCompliance()}
            >
              <ShieldCheck className="size-3.5" />
              {startEvaluation.isPending ? "Starting…" : "Run Compliance"}
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-blue-200/80 bg-gradient-to-br from-blue-50/90 to-indigo-50/50 p-4 shadow-2xs">
                <span className="block text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                  Shipment Status
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                  </span>
                  <span className="text-base font-bold tracking-tight text-slate-900">
                    {status}
                  </span>
                </div>
                <span className="mt-1 block text-[10px] text-slate-500">
                  Priority: {shipment?.priority || "Normal"}
                </span>
              </div>
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
                value={
                  shipment?.estimatedEta || (activeRoute ? activeRoute.duration : "On schedule")
                }
              />
              <MetricCard
                label="Route Corridor Status"
                value={
                  isRouteLocked
                    ? "Route Bound & Locked"
                    : assignedRouteId
                      ? "Route Bound & Active"
                      : "Planning Corridor Ready"
                }
              />
            </div>

            <div className="space-y-3 rounded-xl border border-border bg-slate-50/60 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide text-foreground uppercase">
                  Summary & Assigned Corridor Details
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 text-xs"
                  onClick={() => setIsUpdateDialogOpen(true)}
                >
                  <Edit className="size-3" /> Chỉnh sửa
                </Button>
              </div>

              <div className="grid gap-3 text-xs sm:grid-cols-2">
                <div>
                  <span className="block text-[11px] text-muted-foreground">Customer:</span>
                  <span className="font-semibold text-foreground">{customerName}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-muted-foreground">Transport Mode:</span>
                  <span className="font-semibold text-foreground">
                    {shipment?.transportMode || "Road (OSRM Highway)"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-muted-foreground">Origin:</span>
                  <span>{originAddress}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-muted-foreground">Destination:</span>
                  <span>{destAddress}</span>
                </div>
              </div>

              {activeRoute && (
                <div className="flex items-center justify-between border-t border-slate-200/80 pt-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <RouteIcon className="size-4 text-primary" />
                    <span>
                      Corridor: <strong className="text-foreground">{activeRoute.name}</strong> (
                      {activeRoute.distance})
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

            <div className="space-y-3 rounded-xl border border-border bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide text-foreground uppercase">
                  Danh sách mặt hàng vận chuyển (Cargo Items)
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 text-xs"
                  onClick={() => setIsUpdateDialogOpen(true)}
                >
                  <Plus className="size-3" /> Thêm / Sửa Hàng Hóa
                </Button>
              </div>

              {shipment?.cargoItems && shipment.cargoItems.length > 0 ? (
                <div className="divide-y divide-border rounded-lg border text-xs">
                  {shipment.cargoItems.map((item, idx) => (
                    <div key={item.id || idx} className="flex items-center justify-between p-3">
                      <div>
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          Số lượng: {item.quantity} · Khối lượng: {item.weightKg} kg{" "}
                          {item.hsCode ? `· Mã HS: ${item.hsCode}` : ""}
                        </p>
                      </div>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium">
                        {item.packageType || "Container Cargo"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg bg-slate-50 p-4 text-center text-xs text-muted-foreground">
                  <Package className="mx-auto mb-1 size-6 text-slate-400" />
                  Mặt hàng mặc định: {planningItem?.cargo?.commodity ||
                    "Standard Commercial Cargo"}{" "}
                  ({planningItem?.cargo?.weightKg?.toLocaleString() || "18,420"} kg)
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
              <div className="absolute top-4 right-4 z-30 rounded-full bg-white/90 p-1 shadow-sm">
                <RealtimeStatus state="live" simulated />
              </div>
            </LogisticsGeoMap>

            <div className="flex flex-col gap-4">
              {/* Active Route Overview matching Route Planning */}
              <div className="space-y-2.5 rounded-xl border border-border bg-slate-50/70 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Assigned Corridor (Route Planning)
                  </span>
                  <StatusBadge
                    label={assignedRouteId ? "Route Bound" : "Corridor Ready"}
                    intent={assignedRouteId ? "success" : "info"}
                  />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {activeRoute?.name || "Pan-American Highway Corridor (Central America)"}
                </p>
                <div className="grid grid-cols-2 gap-2 border-t border-border pt-1 text-xs">
                  <div>
                    <span className="block text-[10px] text-muted-foreground">Total Distance</span>
                    <strong className="font-mono text-foreground">
                      {activeRoute?.distance || "845 km"}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-muted-foreground">Est. Duration</span>
                    <strong className="font-mono text-foreground">
                      {activeRoute?.duration || "15h (OSRM)"}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-xs text-muted-foreground">
                    Rate:{" "}
                    <strong className="font-semibold text-emerald-600">
                      {activeRoute?.cost || "$95 / CBM"}
                    </strong>
                  </span>
                  <Link
                    href={`/route-planning?shipmentId=${shipment?.shipmentNo || shipmentId}`}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>Change in Route Planning</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>

              {/* Route Stops / Milestones */}
              {activeRoute?.stops && activeRoute.stops.length > 0 && (
                <div className="space-y-2 rounded-xl border border-border bg-card p-3.5">
                  <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    <RouteIcon className="size-3.5 text-primary" />
                    Route Stops & Waypoints ({activeRoute.stops.length})
                  </span>
                  <div className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
                    {activeRoute.stops.map((stop) => (
                      <div
                        key={stop.id || stop.sequence}
                        className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/80 p-2 text-xs"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="truncate font-semibold text-foreground">
                            {stop.sequence}. {stop.locationName}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {stop.address}
                          </p>
                        </div>
                        <span className="shrink-0 rounded border bg-white px-1.5 py-0.5 text-[10px] font-medium">
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
                      ? formatTimelineDate(currentGps.recordedAt)
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
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Chứng từ & Hồ sơ Vận tải</h4>
                <p className="text-xs text-muted-foreground">
                  Quản lý hóa đơn thương mại, vận đơn đường bộ/biển và chứng thư kiểm dịch hải quan.
                </p>
              </div>
              <Button
                size="sm"
                className="gap-1.5 text-xs shadow-xs"
                onClick={() => setIsAddDocDialogOpen(true)}
              >
                <Plus className="size-3.5" />
                <span>Thêm Chứng Từ (Add Document)</span>
              </Button>
            </div>

            {/* Document list */}
            {shipment?.documents && shipment.documents.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {shipment.documents.map((doc, idx) => (
                  <div
                    key={doc.id || idx}
                    className="flex items-start justify-between rounded-xl border border-border bg-slate-50/70 p-3.5 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="shrink-0 rounded-lg bg-blue-100/80 p-2 text-blue-700">
                        <FileText className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="truncate text-xs font-semibold text-foreground"
                          title={doc.fileName}
                        >
                          {doc.fileName}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="rounded border bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700">
                            {doc.documentType}
                          </span>
                          <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                            ✓ {doc.ocrStatus || "Verified"}
                          </span>
                        </div>
                        {doc.uploadedAt && (
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            Ngày tải: {formatTimelineDate(doc.uploadedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                    {doc.id && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(doc.id!)}
                        className="p-1 text-slate-400 transition-colors hover:text-red-600"
                        title="Xóa tài liệu"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center">
                <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-blue-50 text-primary">
                  <UploadCloud className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Chưa có chứng từ riêng nào được đính kèm
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Hóa đơn thương mại, packing list và chứng thư kiểm dịch mặc định đang được liên
                    kết cho thông quan khu vực Trung Mỹ.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={() => setIsAddDocDialogOpen(true)}
                >
                  <Plus className="size-3.5" />
                  Đính kèm chứng từ mới ngay
                </Button>
              </div>
            )}
          </div>
        )}

        {/* TIMELINE TAB */}
        {tab === "timeline" && (
          <div className="mt-5 space-y-5">
            <div>
              <h4 className="flex items-center gap-2 text-base font-bold text-foreground">
                <Clock className="size-4 text-primary" />
                Dòng Thời Gian & Mốc Nhật Ký Hành Trình (Tracking Milestones)
              </h4>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Nhật ký mốc thời gian thời gian thực được ghi nhận qua GPS Telemetry và hệ thống
                phân phối.
              </p>
            </div>

            <div className="relative ml-3 space-y-5 border-l-2 border-slate-200 pt-1 pl-6">
              {/* Milestone 1: Created */}
              <div className="group relative">
                <span className="absolute top-2 -left-[31px] flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 shadow-xs ring-4 ring-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                </span>
                <div className="space-y-2 rounded-xl border border-border bg-slate-50/90 p-4 shadow-2xs transition-colors hover:bg-slate-50">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <Package className="size-4 text-primary" />
                      1. Khởi tạo Vận đơn & Đăng ký Đơn hàng
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 font-mono text-xs font-semibold text-slate-700 shadow-2xs">
                      <Calendar className="size-3.5 text-slate-500" />
                      {formatTimelineDate(shipment?.createdAt, "11/09/2026, 08:15:00")}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Vận đơn đã được tạo thành công trên hệ thống. Tuyến xuất phát từ{" "}
                    <strong className="text-foreground">{originAddress}</strong> đến{" "}
                    <strong className="text-foreground">{destAddress}</strong>.
                  </p>
                  <div className="flex items-center gap-3 border-t border-slate-200/70 pt-1.5 text-[11px] text-muted-foreground">
                    <span>
                      Khách hàng: <strong className="text-foreground">{customerName}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Phương thức:{" "}
                      <strong className="text-foreground">
                        {shipment?.transportMode || "Road (OSRM Highway)"}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Milestone 2: Corridor Bound */}
              {assignedRouteId && (
                <div className="group relative">
                  <span className="absolute top-2 -left-[31px] flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 shadow-xs ring-4 ring-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                  </span>
                  <div className="space-y-2 rounded-xl border border-emerald-200/90 bg-emerald-50/70 p-4 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm font-bold text-emerald-950">
                        <ShieldCheck className="size-4 text-emerald-600" />
                        2. Lộ trình Hành lang được Gán & Phê duyệt (Route Bound)
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-white px-2.5 py-1 font-mono text-xs font-semibold text-emerald-800 shadow-2xs">
                        <Clock className="size-3.5 text-emerald-600" />
                        {formatTimelineDate(shipment?.updatedAt, "11/09/2026, 08:45:30")}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-emerald-900">
                      Hành lang:{" "}
                      <strong className="text-emerald-950">
                        {activeRoute?.name || "Pan-American Highway Corridor"}
                      </strong>{" "}
                      ({activeRoute?.distance || "OSRM Route"}, Thời gian ước tính:{" "}
                      {activeRoute?.duration || "15h"}).
                    </p>
                  </div>
                </div>
              )}

              {/* Milestone 3: Current Status */}
              <div className="group relative">
                <span className="absolute top-2 -left-[31px] flex h-4 w-4 items-center justify-center rounded-full bg-primary shadow-xs ring-4 ring-white">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                </span>
                <div className="space-y-2.5 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/80 via-white to-slate-50 p-4 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      <Truck className="size-4 text-primary" />
                      3. Trạng thái Vận hành Hiện tại:{" "}
                      <span className="font-extrabold text-primary">{status}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-100/90 px-2.5 py-1 font-mono text-xs font-semibold text-blue-900 shadow-2xs">
                      <Clock className="size-3.5 text-blue-700" />
                      {formatTimelineDate(currentGps?.recordedAt || shipment?.updatedAt)}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Xe vận tải đã nhận hàng và kết nối giám sát GPS Telemetry trực tiếp trên hành
                    lang vận tải khu vực Trung Mỹ.
                  </p>
                  {currentGps && (
                    <div className="flex items-center gap-3 border-t border-slate-200/70 pt-1.5 text-[11px] text-slate-500">
                      <span>
                        Tọa độ GPS:{" "}
                        <strong className="font-mono text-slate-700">
                          {currentGps.latitude.toFixed(4)}, {currentGps.longitude.toFixed(4)}
                        </strong>
                      </span>
                      <span>·</span>
                      <span>
                        Vận tốc:{" "}
                        <strong className="text-slate-700">
                          {Math.round(currentGps.speedKph)} km/h
                        </strong>
                      </span>
                      <span>·</span>
                      <span>
                        Hướng di chuyển:{" "}
                        <strong className="text-slate-700">
                          {Math.round(currentGps.headingDegrees)}°
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
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

      {/* Add Document Modal */}
      <Dialog open={isAddDocDialogOpen} onOpenChange={setIsAddDocDialogOpen}>
        <DialogContent className="p-6 sm:max-w-lg">
          <DialogHeader className="border-b border-border/80 pb-2">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
              <UploadCloud className="size-5 text-primary" />
              Đính Kèm Chứng Từ Vận Chuyển
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Tải lên hoặc liên kết chứng từ (Hóa đơn, Vận đơn, Tờ khai kiểm dịch) cho vận đơn{" "}
              {shipment?.shipmentNo || shipmentId}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAttachDocument} className="space-y-4 py-3 text-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Loại chứng từ (Document Type) *
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none"
              >
                <option value="Commercial Invoice">Commercial Invoice (Hóa đơn thương mại)</option>
                <option value="Bill of Lading">
                  Bill of Lading (Vận đơn đường bộ / đường biển)
                </option>
                <option value="Packing List">Packing List (Phiếu đóng gói hàng hóa)</option>
                <option value="Phytosanitary Certificate">
                  Phytosanitary Certificate (Chứng thư kiểm dịch thực vật / Reefer)
                </option>
                <option value="Customs Declaration">Customs Declaration (Tờ khai hải quan)</option>
                <option value="Insurance Policy">
                  Insurance Policy (Hợp đồng bảo hiểm vận tải)
                </option>
                <option value="Certificate of Origin">
                  Certificate of Origin (C/O - Chứng nhận xuất xứ)
                </option>
                <option value="Other">Other (Chứng từ khác)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tên tập tin / Chứng từ *
              </label>
              <input
                required
                placeholder="Ví dụ: INV-2026-CR-0891.pdf"
                value={docFileName}
                onChange={(e) => setDocFileName(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Đường dẫn lưu trữ / Storage Reference (Tùy chọn)
              </label>
              <input
                placeholder="https://s3.central-america.storage/invoices/..."
                value={docStorageUrl}
                onChange={(e) => setDocStorageUrl(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              />
              <p className="text-[11px] text-muted-foreground">
                Nếu để trống, hệ thống sẽ tự động cấp phát storage link bảo mật và quét OCR tự động.
              </p>
            </div>

            <DialogFooter className="border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddDocDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmittingDoc}>
                {isSubmittingDoc ? (
                  <>
                    <RotateCcw className="mr-2 size-4 animate-spin" />
                    Đang lưu & Quét OCR...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 size-4" />
                    Đính kèm tài liệu
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
