"use client";

import { ListFilter } from "lucide-react";
import { LogisticsGeoMap } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LiveMapSearch } from "./components/live-map-search";
import { ShipmentQueuePanel } from "./components/shipment-queue-panel";
import { LIVE_MAP_FILTER_OPTIONS } from "./constants";
import { useLiveMapPage } from "./hooks/use-live-map-page";

export function LiveMapPage() {
  const {
    search,
    setSearch,
    selectedFilters,
    shipmentPanelOpen,
    setShipmentPanelOpen,
    selectedShipmentId,
    selectedMarkerId,
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
  } = useLiveMapPage();

  return (
    <>
      <div className="relative -mx-4 -my-4 h-[100dvh] min-h-[36rem] sm:-mx-6 sm:-my-6 lg:-mx-8 lg:-my-8">
        <LogisticsGeoMap
          className="!h-full min-h-[36rem] rounded-none border-0"
          routes={visibleRoutes}
          markers={visibleMarkers}
          selectedMarkerId={selectedMarkerId}
          onMarkerSelect={selectMarker}
          loading={mapAvailability === "loading"}
          unavailable={mapAvailability === "unavailable"}
          onRetry={retryMap}
        >
          <LiveMapSearch value={search} onChange={setSearch} />
          <div className="pointer-events-none absolute inset-x-4 bottom-4 top-30 z-30 flex min-h-0 items-start justify-between gap-3">
            <div className="pointer-events-auto sm:hidden">
              <Dialog
                open={shipmentPanelOpen}
                onOpenChange={setShipmentPanelOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    aria-label="Open shipment queue"
                    className="bg-white/95 shadow-lg"
                  >
                    <ListFilter aria-hidden="true" />
                    Shipments ({filteredShipments.length})
                  </Button>
                </DialogTrigger>
                <DialogContent
                  aria-label="Shipment queue"
                  className="max-h-[calc(100dvh-2rem)] max-w-[min(22rem,calc(100vw-1rem))] gap-0 overflow-hidden p-0 sm:hidden"
                >
                  <DialogHeader className="border-b px-4 py-3 pr-12">
                    <DialogTitle>Shipment queue</DialogTitle>
                    <DialogDescription>
                      Select a shipment to view its map details.
                    </DialogDescription>
                  </DialogHeader>
                  <ShipmentQueuePanel
                    shipments={filteredShipments}
                    selectedShipmentId={selectedShipmentId}
                    onSelect={selectShipmentFromMobileQueue}
                    options={LIVE_MAP_FILTER_OPTIONS}
                    selectedFilters={selectedFilters}
                    onToggle={toggleFilter}
                    onClear={clearFilter}
                    mobileInlineFilters
                    className="max-h-[calc(100dvh-8rem)] rounded-none border-0 p-3 shadow-none"
                  />
                </DialogContent>
              </Dialog>
            </div>
            <ShipmentQueuePanel
              shipments={filteredShipments}
              selectedShipmentId={selectedShipmentId}
              onSelect={selectShipmentFromQueue}
              options={LIVE_MAP_FILTER_OPTIONS}
              selectedFilters={selectedFilters}
              onToggle={toggleFilter}
              onClear={clearFilter}
              className="pointer-events-auto hidden max-h-[min(32rem,100%)] max-w-[20rem] sm:flex"
            />
          </div>
        </LogisticsGeoMap>
      </div>
    </>
  );
}
