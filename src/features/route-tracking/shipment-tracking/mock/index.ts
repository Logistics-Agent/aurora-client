import type { LogisticsGeoRoute } from "@/components/common";
import type { ShipmentTrackingFixture } from "../types";

// UI-only fixture until backend integration phase.
export const shipmentTrackingFixtures: Record<string, ShipmentTrackingFixture> =
  {
    "SHP-2026-00128": {
      map: {
        routes: [
          {
            id: "completed-leg",
            label: "Completed route",
            coordinates: [
              { longitude: 106.72, latitude: 10.96 },
              { longitude: 106.67, latitude: 10.84 },
              { longitude: 106.7009, latitude: 10.7769 },
            ],
            kind: "completed",
          },
          {
            id: "current-leg",
            label: "Current route",
            coordinates: [
              { longitude: 106.7009, latitude: 10.7769 },
              { longitude: 106.76, latitude: 10.71 },
              { longitude: 107.0843, latitude: 10.346 },
            ],
            kind: "current",
          },
          {
            id: "planned-leg",
            label: "Planned route",
            coordinates: [
              { longitude: 107.0843, latitude: 10.346 },
              { longitude: 105.4, latitude: 6.1 },
              { longitude: 103.8198, latitude: 1.2903 },
            ],
            kind: "planned",
          },
        ],
        markers: [
          {
            id: "tracking-origin",
            label: "HCM Warehouse",
            detail: "Departed 11:08 ICT",
            position: { longitude: 106.72, latitude: 10.96 },
            tone: "origin",
          },
          {
            id: "tracking-current",
            label: "Current GPS position",
            detail: "10.7769, 106.7009 · simulated movement snapshot",
            shipmentId: "SHP-2026-00128",
            position: { longitude: 106.7009, latitude: 10.7769 },
            heading: 90,
            tone: "current",
          },
          {
            id: "tracking-destination",
            label: "Singapore",
            detail: "Planned arrival 14:35",
            position: { longitude: 103.8198, latitude: 1.2903 },
            tone: "destination",
          },
        ],
      },
      telemetry: {
        shipmentId: "SHP-2026-00128",
        coordinates: "10.7769, 106.7009",
        speed: "54 km/h",
        heading: "East",
        lastGps: "18 sec ago",
        eta: "14:35",
        progress: 62,
        source: "Vehicle GPS unit · simulated snapshot",
      },
    },
  };

// UI-only fixture until backend integration phase.
export const trackingDeviationRoute: LogisticsGeoRoute = {
  id: "deviation-leg",
  label: "Route deviation · 2.4 km outside planned route",
  coordinates: [
    { longitude: 106.7009, latitude: 10.7769 },
    { longitude: 106.75, latitude: 10.79 },
    { longitude: 106.82, latitude: 10.7 },
  ],
  kind: "risk",
  layer: "traffic",
};

// Mirrors the CLI simulator corridor so a UUID-based live demo has map context.
export const gpsSimulatorRoute: LogisticsGeoRoute = {
  id: "gps-simulator-route",
  label: "San Jose CR to Panama City PA",
  coordinates: [
    { latitude: 9.9333, longitude: -84.0833 },
    { latitude: 9.8653, longitude: -83.9189 },
    { latitude: 9.3789, longitude: -83.7042 },
    { latitude: 8.9667, longitude: -83.5167 },
    { latitude: 8.5333, longitude: -82.8333 },
    { latitude: 8.4333, longitude: -82.4333 },
    { latitude: 8.2333, longitude: -81.75 },
    { latitude: 8.1, longitude: -80.9667 },
    { latitude: 8.4, longitude: -80.4167 },
    { latitude: 8.9824, longitude: -79.5199 },
  ],
  kind: "planned",
};
