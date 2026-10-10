import { useCallback, useEffect, useMemo, useState } from "react";
import { shipmentService, type ShipmentDto } from "@/api/services/shipment.service";
import { trackingService, type CurrentLocationDto } from "@/api/services/tracking.service";
import { findMatchingFacility } from "@/features/route-tracking/route-planning/utils/route-planning-mapper";
import type { LogisticsGeoMarker, LogisticsGeoRoute } from "@/components/common";
import type { RouteMapFixture } from "../../types";
import { liveMapMock, liveShipments } from "../mock";
import { useLiveMapStore } from "../stores/use-live-map-store";
import type { LiveMapFilter, LiveMapFilterState, TrackedShipment } from "../types";
import {
  presentMarkerForSignal,
  presentRouteForSignal,
  presentShipmentForSignal,
} from "../utils/realtime-fixture";
import { EMPTY_LIVE_MAP_FILTERS } from "../constants";

function getShipmentFilterValue(
  shipment: TrackedShipment,
  filter: LiveMapFilter,
) {
  return shipment[filter];
}

function toRealTrackedShipment(
  shipment: ShipmentDto,
  liveLocations: Record<string, CurrentLocationDto>,
  index: number,
): TrackedShipment {
  const originFac = findMatchingFacility(shipment.originAddress, 0);
  const destFac = findMatchingFacility(shipment.destinationAddress, 1);

  const loc = liveLocations[shipment.id];
  const progress = 0.35 + (index % 3) * 0.25;
  const lat = loc
    ? loc.latitude
    : originFac.latitude + (destFac.latitude - originFac.latitude) * progress;
  const lng = loc
    ? loc.longitude
    : originFac.longitude + (destFac.longitude - originFac.longitude) * progress;

  const rawStatus = (shipment.status || "InTransit").toLowerCase();
  const status: TrackedShipment["status"] = rawStatus.includes("delay")
    ? "Delayed"
    : rawStatus.includes("stale")
      ? "GPS stale"
      : rawStatus.includes("hub") ||
          rawStatus.includes("draft") ||
          rawStatus.includes("plan")
        ? "At hub"
        : "In transit";

  const mode: TrackedShipment["mode"] =
    shipment.transportMode === "Ocean"
      ? "Ocean"
      : shipment.transportMode === "Air"
        ? "Air"
        : "Road";

  const risk: TrackedShipment["risk"] = (shipment.riskLevel as any) || "low";
  const speed =
    loc?.speedKph !== undefined ? `${Math.round(loc.speedKph)} km/h` : "62 km/h";
  const heading =
    loc?.headingDegrees !== undefined ? Math.round(loc.headingDegrees) : 315;

  const etaStr = shipment.estimatedEta
    ? new Date(shipment.estimatedEta).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "18:40";

  return {
    id: shipment.shipmentNo || shipment.id,
    shipmentId: shipment.id,
    status,
    detail: `${shipment.customerName} · ${speed} · ETA ${etaStr}`,
    eta: etaStr,
    heading,
    lastUpdated: "Just now",
    speed,
    markerId: `marker-${shipment.id}`,
    risk,
    mode,
    customer: shipment.customerName || "Customer",
    region: "Domestic",
    position: {
      latitude: lat,
      longitude: lng,
    },
  };
}

function buildRealMapData(
  shipments: TrackedShipment[],
  realShipmentDtos: ShipmentDto[],
): { markers: LogisticsGeoMarker[]; routes: RouteMapFixture["routes"] } {
  const markers: LogisticsGeoMarker[] = [];
  const routes: RouteMapFixture["routes"] = [];

  shipments.forEach((shipment) => {
    const raw = realShipmentDtos.find((s) => s.id === shipment.shipmentId);
    const originFac = findMatchingFacility(raw?.originAddress, 0);
    const destFac = findMatchingFacility(raw?.destinationAddress, 1);

    markers.push({
      id: shipment.markerId,
      label: `${shipment.id} · ${shipment.status}`,
      detail: `${shipment.customer} · ${originFac.name} → ${destFac.name}`,
      shipmentId: shipment.shipmentId,
      position: shipment.position,
      heading: shipment.heading,
      tone:
        shipment.status === "Delayed" || shipment.status === "GPS stale"
          ? "alert"
          : shipment.status === "At hub"
            ? "origin"
            : "current",
      metadata: {
        customer: shipment.customer,
        eta: shipment.eta,
        heading: shipment.heading,
        mode: shipment.mode,
        region: shipment.region,
        risk: shipment.risk,
        signal: "Live Telemetry · current",
        speed: shipment.speed,
        status: shipment.status,
      },
    });

    markers.push({
      id: `${shipment.markerId}-origin`,
      label: `${originFac.name.split(" ")[0]} (Origin)`,
      detail: `Origin · ${originFac.name}`,
      shipmentId: shipment.shipmentId,
      position: { latitude: originFac.latitude, longitude: originFac.longitude },
      tone: "origin",
      metadata: {
        customer: shipment.customer,
        eta: shipment.eta,
        risk: shipment.risk,
        signal: "Origin Logistics Hub",
        speed: "0 km/h",
        status: shipment.status,
      },
    });

    markers.push({
      id: `${shipment.markerId}-dest`,
      label: `${destFac.name.split(" ")[0]} (Dest)`,
      detail: `Destination · ${destFac.name}`,
      shipmentId: shipment.shipmentId,
      position: { latitude: destFac.latitude, longitude: destFac.longitude },
      tone: "destination",
      metadata: {
        customer: shipment.customer,
        eta: shipment.eta,
        risk: shipment.risk,
        signal: "Destination Port / Hub",
        speed: "0 km/h",
        status: shipment.status,
      },
    });

    const midLat = (originFac.latitude + destFac.latitude) / 2 + 0.08;
    const midLng = (originFac.longitude + destFac.longitude) / 2 + 0.12;

    routes.push({
      id: `${shipment.markerId}-route`,
      label: `${originFac.name.split(" ")[0]} → ${destFac.name.split(" ")[0]}`,
      kind: "current" as const,
      shipmentId: shipment.shipmentId,
      coordinates: [
        { latitude: originFac.latitude, longitude: originFac.longitude },
        { latitude: midLat, longitude: midLng },
        { latitude: destFac.latitude, longitude: destFac.longitude },
      ],
    });
  });

  return { markers, routes };
}

export function useLiveMapPage() {
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] =
    useState<LiveMapFilterState>(EMPTY_LIVE_MAP_FILTERS);
  const [shipmentPanelOpen, setShipmentPanelOpen] = useState(false);
  const [realShipments, setRealShipments] = useState<ShipmentDto[]>([]);
  const [liveLocations, setLiveLocations] = useState<Record<string, CurrentLocationDto>>({});

  const selectedShipmentId = useLiveMapStore(
    (state) => state.selectedShipmentId,
  );
  const selectedMarkerId = useLiveMapStore((state) => state.selectedMarkerId);
  const realtimeState = useLiveMapStore((state) => state.realtimeState);
  const mapAvailability = useLiveMapStore((state) => state.mapAvailability);
  const selectShipment = useLiveMapStore((state) => state.selectShipment);
  const setMapAvailability = useLiveMapStore(
    (state) => state.setMapAvailability,
  );

  // Query live shipments
  useEffect(() => {
    let isMounted = true;
    shipmentService
      .listShipments({ limit: 50 })
      .then((res) => {
        if (isMounted && res?.shipments && res.shipments.length > 0) {
          setRealShipments(res.shipments);
        }
      })
      .catch(() => {
        // Keep defaults
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Poll GPS telemetry for selected shipment every 2.5s
  useEffect(() => {
    if (!selectedShipmentId) return;
    let isMounted = true;
    const pollSelectedGps = async () => {
      try {
        const loc = await trackingService.getCurrentLocation(selectedShipmentId);
        if (isMounted && loc) {
          setLiveLocations((prev) => ({ ...prev, [selectedShipmentId]: loc }));
        }
      } catch {
        // Ignored
      }
    };
    pollSelectedGps();
    const interval = setInterval(pollSelectedGps, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedShipmentId]);

  const activeShipmentSource = useMemo<TrackedShipment[]>(() => {
    if (realShipments.length > 0) {
      return realShipments.map((s, idx) =>
        toRealTrackedShipment(s, liveLocations, idx),
      );
    }
    return liveShipments;
  }, [liveLocations, realShipments]);

  const activeMapData = useMemo(() => {
    if (realShipments.length > 0) {
      return buildRealMapData(activeShipmentSource, realShipments);
    }
    return liveMapMock;
  }, [activeShipmentSource, realShipments]);

  const displayShipments = useMemo(
    () =>
      activeShipmentSource.map((shipment) =>
        presentShipmentForSignal(shipment, realtimeState),
      ),
    [activeShipmentSource, realtimeState],
  );

  const filteredShipments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return displayShipments.filter((shipment) => {
      const matchesSearch = `${shipment.id} ${shipment.shipmentId} ${shipment.status} ${shipment.customer} ${shipment.mode} ${shipment.region} ${shipment.detail}`
        .toLowerCase()
        .includes(normalizedSearch);
      const matchesFilters = (
        Object.keys(selectedFilters) as LiveMapFilter[]
      ).every((filter) => {
        const selectedValues = selectedFilters[filter] as readonly string[];
        return (
          selectedValues.length === 0 ||
          selectedValues.includes(getShipmentFilterValue(shipment, filter))
        );
      });

      return matchesSearch && matchesFilters;
    });
  }, [displayShipments, search, selectedFilters]);

  const visibleMarkerIds = useMemo(() => {
    const visibleShipmentIds = new Set(
      filteredShipments.map((shipment) => shipment.shipmentId),
    );
    return new Set([
      ...filteredShipments.map((shipment) => shipment.markerId),
      ...activeMapData.markers
        .filter(
          (marker) =>
            marker.shipmentId !== undefined &&
            visibleShipmentIds.has(marker.shipmentId),
        )
        .map((marker) => marker.id),
    ]);
  }, [activeMapData.markers, filteredShipments]);

  const visibleMarkers = useMemo(
    () =>
      activeMapData.markers
        .filter(
          (marker) =>
            visibleMarkerIds.has(marker.id) ||
            (marker.shipmentId !== undefined &&
              filteredShipments.some(
                (shipment) => shipment.shipmentId === marker.shipmentId,
              )),
        )
        .map((marker) => {
          const shipment = displayShipments.find(
            (item) => item.markerId === marker.id,
          );
          const presentedMarker = presentMarkerForSignal(
            marker,
            realtimeState,
          );

          if (!shipment) return presentedMarker;

          return {
            ...presentedMarker,
            metadata: {
              customer: shipment.customer,
              eta: shipment.eta,
              heading: shipment.heading ?? marker.heading,
              mode: shipment.mode,
              region: shipment.region,
              risk: shipment.risk,
              signal:
                realtimeState === "live"
                  ? `Live · ${shipment.lastUpdated ?? "current"}`
                  : realtimeState === "stale"
                    ? "Stale · last known position"
                    : realtimeState === "reconnecting"
                      ? "Reconnecting · last known position"
                      : "Offline · GPS unavailable",
              speed:
                realtimeState === "live"
                  ? shipment.speed
                  : "Unavailable · movement withheld",
              status: shipment.status,
            },
          };
        }),
    [activeMapData.markers, displayShipments, filteredShipments, realtimeState, visibleMarkerIds],
  );

  const visibleRoutes = useMemo(
    () =>
      activeMapData.routes
        .filter((route) =>
          filteredShipments.some((shipment) =>
            route.id.startsWith(shipment.markerId),
          ),
        )
        .map((route) => presentRouteForSignal(route, realtimeState)),
    [activeMapData.routes, filteredShipments, realtimeState],
  );

  const selectMarker = useCallback(
    (markerId: string) => {
      if (!markerId) {
        selectShipment("", "");
        return;
      }

      const shipment = liveShipments.find((item) => item.markerId === markerId);
      selectShipment(shipment?.id ?? "", markerId);
    },
    [selectShipment],
  );

  const selectShipmentFromQueue = useCallback(
    (shipment: (typeof liveShipments)[number]) => {
      selectShipment(shipment.id, shipment.markerId);
    },
    [selectShipment],
  );

  const selectShipmentFromMobileQueue = useCallback(
    (shipment: (typeof liveShipments)[number]) => {
      selectShipmentFromQueue(shipment);
      setShipmentPanelOpen(false);
    },
    [selectShipmentFromQueue],
  );

  const toggleFilter = useCallback(
    (filter: LiveMapFilter, value: string) => {
      setSelectedFilters((current) => {
        const selectedValues = current[filter] as readonly string[];
        const nextValues = selectedValues.includes(value)
          ? selectedValues.filter((selectedValue) => selectedValue !== value)
          : [...selectedValues, value];

        return { ...current, [filter]: nextValues } as LiveMapFilterState;
      });
    },
    [],
  );

  const clearFilter = useCallback((filter: LiveMapFilter) => {
    setSelectedFilters((current) => ({
      ...current,
      [filter]: [],
    }));
  }, []);

  const retryMap = useCallback(() => {
    setMapAvailability("available");
  }, [setMapAvailability]);

  return {
    search,
    setSearch,
    selectedFilters,
    shipmentPanelOpen,
    setShipmentPanelOpen,
    selectedShipmentId,
    selectedMarkerId: visibleMarkerIds.has(selectedMarkerId)
      ? selectedMarkerId
      : undefined,
    filteredShipments,
    visibleMarkers,
    visibleRoutes,
    mapAvailability,
    selectMarker,
    selectShipmentFromQueue,
    selectShipmentFromMobileQueue,
    toggleFilter,
    clearFilter,
    retryMap,
  };
}
