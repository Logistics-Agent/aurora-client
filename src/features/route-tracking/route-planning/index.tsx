"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  Cpu,
  GitCompareArrows,
  Globe2,
  Navigation,
  Package,
  Plane,
  Plus,
  RotateCcw,
  Route as RouteIcon,
  ShieldCheck,
  Ship,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import {
  LogisticsGeoMap,
  MetricCard,
  RiskBadge,
  StatusBadge,
  WorkspaceCard,
} from "@/components/common";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CENTRAL_AMERICA_FACILITIES,
  routeAcceptanceFixture,
} from "./mock";
import {
  type OptimizationCriteria,
  type RoutePlanningTab,
  useRoutePlanningStore,
} from "./stores/use-route-planning-store";
import type {
  CreateShipmentInput,
  CustomStopDraft,
  FacilityPreset,
  RouteAlternative,
  RouteStopType,
} from "./types";
import { routePlanningApiService } from "@/api/services/route-planning.service";

export function RoutePlanningPage() {
  const shipments = useRoutePlanningStore((state) => state.shipments);
  const selectedShipmentId = useRoutePlanningStore(
    (state) => state.selectedShipmentId,
  );
  const selectedRouteId = useRoutePlanningStore(
    (state) => state.selectedRouteId,
  );
  const acceptedRouteId = useRoutePlanningStore(
    (state) => state.acceptedRouteId,
  );
  const activeTab = useRoutePlanningStore((state) => state.activeTab);
  const optimizationCriteria = useRoutePlanningStore(
    (state) => state.optimizationCriteria,
  );
  const calculationState = useRoutePlanningStore(
    (state) => state.calculationState,
  );

  const isLoadingApi = useRoutePlanningStore((state) => state.isLoadingApi);
  const selectShipment = useRoutePlanningStore((state) => state.selectShipment);
  const selectRoute = useRoutePlanningStore((state) => state.selectRoute);
  const acceptRoute = useRoutePlanningStore((state) => state.acceptRoute);
  const setActiveTab = useRoutePlanningStore((state) => state.setActiveTab);
  const setOptimizationCriteria = useRoutePlanningStore(
    (state) => state.setOptimizationCriteria,
  );
  const setCalculationState = useRoutePlanningStore(
    (state) => state.setCalculationState,
  );
  const addShipment = useRoutePlanningStore((state) => state.addShipment);
  const addCustomRouteToShipment = useRoutePlanningStore(
    (state) => state.addCustomRouteToShipment,
  );
  const optimizeRouteWithVroom = useRoutePlanningStore(
    (state) => state.optimizeRouteWithVroom,
  );
  const requestAiRecommendation = useRoutePlanningStore(
    (state) => state.requestAiRecommendation,
  );
  const fetchLiveBackendData = useRoutePlanningStore(
    (state) => state.fetchLiveBackendData,
  );

  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isCreateShipmentOpen, setIsCreateShipmentOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Sync with live backend API on mount
  useEffect(() => {
    fetchLiveBackendData();
  }, [fetchLiveBackendData]);

  // Default Central America Preset Facilities for quick selection
  const defaultOriginFacility = CENTRAL_AMERICA_FACILITIES[0]; // San José Central Cargo Hub (Costa Rica)
  const defaultDestFacility = CENTRAL_AMERICA_FACILITIES[1] || CENTRAL_AMERICA_FACILITIES[0]; // Puerto Barrios (Guatemala)

  // New Shipment Form State
  const [selectedOriginFacilityId, setSelectedOriginFacilityId] = useState(defaultOriginFacility.id);
  const [selectedDestFacilityId, setSelectedDestFacilityId] = useState(defaultDestFacility.id);
  const [isCustomOrigin, setIsCustomOrigin] = useState(false);
  const [isCustomDest, setIsCustomDest] = useState(false);

  const [newShipmentForm, setNewShipmentForm] = useState<CreateShipmentInput>({
    orderId: "",
    customerName: "",
    priority: "Normal",
    transportMode: "Road",
    commodity: "Export Coffee & Fresh Produce (Reefer)",
    weightKg: 18500,
    volumeM3: 48.0,
    packageType: "1 × 40’ High Cube Reefer",
    temperatureControlled: true,
    temperatureRange: "4°C – 8°C (Controlled)",
    originName: defaultOriginFacility.name,
    originAddress: defaultOriginFacility.address,
    originLat: defaultOriginFacility.latitude,
    originLng: defaultOriginFacility.longitude,
    destName: defaultDestFacility.name,
    destAddress: defaultDestFacility.address,
    destLat: defaultDestFacility.latitude,
    destLng: defaultDestFacility.longitude,
  });

  // Manual Route Builder Draft State with Central America default stops
  const [customRouteName, setCustomRouteName] = useState("CA-1 Pan-American Express Corridor");
  const [customRouteType, setCustomRouteType] = useState<"Flexible" | "Fixed" | "OnDemand">("Flexible");
  const [customStops, setCustomStops] = useState<CustomStopDraft[]>([
    {
      id: "cs-1",
      sequence: 1,
      stopType: "Pickup",
      locationName: "San José Central Cargo Hub (CR)",
      address: "Calle Blancos, San José, Costa Rica",
      latitude: 9.9333,
      longitude: -84.0833,
      serviceDurationMinutes: 45,
    },
    {
      id: "cs-2",
      sequence: 2,
      stopType: "Customs",
      locationName: "Paso Canoas Border Station (CR-PA)",
      address: "Puntarenas, Costa Rica Border",
      latitude: 8.5325,
      longitude: -82.8406,
      serviceDurationMinutes: 90,
    },
    {
      id: "cs-3",
      sequence: 3,
      stopType: "Hub",
      locationName: "David Freight Center (PA)",
      address: "David, Chiriquí, Panama",
      latitude: 8.4273,
      longitude: -82.4310,
      serviceDurationMinutes: 60,
    },
    {
      id: "cs-4",
      sequence: 4,
      stopType: "Delivery",
      locationName: "Puerto Barrios Logistics Hub (GT)",
      address: "Puerto Barrios Terminal, Izabal, Guatemala",
      latitude: 15.7278,
      longitude: -88.5944,
      serviceDurationMinutes: 60,
    },
  ]);
  const [isSolving, setIsSolving] = useState(false);
  const [solverResult, setSolverResult] = useState<{
    distanceKm: number;
    durationHours: number;
    risk: "Low" | "Medium" | "High";
  } | null>(null);

  const currentShipment =
    shipments.find((s) => s.id === selectedShipmentId) ?? shipments[0];

  const currentRoutes = currentShipment?.routes || [];
  const currentMapRoutes = currentShipment?.mapRoutes || [];

  const selectedRoute =
    currentRoutes.find((r) => r.id === selectedRouteId) ?? currentRoutes[0];
  const acceptedRoute = currentRoutes.find((r) => r.id === acceptedRouteId);

  // Dynamically compute precise stop milestone markers for the active route
  const dynamicRouteMarkers = useMemo(() => {
    if (selectedRoute?.stops && selectedRoute.stops.length > 0) {
      return selectedRoute.stops.map((stop, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === selectedRoute.stops.length - 1;
        const tone = isFirst
          ? ("origin" as const)
          : isLast
            ? ("destination" as const)
            : stop.stopType === "Customs" || stop.stopType === "Port"
              ? ("alert" as const)
              : ("current" as const);

        return {
          id: `stop-${selectedRoute.id}-${stop.id}`,
          label: `${stop.sequence}. ${stop.locationName}`,
          detail: `${stop.stopType} · ${stop.address}`,
          position: { longitude: stop.longitude, latitude: stop.latitude },
          tone,
        };
      });
    }
    return currentShipment?.markers || [];
  }, [currentShipment?.markers, selectedRoute]);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    setCalculationState("loading");

    try {
      if (selectedRoute?.id) {
        await Promise.allSettled([
          requestAiRecommendation(selectedRoute.id),
          optimizeRouteWithVroom(selectedRoute.id),
        ]);
      }
    } catch {
      // Handled
    } finally {
      setIsRecalculating(false);
      setCalculationState("ready");
    }
  };

  const handleOriginFacilityChange = (facilityId: string) => {
    setSelectedOriginFacilityId(facilityId);
    if (facilityId === "custom") {
      setIsCustomOrigin(true);
    } else {
      setIsCustomOrigin(false);
      const fac = CENTRAL_AMERICA_FACILITIES.find((f) => f.id === facilityId);
      if (fac) {
        setNewShipmentForm((prev) => ({
          ...prev,
          originName: fac.name,
          originAddress: fac.address,
          originLat: fac.latitude,
          originLng: fac.longitude,
        }));
      }
    }
  };

  const handleDestFacilityChange = (facilityId: string) => {
    setSelectedDestFacilityId(facilityId);
    if (facilityId === "custom") {
      setIsCustomDest(true);
    } else {
      setIsCustomDest(false);
      const fac = CENTRAL_AMERICA_FACILITIES.find((f) => f.id === facilityId);
      if (fac) {
        setNewShipmentForm((prev) => ({
          ...prev,
          destName: fac.name,
          destAddress: fac.address,
          destLat: fac.latitude,
          destLng: fac.longitude,
        }));
      }
    }
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShipmentForm.customerName) return;
    await addShipment(newShipmentForm);
    setIsCreateShipmentOpen(false);
  };

  const handleAddStopFromPreset = (facility: FacilityPreset) => {
    const newSeq = customStops.length + 1;
    const newStop: CustomStopDraft = {
      id: `cs-${Date.now()}`,
      sequence: newSeq,
      stopType: facility.type,
      locationName: `${facility.name} (${facility.countryCode})`,
      address: facility.address,
      latitude: facility.latitude,
      longitude: facility.longitude,
      serviceDurationMinutes: 60,
    };
    setCustomStops([...customStops, newStop]);
  };

  const handleAddBlankStop = () => {
    const newSeq = customStops.length + 1;
    const newStop: CustomStopDraft = {
      id: `cs-${Date.now()}`,
      sequence: newSeq,
      stopType: "Hub",
      locationName: `Waypoint Stop ${newSeq}`,
      address: "Intermediate Central America Transit Point",
      latitude: 9.5,
      longitude: -83.5,
      serviceDurationMinutes: 30,
    };
    setCustomStops([...customStops, newStop]);
  };

  const handleRemoveStop = (id: string) => {
    if (customStops.length <= 2) return;
    const filtered = customStops.filter((s) => s.id !== id);
    setCustomStops(
      filtered.map((s, idx) => ({ ...s, sequence: idx + 1 })),
    );
  };

  const handleRunSolver = async () => {
    setIsSolving(true);
    try {
      if (selectedRoute?.id) {
        await optimizeRouteWithVroom(selectedRoute.id);
      }
    } catch {
      // Handled
    } finally {
      setIsSolving(false);
      const approxDistance = Math.round(customStops.length * 240);
      const approxHours = Math.round(approxDistance / 55);
      setSolverResult({
        distanceKm: selectedRoute?.distanceKm ?? approxDistance,
        durationHours: Math.round((selectedRoute?.durationMinutes ?? approxHours * 60) / 60),
        risk: selectedRoute?.risk ?? "Low",
      });
    }
  };

  const handleSaveCustomRoute = () => {
    const routeId = `route-custom-${Date.now()}`;
    const calculatedKm = solverResult?.distanceKm ?? 845;
    const calculatedHours = solverResult?.durationHours ?? 15;

    const newRoute: RouteAlternative = {
      id: routeId,
      name: customRouteName,
      tag: "Alternative",
      distance: `${calculatedKm.toLocaleString()} km`,
      distanceKm: calculatedKm,
      duration: `${calculatedHours}h (Total)`,
      durationMinutes: calculatedHours * 60,
      cost: "$105 / CBM",
      costValue: 105,
      risk: solverResult?.risk ?? "Low",
      governanceDecision: "NoApprovalRequired",
      recommended: false,
      co2EmissionsKg: 290,
      stops: customStops.map((cs) => ({
        id: cs.id,
        sequence: cs.sequence,
        stopType: cs.stopType,
        locationName: cs.locationName,
        address: cs.address,
        latitude: cs.latitude,
        longitude: cs.longitude,
        serviceDurationMinutes: cs.serviceDurationMinutes,
      })),
      coordinates: customStops.map((cs) => ({
        longitude: cs.longitude,
        latitude: cs.latitude,
      })),
    };

    addCustomRouteToShipment(currentShipment.id, newRoute);
    selectRoute(routeId);
    setActiveTab("routes");
  };

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case "Ocean":
        return <Ship className="size-4 text-sky-600" />;
      case "Air":
        return <Plane className="size-4 text-violet-600" />;
      case "Road":
        return <Truck className="size-4 text-amber-600" />;
      default:
        return <Navigation className="size-4 text-primary" />;
    }
  };

  const getStopTypeBadgeClass = (type: string) => {
    switch (type) {
      case "Pickup":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Delivery":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "Port":
        return "bg-sky-100 text-sky-800 border-sky-200";
      case "Customs":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Hub":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (isLoadingApi && shipments.length === 0) {
    return (
      <>
        <PageHeader
          title="Route Planning & Optimization"
          description="Connecting to backend services and loading user shipments..."
        />
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-border bg-slate-50/50 p-8 text-center">
          <RotateCcw className="size-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-semibold text-foreground">Loading shipments from backend...</p>
          <p className="text-xs text-muted-foreground mt-1">Retrieving tenant shipments and OSRM route corridors.</p>
        </div>
      </>
    );
  }

  if (shipments.length === 0) {
    return (
      <>
        <PageHeader
          title="Route Planning & Optimization"
          description="No active shipments found for this account. Create a shipment to start planning."
          actions={
            <Button size="sm" className="gap-1.5" onClick={() => setIsCreateShipmentOpen(true)}>
              <Plus className="size-3.5" />
              Create Shipment
            </Button>
          }
        />
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-slate-50/60 p-8 text-center">
          <Package className="size-12 text-muted-foreground/60 mb-3" />
          <h3 className="text-base font-semibold text-foreground">No Shipments Available</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            There are currently no shipments created for your account. Create a shipment to calculate routes, optimize stops with VROOM, and evaluate AI risk insights.
          </p>
          <Button className="mt-4 gap-1.5" onClick={() => setIsCreateShipmentOpen(true)}>
            <Plus className="size-4" />
            Create First Shipment
          </Button>
        </div>

        {/* Quick Create Shipment Modal */}
        <Dialog open={isCreateShipmentOpen} onOpenChange={setIsCreateShipmentOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="size-5 text-primary" />
                Create Shipment & Plan Route (Central America OSRM)
              </DialogTitle>
              <DialogDescription>
                Select preconfigured Central American logistics facilities or enter custom coordinates for VROOM/OSRM routing.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateShipment} className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Customer Name *</label>
                  <input
                    required
                    placeholder="e.g. TropiFruit Logistics"
                    value={newShipmentForm.customerName}
                    onChange={(e) =>
                      setNewShipmentForm({ ...newShipmentForm, customerName: e.target.value })
                    }
                    className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Order Reference (PO/ID)</label>
                  <input
                    placeholder="e.g. ORD-55421-CR"
                    value={newShipmentForm.orderId}
                    onChange={(e) =>
                      setNewShipmentForm({ ...newShipmentForm, orderId: e.target.value })
                    }
                    className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Priority</label>
                  <select
                    value={newShipmentForm.priority}
                    onChange={(e) =>
                      setNewShipmentForm({
                        ...newShipmentForm,
                        priority: e.target.value as "Normal" | "High" | "Urgent",
                      })
                    }
                    className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Transport Mode</label>
                  <select
                    value={newShipmentForm.transportMode}
                    onChange={(e) =>
                      setNewShipmentForm({
                        ...newShipmentForm,
                        transportMode: e.target.value as any,
                      })
                    }
                    className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="Road">Road (OSRM Highway)</option>
                    <option value="Multimodal">Multimodal</option>
                    <option value="Ocean">Ocean</option>
                    <option value="Air">Air</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Gross Weight (kg)</label>
                  <input
                    type="number"
                    min={1}
                    value={newShipmentForm.weightKg}
                    onChange={(e) =>
                      setNewShipmentForm({
                        ...newShipmentForm,
                        weightKg: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-slate-50/70 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    <Building2 className="size-3.5 text-emerald-600" />
                    Origin Facility (Source Hub)
                  </label>
                  <span className="text-[10px] text-muted-foreground">
                    OSRM Central America Corridor
                  </span>
                </div>

                <select
                  value={selectedOriginFacilityId}
                  onChange={(e) => handleOriginFacilityChange(e.target.value)}
                  className="w-full rounded-md border border-input bg-white px-2.5 py-1.5 text-xs font-medium focus:outline-none"
                >
                  <optgroup label="Central America Hubs & Ports">
                    {CENTRAL_AMERICA_FACILITIES.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        [{fac.countryCode}] {fac.name} — {fac.city} ({fac.type})
                      </option>
                    ))}
                  </optgroup>
                  <option value="custom">-- Custom Facility / Manual Lat-Lng --</option>
                </select>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Facility Name</span>
                    <input
                      required
                      value={newShipmentForm.originName}
                      onChange={(e) =>
                        setNewShipmentForm({ ...newShipmentForm, originName: e.target.value })
                      }
                      className="w-full rounded border border-input bg-white px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Address</span>
                    <input
                      required
                      value={newShipmentForm.originAddress}
                      onChange={(e) =>
                        setNewShipmentForm({ ...newShipmentForm, originAddress: e.target.value })
                      }
                      className="w-full rounded border border-input bg-white px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-slate-50/70 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    <Globe2 className="size-3.5 text-blue-600" />
                    Destination Facility (Delivery Hub)
                  </label>
                  <span className="text-[10px] text-muted-foreground">
                    OSRM Central America Corridor
                  </span>
                </div>

                <select
                  value={selectedDestFacilityId}
                  onChange={(e) => handleDestFacilityChange(e.target.value)}
                  className="w-full rounded-md border border-input bg-white px-2.5 py-1.5 text-xs font-medium focus:outline-none"
                >
                  <optgroup label="Central America Hubs & Ports">
                    {CENTRAL_AMERICA_FACILITIES.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        [{fac.countryCode}] {fac.name} — {fac.city} ({fac.type})
                      </option>
                    ))}
                  </optgroup>
                  <option value="custom">-- Custom Facility / Manual Lat-Lng --</option>
                </select>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Facility Name</span>
                    <input
                      required
                      value={newShipmentForm.destName}
                      onChange={(e) =>
                        setNewShipmentForm({ ...newShipmentForm, destName: e.target.value })
                      }
                      className="w-full rounded border border-input bg-white px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Address</span>
                    <input
                      required
                      value={newShipmentForm.destAddress}
                      onChange={(e) =>
                        setNewShipmentForm({ ...newShipmentForm, destAddress: e.target.value })
                      }
                      className="w-full rounded border border-input bg-white px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateShipmentOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Create & Initialize OSRM Route
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Route Planning & Optimization"
        description={`${currentShipment.shipmentNo} · ${currentShipment.customerName} · ${currentShipment.origin.name.split(" ")[0]} → ${currentShipment.destination.name.split(" ")[0]} · human acceptance required`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Shipment selector */}
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 shadow-sm">
              <Package className="size-4 text-muted-foreground" />
              <select
                aria-label="Select shipment for route planning"
                value={selectedShipmentId}
                onChange={(e) => selectShipment(e.target.value)}
                className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer max-w-[280px] truncate"
              >
                {shipments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shipmentNo} — {s.customerName}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Create Shipment Modal with Central America presets */}
            <Dialog open={isCreateShipmentOpen} onOpenChange={setIsCreateShipmentOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 shadow-xs">
                  <Plus className="size-3.5" />
                  Create Shipment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Package className="size-5 text-primary" />
                    Create Shipment & Plan Route (Central America OSRM)
                  </DialogTitle>
                  <DialogDescription>
                    Select preconfigured Central American logistics facilities or enter custom coordinates for VROOM/OSRM routing.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateShipment} className="space-y-4 py-2 text-xs">
                  {/* Basic Shipment info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-foreground">Customer Name *</label>
                      <input
                        required
                        placeholder="e.g. TropiFruit Logistics"
                        value={newShipmentForm.customerName}
                        onChange={(e) =>
                          setNewShipmentForm({ ...newShipmentForm, customerName: e.target.value })
                        }
                        className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-foreground">Order Reference (PO/ID)</label>
                      <input
                        placeholder="e.g. ORD-55421-CR"
                        value={newShipmentForm.orderId}
                        onChange={(e) =>
                          setNewShipmentForm({ ...newShipmentForm, orderId: e.target.value })
                        }
                        className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Cargo and Transport specs */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-foreground">Priority</label>
                      <select
                        value={newShipmentForm.priority}
                        onChange={(e) =>
                          setNewShipmentForm({
                            ...newShipmentForm,
                            priority: e.target.value as "Normal" | "High" | "Urgent",
                          })
                        }
                        className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                      >
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-foreground">Transport Mode</label>
                      <select
                        value={newShipmentForm.transportMode}
                        onChange={(e) =>
                          setNewShipmentForm({
                            ...newShipmentForm,
                            transportMode: e.target.value as any,
                          })
                        }
                        className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                      >
                        <option value="Road">Road (OSRM Highway)</option>
                        <option value="Multimodal">Multimodal</option>
                        <option value="Ocean">Ocean</option>
                        <option value="Air">Air</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-foreground">Gross Weight (kg)</label>
                      <input
                        type="number"
                        min={1}
                        value={newShipmentForm.weightKg}
                        onChange={(e) =>
                          setNewShipmentForm({
                            ...newShipmentForm,
                            weightKg: Number(e.target.value),
                          })
                        }
                        className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* SOURCE FACILITY SELECTION (Central America Presets) */}
                  <div className="rounded-lg border border-border bg-slate-50/70 p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-foreground flex items-center gap-1.5">
                        <Building2 className="size-3.5 text-emerald-600" />
                        Origin Facility (Source Hub)
                      </label>
                      <span className="text-[10px] text-muted-foreground">
                        OSRM Central America Corridor
                      </span>
                    </div>

                    <select
                      value={selectedOriginFacilityId}
                      onChange={(e) => handleOriginFacilityChange(e.target.value)}
                      className="w-full rounded-md border border-input bg-white px-2.5 py-1.5 text-xs font-medium focus:outline-none"
                    >
                      <optgroup label="Central America Hubs & Ports">
                        {CENTRAL_AMERICA_FACILITIES.map((fac) => (
                          <option key={fac.id} value={fac.id}>
                            [{fac.countryCode}] {fac.name} — {fac.city} ({fac.type})
                          </option>
                        ))}
                      </optgroup>
                      <option value="custom">-- Custom Facility / Manual Lat-Lng --</option>
                    </select>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Facility Name</span>
                        <input
                          required
                          value={newShipmentForm.originName}
                          onChange={(e) =>
                            setNewShipmentForm({ ...newShipmentForm, originName: e.target.value })
                          }
                          className="w-full rounded border border-input bg-white px-2 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Address</span>
                        <input
                          required
                          value={newShipmentForm.originAddress}
                          onChange={(e) =>
                            setNewShipmentForm({ ...newShipmentForm, originAddress: e.target.value })
                          }
                          className="w-full rounded border border-input bg-white px-2 py-1 text-xs"
                        />
                      </div>
                    </div>

                    {isCustomOrigin && (
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Latitude</span>
                          <input
                            type="number"
                            step="any"
                            value={newShipmentForm.originLat}
                            onChange={(e) =>
                              setNewShipmentForm({ ...newShipmentForm, originLat: Number(e.target.value) })
                            }
                            className="w-full rounded border border-input bg-white px-2 py-1 text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Longitude</span>
                          <input
                            type="number"
                            step="any"
                            value={newShipmentForm.originLng}
                            onChange={(e) =>
                              setNewShipmentForm({ ...newShipmentForm, originLng: Number(e.target.value) })
                            }
                            className="w-full rounded border border-input bg-white px-2 py-1 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DESTINATION FACILITY SELECTION (Central America Presets) */}
                  <div className="rounded-lg border border-border bg-slate-50/70 p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-foreground flex items-center gap-1.5">
                        <Globe2 className="size-3.5 text-blue-600" />
                        Destination Facility (Delivery Hub)
                      </label>
                      <span className="text-[10px] text-muted-foreground">
                        OSRM Central America Corridor
                      </span>
                    </div>

                    <select
                      value={selectedDestFacilityId}
                      onChange={(e) => handleDestFacilityChange(e.target.value)}
                      className="w-full rounded-md border border-input bg-white px-2.5 py-1.5 text-xs font-medium focus:outline-none"
                    >
                      <optgroup label="Central America Hubs & Ports">
                        {CENTRAL_AMERICA_FACILITIES.map((fac) => (
                          <option key={fac.id} value={fac.id}>
                            [{fac.countryCode}] {fac.name} — {fac.city} ({fac.type})
                          </option>
                        ))}
                      </optgroup>
                      <option value="custom">-- Custom Facility / Manual Lat-Lng --</option>
                    </select>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Facility Name</span>
                        <input
                          required
                          value={newShipmentForm.destName}
                          onChange={(e) =>
                            setNewShipmentForm({ ...newShipmentForm, destName: e.target.value })
                          }
                          className="w-full rounded border border-input bg-white px-2 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Address</span>
                        <input
                          required
                          value={newShipmentForm.destAddress}
                          onChange={(e) =>
                            setNewShipmentForm({ ...newShipmentForm, destAddress: e.target.value })
                          }
                          className="w-full rounded border border-input bg-white px-2 py-1 text-xs"
                        />
                      </div>
                    </div>

                    {isCustomDest && (
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Latitude</span>
                          <input
                            type="number"
                            step="any"
                            value={newShipmentForm.destLat}
                            onChange={(e) =>
                              setNewShipmentForm({ ...newShipmentForm, destLat: Number(e.target.value) })
                            }
                            className="w-full rounded border border-input bg-white px-2 py-1 text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Longitude</span>
                          <input
                            type="number"
                            step="any"
                            value={newShipmentForm.destLng}
                            onChange={(e) =>
                              setNewShipmentForm({ ...newShipmentForm, destLng: Number(e.target.value) })
                            }
                            className="w-full rounded border border-input bg-white px-2 py-1 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <DialogFooter className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCreateShipmentOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm">
                      Create & Initialize OSRM Route
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Main Responsive Layout: Map on left, Control Panel on right */}
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] xl:grid-cols-[1.65fr_0.95fr] min-h-[calc(100dvh-13rem)]">
        {/* Left Column: Full-Height Interactive Map with dynamic stop markers */}
        <div className="flex flex-col h-full">
          <WorkspaceCard className="flex-1 flex flex-col p-0 overflow-hidden min-h-[540px] lg:min-h-[calc(100dvh-14rem)]">
            {calculationState === "failed" ? (
              <div className="grid min-h-[32rem] place-items-center rounded-xl border border-red-200 bg-red-50 p-6 text-center m-4">
                <div className="max-w-sm space-y-3">
                  <AlertTriangle className="mx-auto size-7 text-red-600" />
                  <p className="font-semibold text-red-900">
                    Route calculation failed
                  </p>
                  <p className="text-xs text-red-700">
                    Routing solver service could not resolve optimal corridors for the given waypoints.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCalculationState("ready")}
                  >
                    Retry calculation
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative h-full min-h-[540px] w-full flex-1">
                <LogisticsGeoMap
                  markers={dynamicRouteMarkers}
                  routes={currentMapRoutes}
                  selectedRouteId={selectedRoute?.id}
                  className="h-full min-h-[540px] w-full flex-1 rounded-none border-0"
                />
              </div>
            )}
          </WorkspaceCard>
        </div>

        {/* Right Column: Dynamic Tabs & Action Controls */}
        <div className="flex flex-col gap-4">
          <WorkspaceCard>
            {/* Shipment Header Banner */}
            <div className="border-b border-border pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">
                    {currentShipment.customerName}
                  </h3>
                  <span className="text-xs font-mono text-muted-foreground">
                    {currentShipment.orderId}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusBadge
                    label={currentShipment.priority}
                    intent={
                      currentShipment.priority === "Urgent"
                        ? "critical"
                        : currentShipment.priority === "High"
                          ? "warning"
                          : "success"
                    }
                  />
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                    {getTransportIcon(currentShipment.transportMode)}
                    {currentShipment.transportMode}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {currentShipment.cargo.commodity} · {currentShipment.cargo.packageType}
              </p>
            </div>

            {/* TAB NAVIGATION */}
            <div className="mt-3 grid grid-cols-4 gap-1 rounded-lg bg-slate-100/90 p-1 text-xs font-medium text-muted-foreground">
              <button
                type="button"
                onClick={() => setActiveTab("routes")}
                className={`rounded-md py-1.5 text-center transition-all ${
                  activeTab === "routes"
                    ? "bg-white text-foreground shadow-xs font-semibold"
                    : "hover:text-foreground"
                }`}
              >
                Proposed Routes
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("shipment")}
                className={`rounded-md py-1.5 text-center transition-all ${
                  activeTab === "shipment"
                    ? "bg-white text-foreground shadow-xs font-semibold"
                    : "hover:text-foreground"
                }`}
              >
                Cargo Specs
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("parameters")}
                className={`rounded-md py-1.5 text-center transition-all ${
                  activeTab === "parameters"
                    ? "bg-white text-foreground shadow-xs font-semibold"
                    : "hover:text-foreground"
                }`}
              >
                Waypoints
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("builder")}
                className={`rounded-md py-1.5 text-center transition-all ${
                  activeTab === "builder"
                    ? "bg-white text-foreground shadow-xs font-semibold"
                    : "hover:text-foreground"
                }`}
              >
                Route Builder
              </button>
            </div>

            {/* TAB 1: PROPOSED ROUTES */}
            {activeTab === "routes" && (
              <div className="mt-4 space-y-3.5">
                <div className="space-y-2.5">
                  {currentRoutes.map((route) => {
                    const isSelected = route.id === selectedRouteId;
                    const isAccepted = route.id === acceptedRouteId;

                    return (
                      <div
                        key={route.id}
                        role="button"
                        aria-pressed={isSelected}
                        tabIndex={0}
                        onClick={() => selectRoute(route.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            selectRoute(route.id);
                          }
                        }}
                        aria-label={`Choose ${route.name}`}
                        className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary bg-blue-50/50 shadow-sm ring-2 ring-primary/40"
                            : "border-border bg-card hover:bg-slate-50/70"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-sm text-foreground">
                                {route.name}
                              </p>
                              {route.tag && (
                                <span
                                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                                    route.tag === "AI Recommended"
                                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                                      : "bg-slate-100 text-slate-700 border border-slate-200"
                                  }`}
                                >
                                  {route.tag}
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span>
                                Duration: <strong className="text-foreground">{route.duration}</strong>
                              </span>
                              <span>
                                Cost: <strong className="text-foreground">{route.cost}</strong>
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                              Risk Level
                            </span>
                            <span
                              className={`text-xs font-semibold ${
                                route.risk === "Low"
                                  ? "text-emerald-600"
                                  : route.risk === "Medium"
                                    ? "text-amber-600"
                                    : "text-red-600"
                              }`}
                            >
                              {route.risk}
                            </span>
                          </div>
                        </div>

                        {/* Route Stops / Milestones preview */}
                        <div className="mt-2.5 border-t border-slate-100 pt-2 text-xs">
                          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1">
                            <RouteIcon className="size-3 text-slate-400" />
                            Route Stops & Milestones ({route.stops.length})
                          </p>
                          <div className="mt-1.5 space-y-1">
                            {route.stops.map((s) => (
                              <div
                                key={s.id}
                                className="flex items-center justify-between text-[11px] text-slate-600 bg-white/70 px-2 py-1 rounded border border-slate-100"
                              >
                                <span className="truncate">
                                  <strong className="text-foreground mr-1">{s.sequence}.</strong>
                                  {s.locationName}
                                </span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded border font-medium ${getStopTypeBadgeClass(
                                    s.stopType,
                                  )}`}
                                >
                                  {s.stopType}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {isAccepted && (
                          <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <Check className="size-3.5 text-emerald-600" />
                            <span>Currently Assigned to this Shipment</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* AI INSIGHT CARD */}
                <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3.5 text-xs text-purple-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-purple-900 flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-purple-600" />
                      AI INSIGHT · {currentShipment.aiRecommendation.confidence}% CONFIDENCE
                    </p>
                  </div>
                  <p className="font-semibold text-purple-900 leading-snug">
                    {currentShipment.aiRecommendation.summary}
                  </p>
                  <p className="text-[11px] text-purple-800/90 leading-relaxed">
                    <span className="font-medium">Why:</span> {currentShipment.aiRecommendation.reason}
                  </p>
                  <p className="text-[10px] text-purple-700/80">
                    Sources: {currentShipment.aiRecommendation.sources.join(" · ")}
                  </p>
                  <p className="text-[11px] font-medium text-purple-900 pt-1 border-t border-purple-200/50">
                    Suggested action: {currentShipment.aiRecommendation.suggestedAction}
                  </p>
                </div>

                {/* ACTIONS: Compare Dialog & Accept Route Button */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  {/* SPACIOUS ROUTE COMPARISON MODAL */}
                  <Dialog open={isCompareOpen} onOpenChange={setIsCompareOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <GitCompareArrows className="size-3.5" />
                        Compare routes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-4xl lg:max-w-5xl w-full p-6 max-h-[88vh] overflow-y-auto">
                      <DialogHeader className="space-y-1.5 border-b border-border pb-3">
                        <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                          <GitCompareArrows className="size-5 text-primary" />
                          Route Comparison & Corridor Analysis
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                          Evaluate candidate corridors for {currentShipment.shipmentNo} ({currentShipment.customerName}) across transit duration, freight rate, stops, environmental CO2 footprint, and compliance risk.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="mt-4 overflow-x-auto rounded-xl border border-border shadow-xs">
                        <table className="w-full text-left text-xs min-w-[700px]">
                          <thead className="bg-slate-50/90 text-muted-foreground font-semibold border-b border-border">
                            <tr>
                              <th className="px-4 py-3 min-w-[200px]">Corridor Name</th>
                              <th className="px-3.5 py-3">Duration</th>
                              <th className="px-3.5 py-3">Rate / Cost</th>
                              <th className="px-3.5 py-3">Stops</th>
                              <th className="px-3.5 py-3">CO2 Est.</th>
                              <th className="px-3.5 py-3">Risk Level</th>
                              <th className="px-3.5 py-3">Governance</th>
                              <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border bg-white">
                            {currentRoutes.map((route) => {
                              const isCurrentlyActive = route.id === selectedRouteId;
                              return (
                                <tr
                                  key={route.id}
                                  className={`transition-colors ${
                                    isCurrentlyActive ? "bg-blue-50/40 font-medium" : "hover:bg-slate-50/60"
                                  }`}
                                >
                                  <td className="px-4 py-3.5">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-foreground">
                                        {route.name}
                                      </span>
                                      {route.tag && (
                                        <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-700">
                                          {route.tag}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-0.5 font-normal">
                                      {route.distance}
                                    </p>
                                  </td>
                                  <td className="px-3.5 py-3.5 font-mono">{route.duration}</td>
                                  <td className="px-3.5 py-3.5 font-semibold text-emerald-600 font-mono">
                                    {route.cost}
                                  </td>
                                  <td className="px-3.5 py-3.5">{route.stops.length} milestones</td>
                                  <td className="px-3.5 py-3.5 text-muted-foreground font-mono">
                                    {route.co2EmissionsKg ?? 280} kg
                                  </td>
                                  <td className="px-3.5 py-3.5">
                                    <RiskBadge
                                      level={
                                        route.risk === "High"
                                          ? "high"
                                          : route.risk === "Medium"
                                            ? "medium"
                                            : "low"
                                      }
                                    />
                                  </td>
                                  <td className="px-3.5 py-3.5 text-[11px] text-muted-foreground">
                                    {route.governanceDecision}
                                  </td>
                                  <td className="px-4 py-3.5 text-right">
                                    <Button
                                      size="sm"
                                      variant={isCurrentlyActive ? "default" : "outline"}
                                      className="h-7 text-xs gap-1"
                                      onClick={() => {
                                        selectRoute(route.id);
                                        setIsCompareOpen(false);
                                      }}
                                    >
                                      {isCurrentlyActive ? (
                                        <>
                                          <Check className="size-3" /> Selected
                                        </>
                                      ) : (
                                        "Select Corridor"
                                      )}
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    type="button"
                    disabled={!selectedRoute || calculationState === "failed"}
                    onClick={() => selectedRoute && acceptRoute(selectedRoute.id)}
                  >
                    <Check className="size-4" />
                    Accept & Assign {selectedRoute?.name.split("·")[0] ?? "route"}
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 2: SHIPMENT & CARGO SPECS */}
            {activeTab === "shipment" && (
              <div className="mt-4 space-y-4 text-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                  <MetricCard
                    label="Gross Cargo Weight"
                    value={`${currentShipment.cargo.weightKg.toLocaleString()} kg`}
                  />
                  <MetricCard
                    label="Total Volume"
                    value={`${currentShipment.cargo.volumeM3} m³`}
                  />
                  <MetricCard
                    label="Package Equipment"
                    value={currentShipment.cargo.packageType}
                  />
                  <MetricCard
                    label="Temperature Control"
                    value={
                      currentShipment.cargo.temperatureRange ?? "Standard Ambient"
                    }
                  />
                </div>

                <div className="space-y-3 rounded-xl border border-border p-3.5 bg-slate-50/60">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Origin & Destination Contact
                  </p>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-semibold text-foreground">Origin: </span>
                      <span>{currentShipment.origin.name} — {currentShipment.origin.address}</span>
                      {currentShipment.origin.contactName && (
                        <p className="text-slate-500 mt-0.5">
                          Contact: {currentShipment.origin.contactName} ({currentShipment.origin.contactPhone})
                        </p>
                      )}
                    </div>
                    <div className="border-t border-slate-200 pt-2">
                      <span className="font-semibold text-foreground">Destination: </span>
                      <span>{currentShipment.destination.name} — {currentShipment.destination.address}</span>
                      {currentShipment.destination.contactName && (
                        <p className="text-slate-500 mt-0.5">
                          Contact: {currentShipment.destination.contactName} ({currentShipment.destination.contactPhone})
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: WAYPOINTS & OPTIMIZATION PARAMETERS */}
            {activeTab === "parameters" && (
              <div className="mt-4 space-y-4 text-sm">
                {/* Locations list */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Routing Stops & Waypoints ({currentShipment.waypoints.length})
                  </label>
                  <div className="space-y-2">
                    {currentShipment.waypoints.map((wp, idx) => {
                      const isOrigin = wp.stopType === "Pickup";
                      const isDest = wp.stopType === "Delivery";
                      return (
                        <div
                          key={wp.id}
                          className="flex items-center gap-2 rounded-lg border border-border bg-white p-2.5 text-xs"
                        >
                          <div
                            className={`grid size-6 shrink-0 place-items-center rounded-full font-bold text-[10px] ${
                              isOrigin
                                ? "bg-emerald-100 text-emerald-700"
                                : isDest
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {isOrigin ? "A" : isDest ? "B" : idx}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{wp.locationName}</p>
                            <p className="text-slate-400 truncate text-[11px]">{wp.address}</p>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded border font-medium ${getStopTypeBadgeClass(
                              wp.stopType,
                            )}`}
                          >
                            {wp.stopType}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Optimization Strategy selection */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Optimization Strategy
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(
                      [
                        { id: "balanced", label: "AI Balanced", desc: "Lowest overall delay risk" },
                        { id: "fastest", label: "Fastest ETA", desc: "Express priority lane" },
                        { id: "lowest_cost", label: "Lowest Cost", desc: "Eco & budget mode" },
                        { id: "avoid_tolls", label: "Avoid Congestion", desc: "Bypass border bottlenecks" },
                      ] as const
                    ).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setOptimizationCriteria(c.id)}
                        className={`rounded-lg border p-2.5 text-left transition-all ${
                          optimizationCriteria === c.id
                            ? "border-primary bg-blue-50 text-primary font-semibold"
                            : "border-border text-foreground hover:bg-slate-50"
                        }`}
                      >
                        <p>{c.label}</p>
                        <p className="text-[10px] text-muted-foreground font-normal mt-0.5">{c.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="button"
                  className="w-full mt-3"
                  onClick={handleRecalculate}
                  disabled={isRecalculating}
                >
                  <RotateCcw className={`size-4 ${isRecalculating ? "animate-spin" : ""}`} />
                  {isRecalculating ? "Recalculating routes via OSRM..." : "Recalculate AI Routes"}
                </Button>
              </div>
            )}

            {/* TAB 4: MANUAL ROUTE BUILDER & SOLVER */}
            {activeTab === "builder" && (
              <div className="mt-4 space-y-4 text-xs">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="font-semibold text-foreground">Route Corridor Name</label>
                      <input
                        value={customRouteName}
                        onChange={(e) => setCustomRouteName(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-foreground">Corridor Type</label>
                      <select
                        value={customRouteType}
                        onChange={(e) => setCustomRouteType(e.target.value as any)}
                        className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                      >
                        <option value="Flexible">Flexible Corridor (Recommended)</option>
                        <option value="Fixed">Fixed Standard Corridor</option>
                        <option value="OnDemand">On-Demand Dispatch</option>
                      </select>
                    </div>
                  </div>

                  {/* Preset Facilities Quick Selector */}
                  <div className="rounded-lg border border-border bg-slate-50/70 p-2.5 space-y-2">
                    <label className="font-semibold text-foreground flex items-center gap-1 text-[11px]">
                      <Building2 className="size-3.5 text-primary" />
                      Quick Add Central America Stop
                    </label>
                    <div className="flex gap-1.5">
                      <select
                        id="preset-facility-select"
                        className="flex-1 rounded border border-input bg-white px-2 py-1 text-xs focus:outline-none"
                        defaultValue={CENTRAL_AMERICA_FACILITIES[1].id}
                        onChange={(e) => {
                          const fac = CENTRAL_AMERICA_FACILITIES.find((f) => f.id === e.target.value);
                          if (fac) handleAddStopFromPreset(fac);
                        }}
                      >
                        <option value="" disabled>-- Select Facility to Add --</option>
                        {CENTRAL_AMERICA_FACILITIES.map((fac) => (
                          <option key={fac.id} value={fac.id}>
                            [{fac.countryCode}] {fac.name} ({fac.type})
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddBlankStop}
                        className="h-7 text-[11px]"
                      >
                        <Plus className="size-3" /> Blank Stop
                      </Button>
                    </div>
                  </div>

                  {/* Stops list builder */}
                  <div className="space-y-2">
                    <label className="font-semibold text-foreground block">
                      Custom Stops Sequence ({customStops.length})
                    </label>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {customStops.map((stop, idx) => (
                        <div
                          key={stop.id}
                          className="flex items-center gap-2 rounded-lg border border-border bg-slate-50/70 p-2 text-xs"
                        >
                          <span className="grid size-5 shrink-0 place-items-center rounded bg-slate-200 font-bold text-[10px]">
                            {idx + 1}
                          </span>
                          <select
                            value={stop.stopType}
                            onChange={(e) => {
                              const updated = customStops.map((s) =>
                                s.id === stop.id
                                  ? { ...s, stopType: e.target.value as RouteStopType }
                                  : s,
                              );
                              setCustomStops(updated);
                            }}
                            className="rounded border border-border bg-white px-1.5 py-1 text-[11px] focus:outline-none"
                          >
                            <option value="Pickup">Pickup</option>
                            <option value="Port">Port</option>
                            <option value="Customs">Customs</option>
                            <option value="Hub">Hub</option>
                            <option value="Warehouse">Warehouse</option>
                            <option value="Delivery">Delivery</option>
                          </select>
                          <input
                            value={stop.locationName}
                            onChange={(e) => {
                              const updated = customStops.map((s) =>
                                s.id === stop.id
                                  ? { ...s, locationName: e.target.value }
                                  : s,
                              );
                              setCustomStops(updated);
                            }}
                            placeholder="Location name"
                            className="flex-1 rounded border border-border bg-white px-2 py-1 text-[11px] min-w-0"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveStop(stop.id)}
                            disabled={customStops.length <= 2}
                            aria-label="Remove stop"
                            className="text-slate-400 hover:text-red-600 disabled:opacity-30"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Solver & AI actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRunSolver}
                      disabled={isSolving}
                      className="gap-1.5 text-xs"
                    >
                      <Cpu className={`size-3.5 ${isSolving ? "animate-spin" : ""}`} />
                      {isSolving ? "Solving..." : "Run VROOM Solver"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSaveCustomRoute}
                      className="gap-1.5 text-xs"
                    >
                      <ShieldCheck className="size-3.5" />
                      Save & Link Route
                    </Button>
                  </div>

                  {solverResult && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-2.5 text-xs text-blue-900 space-y-1">
                      <p className="font-semibold flex items-center gap-1 text-[11px]">
                        <Check className="size-3 text-blue-700" /> OSRM Solver Optimized Result:
                      </p>
                      <p className="text-[11px] text-blue-800">
                        Distance: <strong>{solverResult.distanceKm} km</strong> · Duration: <strong>{solverResult.durationHours}h</strong> · Risk: <strong>{solverResult.risk}</strong>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <p className="mt-4 flex items-center gap-1 text-[11px] text-muted-foreground border-t border-border pt-3">
              <Sparkles className="size-3" /> Connected API: Staff.BFF (/api/v1/routes, /api/v1/shipments) · OSRM Central America
            </p>
          </WorkspaceCard>

          {/* Acceptance Confirmation Card in the Bottom-Right Yellow Zone (does not shift layout) */}
          {acceptedRoute && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/95 p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-600 text-white shadow-xs">
                  <Check className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-xs text-emerald-950 uppercase tracking-wide">
                      Route Approved & Dispatched
                    </p>
                    <span className="rounded-full bg-emerald-200/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-900">
                      Bound to {currentShipment.shipmentNo}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-emerald-900">
                    {acceptedRoute.name}
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-emerald-800 border-t border-emerald-200/80 pt-2">
                    <p>
                      <span className="font-medium">Shipment ID:</span> {currentShipment.shipmentNo} ({currentShipment.customerName})
                    </p>
                    <p>
                      <span className="font-medium">Reviewer:</span> {routeAcceptanceFixture.reviewer}
                    </p>
                    <p>
                      <span className="font-medium">Timestamp:</span> {routeAcceptanceFixture.timestamp}
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      <span className="font-medium">Policy:</span> platform-default-route-governance (v1.2)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
