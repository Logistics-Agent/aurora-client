import type { LogisticsGeoMarker } from "@/components/common";
import type { RouteMapFixture } from "../../types";
import type { TrackedShipment } from "../types";
import fixture from "./live-map-fixture.json";

type LiveMapFixtureData = {
  shipments: TrackedShipment[];
  routes: RouteMapFixture["routes"];
};

const liveMapFixture = fixture as unknown as LiveMapFixtureData;

const markerToneByStatus: Record<
  TrackedShipment["status"],
  LogisticsGeoMarker["tone"]
> = {
  "At hub": "origin",
  Delayed: "alert",
  "GPS stale": "alert",
  "In transit": "current",
};

function toMapMarker(shipment: TrackedShipment): LogisticsGeoMarker {
  return {
    id: shipment.markerId,
    label: `${shipment.id} · ${shipment.status}`,
    detail: shipment.detail,
    shipmentId: shipment.shipmentId,
    position: shipment.position,
    heading: shipment.heading,
    tone: markerToneByStatus[shipment.status],
    metadata: {
      customer: shipment.customer,
      eta: shipment.eta,
      heading: shipment.heading,
      mode: shipment.mode,
      region: shipment.region,
      risk: shipment.risk,
      signal: shipment.lastUpdated
        ? `Simulated · ${shipment.lastUpdated}`
        : "Simulated · current",
      speed: shipment.speed,
      status: shipment.status,
    },
  };
}

function toRouteOriginMarker(
  route: RouteMapFixture["routes"][number],
  shipment?: TrackedShipment,
): LogisticsGeoMarker {
  const [origin] = route.coordinates;
  const [originLabel] = route.label.split(" → ");

  return {
    id: `${route.id}-origin`,
    label: originLabel ?? route.label,
    detail: `Route origin · ${route.label}`,
    shipmentId: route.shipmentId,
    position: origin,
    tone: "origin",
    metadata: shipment
      ? {
          customer: shipment.customer,
          eta: shipment.eta,
          risk: shipment.risk,
          signal: shipment.lastUpdated
            ? `Simulated · ${shipment.lastUpdated}`
            : "Simulated · current",
          speed: shipment.speed,
          status: shipment.status,
        }
      : undefined,
  };
}

// UI-only fixture until backend integration phase.
export const liveShipments = liveMapFixture.shipments;

// UI-only fixture until backend integration phase.
export const liveMapMock: RouteMapFixture = {
  routes: liveMapFixture.routes,
  markers: [
    ...liveShipments.map(toMapMarker),
    ...liveMapFixture.routes.map((route) =>
      toRouteOriginMarker(
        route,
        liveShipments.find((shipment) => shipment.shipmentId === route.shipmentId),
      ),
    ),
  ],
};
