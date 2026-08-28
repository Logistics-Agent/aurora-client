import type { ReactNode } from "react";
import { LiveMapPage as LiveMapComposition } from "./live-map";
import { RoutePlanningPage as RoutePlanningComposition } from "./route-planning";
import { ShipmentTrackingPage } from "./shipment-tracking";

function RouteTrackingScreen({
  screen,
  children,
}: {
  screen: "route-planning" | "live-map" | "shipment-tracking";
  children: ReactNode;
}) {
  return (
    <section data-feature="route-tracking" data-screen={screen}>
      <p className="sr-only">
        Route and tracking UI-only fixture. No live GPS transport is connected.
      </p>
      {children}
    </section>
  );
}

export function RoutePlanningPage() {
  return (
    <RouteTrackingScreen screen="route-planning">
      <RoutePlanningComposition />
    </RouteTrackingScreen>
  );
}

export function LiveMapPage() {
  return (
    <RouteTrackingScreen screen="live-map">
      <LiveMapComposition />
    </RouteTrackingScreen>
  );
}

export function TrackingPage({ shipmentId }: { shipmentId: string }) {
  return (
    <RouteTrackingScreen screen="shipment-tracking">
      <ShipmentTrackingPage shipmentId={shipmentId} />
    </RouteTrackingScreen>
  );
}
