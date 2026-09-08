"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";
import {
  LogisticsGeoMap,
  MetricCard,
  WorkspaceCard,
} from "@/components/common";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { trackingService, type CurrentLocationDto, type GpsPositionDto } from "@/api/services/tracking.service";
import { shipmentTrackingFixtures, trackingDeviationRoute } from "./mock";
import { useShipmentTrackingStore } from "./stores/use-shipment-tracking-store";
import { RealtimeBanner } from "../components/realtime-banner";
import { RealtimeFixtureControls } from "../components/realtime-fixture-controls";

export function ShipmentTrackingPage({
  shipmentId = "SHP-2026-00128",
}: {
  shipmentId?: string;
}) {
  const selectedMarkerId = useShipmentTrackingStore(
    (state) => state.selectedMarkerId,
  );
  const realtimeState = useShipmentTrackingStore(
    (state) => state.realtimeState,
  );
  const mapAvailability = useShipmentTrackingStore(
    (state) => state.mapAvailability,
  );
  const trackingException = useShipmentTrackingStore(
    (state) => state.trackingException,
  );
  const selectMarker = useShipmentTrackingStore((state) => state.selectMarker);
  const setRealtimeState = useShipmentTrackingStore(
    (state) => state.setRealtimeState,
  );
  const setMapAvailability = useShipmentTrackingStore(
    (state) => state.setMapAvailability,
  );
  const setTrackingException = useShipmentTrackingStore(
    (state) => state.setTrackingException,
  );

  const [liveLocation, setLiveLocation] = useState<CurrentLocationDto | null>(null);
  const [positionHistory, setPositionHistory] = useState<GpsPositionDto[]>([]);

  // 1. Poll Current Location every 2.5 seconds
  useEffect(() => {
    let isMounted = true;
    const fetchCurrentLocation = async () => {
      const loc = await trackingService.getCurrentLocation(shipmentId);
      if (isMounted && loc) {
        setLiveLocation(loc);
      }
    };

    fetchCurrentLocation();
    const interval = setInterval(fetchCurrentLocation, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [shipmentId]);

  // 2. Poll Position History every 5 seconds
  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      try {
        const history = await trackingService.listPositionHistory(shipmentId, { pageSize: 50 });
        if (isMounted && history?.positions) {
          setPositionHistory(history.positions);
        }
      } catch {
        // Keep existing
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [shipmentId]);

  const fixture = shipmentTrackingFixtures[shipmentId];
  const routes =
    fixture && trackingException === "deviation"
      ? [...fixture.map.routes, trackingDeviationRoute]
      : (fixture?.map.routes ?? []);
  const isCurrentSnapshot = realtimeState === "live";
  const hasLastKnownPosition = ["live", "stale", "reconnecting"].includes(
    realtimeState,
  );
  const hasRetainedProgress = ["live", "stale", "reconnecting"].includes(
    realtimeState,
  );
  const telemetry = fixture?.telemetry;

  const baseMarkers = fixture?.map.markers ?? [];
  const mapMarkers = liveLocation
    ? [
        {
          id: "tracking-current",
          latitude: liveLocation.latitude,
          longitude: liveLocation.longitude,
          label: "Active Vehicle GPS",
          detail: `${Math.round(liveLocation.speedKph ?? 50)} km/h · Heading ${Math.round(liveLocation.headingDegrees ?? 0)}°`,
          tone: "primary" as const,
        },
        ...baseMarkers.filter((m) => m.id !== "tracking-current"),
      ]
    : baseMarkers.map((marker) =>
        marker.id === "tracking-current" && !isCurrentSnapshot
          ? {
              ...marker,
              label: "Last-known GPS position",
              detail:
                realtimeState === "stale"
                  ? "Last update 18 mins ago · movement unavailable"
                  : "Movement unavailable",
              tone: "alert" as const,
            }
          : marker,
      );

  function reconnect() {
    setRealtimeState("reconnecting");
    window.setTimeout(() => setRealtimeState("live"), 800);
  }

  return (
    <>
      <PageHeader
        title="Live Tracking"
        description={
          fixture
            ? `${shipmentId} · HCM → Singapore`
            : `${shipmentId} · tracking fixture unavailable`
        }
        actions={
          fixture ? (
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTrackingException("deviation")}
                disabled={trackingException === "deviation"}
              >
                <AlertTriangle className="size-4" />
                Simulate route deviation
              </Button>
              <RealtimeFixtureControls
                realtimeState={realtimeState}
                mapAvailability={mapAvailability}
                onRealtimeStateChange={setRealtimeState}
                onMapAvailabilityChange={setMapAvailability}
              />
            </div>
          ) : undefined
        }
      />
      {!fixture ? (
        <WorkspaceCard title="No tracking fixture">
          <p className="text-sm text-muted-foreground">
            No tracking fixture exists for {shipmentId}. Telemetry from another
            shipment is never substituted.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/shipments">Back to shipments</Link>
          </Button>
        </WorkspaceCard>
      ) : (
        <>
          {trackingException === "deviation" && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <div>
                <p className="font-semibold">
                  Route deviation · vehicle is 2.4 km outside planned route
                </p>
                <p className="mt-1 text-xs">
                  {shipmentId} context is preserved. Human approval is required
                  before changing the route or ETA.
                </p>
              </div>
              <Button asChild size="sm">
                <Link href="/route-planning">Review alternatives</Link>
              </Button>
            </div>
          )}
          <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
            <WorkspaceCard>
              <LogisticsGeoMap
                className="h-[32rem]"
                routes={routes}
                markers={mapMarkers}
                selectedMarkerId={selectedMarkerId}
                onMarkerSelect={selectMarker}
                loading={mapAvailability === "loading"}
                unavailable={mapAvailability === "unavailable"}
                onRetry={() => setMapAvailability("available")}
              />
            </WorkspaceCard>
            <WorkspaceCard
              title={
                isCurrentSnapshot ? "Current position" : "Last-known position"
              }
            >
              <p className="text-xl font-semibold tabular-nums">
                {liveLocation
                  ? `${liveLocation.latitude.toFixed(4)}, ${liveLocation.longitude.toFixed(4)}`
                  : hasLastKnownPosition && telemetry
                    ? telemetry.coordinates
                    : "Unavailable"}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <MetricCard
                  label="Speed"
                  value={
                    liveLocation?.speedKph !== undefined
                      ? `${Math.round(liveLocation.speedKph)} km/h`
                      : isCurrentSnapshot && telemetry
                        ? telemetry.speed
                        : "Unavailable"
                  }
                />
                <MetricCard
                  label="Heading"
                  value={
                    liveLocation?.headingDegrees !== undefined
                      ? `${Math.round(liveLocation.headingDegrees)}°`
                      : isCurrentSnapshot && telemetry
                        ? telemetry.heading
                        : "Unavailable"
                  }
                />
                <MetricCard
                  label="Last GPS"
                  value={
                    liveLocation?.recordedAt
                      ? new Date(liveLocation.recordedAt).toLocaleTimeString()
                      : realtimeState === "stale"
                        ? "Last update 18 mins ago"
                        : realtimeState === "live"
                          ? telemetry?.lastGps
                          : "Signal unavailable"
                  }
                  meta={liveLocation ? "Aurora GPS Streamer" : telemetry?.source}
                />
                <MetricCard
                  label="ETA"
                  value={
                    isCurrentSnapshot && telemetry
                      ? telemetry.eta
                      : realtimeState === "stale" && telemetry
                        ? `Last calculated ${telemetry.eta}`
                        : "Unavailable"
                  }
                />
              </div>
              <div className="mt-5">
                {hasRetainedProgress ? (
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {isCurrentSnapshot
                        ? "Route progress"
                        : "Last-known route progress"}
                    </span>
                    <span className="font-semibold">
                      {telemetry?.progress}%
                    </span>
                  </div>
                ) : (
                  <p className="mb-2 text-xs text-muted-foreground">
                    Route progress unavailable
                  </p>
                )}
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: hasRetainedProgress
                        ? `${telemetry?.progress}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>
              <Button asChild className="mt-6">
                <Link href={`/shipments/${shipmentId}`}>
                  Open shipment
                  <ExternalLink className="size-4" />
                </Link>
              </Button>
            </WorkspaceCard>
          </div>
          <div className="mt-4">
            <RealtimeBanner
              state={realtimeState}
              shipmentId={shipmentId}
              onReconnect={reconnect}
            />
          </div>
        </>
      )}
    </>
  );
}
