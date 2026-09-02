"use client";

import { useCallback, useMemo, useState } from "react";
import { liveMapMock, liveShipments } from "../mock";
import { useLiveMapStore } from "../stores/use-live-map-store";
import type { LiveMapFilter, LiveMapFilterState } from "../types";
import {
  presentMarkerForSignal,
  presentRouteForSignal,
  presentShipmentForSignal,
} from "../utils/realtime-fixture";
import { EMPTY_LIVE_MAP_FILTERS } from "../constants";

function getShipmentFilterValue(
  shipment: (typeof liveShipments)[number],
  filter: LiveMapFilter,
) {
  return shipment[filter];
}

export function useLiveMapPage() {
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] =
    useState<LiveMapFilterState>(EMPTY_LIVE_MAP_FILTERS);
  const [shipmentPanelOpen, setShipmentPanelOpen] = useState(false);
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

  const displayShipments = useMemo(
    () =>
      liveShipments.map((shipment) =>
        presentShipmentForSignal(shipment, realtimeState),
      ),
    [realtimeState],
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
      ...liveMapMock.markers
        .filter(
          (marker) =>
            marker.shipmentId !== undefined &&
            visibleShipmentIds.has(marker.shipmentId),
        )
        .map((marker) => marker.id),
    ]);
  }, [filteredShipments]);

  const visibleMarkers = useMemo(
    () =>
      liveMapMock.markers
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
                  ? `Simulated · ${shipment.lastUpdated ?? "current"}`
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
    [displayShipments, filteredShipments, realtimeState, visibleMarkerIds],
  );

  const visibleRoutes = useMemo(
    () =>
      liveMapMock.routes
        .filter((route) =>
          filteredShipments.some((shipment) =>
            route.id.startsWith(shipment.markerId),
          ),
        )
        .map((route) => presentRouteForSignal(route, realtimeState)),
    [filteredShipments, realtimeState],
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
