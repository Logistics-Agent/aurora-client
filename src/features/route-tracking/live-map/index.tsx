"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import {
  LogisticsGeoMap,
  RealtimeStatus,
  RiskBadge,
  WorkspaceCard,
} from "@/components/common";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { liveMapMock, liveShipments } from "./mock";
import { useLiveMapStore } from "./stores/use-live-map-store";
import { RealtimeBanner } from "../components/realtime-banner";
import { RealtimeFixtureControls } from "../components/realtime-fixture-controls";
import { ShipmentDrawer } from "./components/shipment-drawer";
import type { LiveMapFilter } from "./types";
import {
  presentMarkerForSignal,
  presentRouteForSignal,
  presentShipmentForSignal,
} from "./utils/realtime-fixture";

const filters: Array<{
  id: LiveMapFilter;
  label: string;
  matches: (shipment: (typeof liveShipments)[number]) => boolean;
}> = [
  {
    id: "status",
    label: "Status: delayed",
    matches: (shipment) => shipment.status === "Delayed",
  },
  {
    id: "mode",
    label: "Mode: road",
    matches: (shipment) => shipment.mode === "Road",
  },
  {
    id: "risk",
    label: "Risk: high",
    matches: (shipment) => shipment.risk === "high",
  },
  {
    id: "customer",
    label: "Customer: Northstar",
    matches: (shipment) => shipment.customer === "Northstar",
  },
  {
    id: "region",
    label: "Region: SEA",
    matches: (shipment) => shipment.region === "SEA",
  },
];

export function LiveMapPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<LiveMapFilter>();
  const selectedShipmentId = useLiveMapStore(
    (state) => state.selectedShipmentId,
  );
  const selectedMarkerId = useLiveMapStore((state) => state.selectedMarkerId);
  const realtimeState = useLiveMapStore((state) => state.realtimeState);
  const mapAvailability = useLiveMapStore((state) => state.mapAvailability);
  const selectShipment = useLiveMapStore((state) => state.selectShipment);
  const setRealtimeState = useLiveMapStore((state) => state.setRealtimeState);
  const setMapAvailability = useLiveMapStore(
    (state) => state.setMapAvailability,
  );
  const displayShipments = liveShipments.map((shipment) =>
    presentShipmentForSignal(shipment, realtimeState),
  );
  const selectedShipment = displayShipments.find(
    (shipment) => shipment.id === selectedShipmentId,
  );
  const selectedFilter = filters.find((filter) => filter.id === activeFilter);
  const filteredShipments = displayShipments.filter(
    (shipment) =>
      `${shipment.id} ${shipment.shipmentId} ${shipment.status} ${shipment.detail}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()) &&
      (!selectedFilter || selectedFilter.matches(shipment)),
  );
  const visibleMarkerIds = new Set(
    filteredShipments.map((shipment) => shipment.markerId),
  );
  const visibleMarkers = liveMapMock.markers
    .filter((marker) => visibleMarkerIds.has(marker.id))
    .map((marker) => presentMarkerForSignal(marker, realtimeState));
  const visibleRoutes = liveMapMock.routes
    .filter((route) =>
      filteredShipments.some((shipment) =>
        route.id.startsWith(shipment.markerId),
      ),
    )
    .map((route) => presentRouteForSignal(route, realtimeState));
  const visibleSelectedShipment = filteredShipments.find(
    (shipment) => shipment.id === selectedShipment?.id,
  );

  function reconnect() {
    setRealtimeState("reconnecting");
    window.setTimeout(() => setRealtimeState("live"), 800);
  }

  function selectMarker(markerId: string) {
    const shipment = liveShipments.find((item) => item.markerId === markerId);
    if (shipment) selectShipment(shipment.id, markerId);
  }

  return (
    <>
      <PageHeader
        title="Live Operations Map"
        description="Fleet positions, exceptions and last-known GPS context"
        actions={
          <RealtimeFixtureControls
            realtimeState={realtimeState}
            mapAvailability={mapAvailability}
            onRealtimeStateChange={setRealtimeState}
            onMapAvailabilityChange={setMapAvailability}
          />
        }
      />
      <div className="relative">
        <LogisticsGeoMap
          className="min-h-[36rem]"
          routes={visibleRoutes}
          markers={visibleMarkers}
          selectedMarkerId={
            visibleMarkerIds.has(selectedMarkerId)
              ? selectedMarkerId
              : undefined
          }
          onMarkerSelect={selectMarker}
          loading={mapAvailability === "loading"}
          unavailable={mapAvailability === "unavailable"}
          onRetry={() => setMapAvailability("available")}
        >
          <div className="absolute left-4 right-4 top-4 z-30 flex flex-wrap items-start justify-between gap-3">
            <WorkspaceCard className="w-full max-w-xs bg-white/95 p-3 sm:p-4">
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  aria-label="Search active shipments"
                  placeholder="Search shipment or customer"
                  className="pl-9"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <div className="mt-3 space-y-2">
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {filters.map((filter) => (
                    <Button
                      key={filter.id}
                      type="button"
                      size="sm"
                      variant={
                        activeFilter === filter.id ? "default" : "outline"
                      }
                      aria-label={filter.label}
                      aria-pressed={activeFilter === filter.id}
                      onClick={() =>
                        setActiveFilter((current) =>
                          current === filter.id ? undefined : filter.id,
                        )
                      }
                      className="shrink-0"
                    >
                      {filter.label.split(":")[0]}
                    </Button>
                  ))}
                </div>
                <p className="text-sm font-semibold">Active shipments</p>
                {filteredShipments.map((shipment) => (
                  <button
                    type="button"
                    key={shipment.id}
                    aria-label={`Select shipment ${shipment.id}`}
                    onClick={() =>
                      selectShipment(shipment.id, shipment.markerId)
                    }
                    className={`w-full rounded-lg p-3 text-left ${selectedShipmentId === shipment.id ? "bg-blue-50 ring-1 ring-primary" : "bg-secondary hover:bg-slate-100"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">
                        {shipment.id}
                      </span>
                      <RiskBadge level={shipment.risk} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {shipment.status} · {shipment.detail}
                    </p>
                  </button>
                ))}
                {filteredShipments.length === 0 && (
                  <p className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
                    No fixture shipments match this search.
                  </p>
                )}
              </div>
            </WorkspaceCard>
            <RealtimeStatus
              state={realtimeState}
              lastUpdate={realtimeState === "stale" ? "18 mins ago" : undefined}
              simulated
            />
          </div>
        </LogisticsGeoMap>
        {visibleSelectedShipment && (
          <ShipmentDrawer
            shipment={visibleSelectedShipment}
            onClose={() => selectShipment("", "")}
            className="mt-4 rounded-xl border border-border bg-white p-4 shadow-sm md:absolute md:right-4 md:top-24 md:z-30 md:mt-0 md:w-72 md:bg-white/95 md:shadow-xl md:backdrop-blur-sm"
          />
        )}
      </div>
      <div className="mt-4 space-y-4">
        <RealtimeBanner
          state={realtimeState}
          shipmentId={visibleSelectedShipment?.shipmentId}
          onReconnect={reconnect}
        />
      </div>
    </>
  );
}
