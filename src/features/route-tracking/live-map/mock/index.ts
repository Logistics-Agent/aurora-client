import type { RouteMapFixture } from "../../types";
import type { TrackedShipment } from "../types";

// UI-only fixture until backend integration phase.
export const liveShipments: TrackedShipment[] = [
  {
    id: "SHP-128",
    shipmentId: "SHP-2026-00128",
    status: "In transit",
    detail: "Acme · 54 km/h · ETA 14:35",
    markerId: "shp-128",
    risk: "low",
    mode: "Road",
    customer: "Acme",
    region: "SEA",
  },
  {
    id: "SHP-129",
    shipmentId: "SHP-2026-00129",
    status: "Delayed",
    detail: "Northstar · ETA 16:20",
    markerId: "shp-129",
    risk: "high",
    mode: "Road",
    customer: "Northstar",
    region: "SEA",
  },
  {
    id: "SHP-130",
    shipmentId: "SHP-2026-00130",
    status: "At hub",
    detail: "Mekong · ETA 18:00",
    markerId: "shp-130",
    risk: "low",
    mode: "Ocean",
    customer: "Mekong",
    region: "Domestic",
  },
  {
    id: "SHP-131",
    shipmentId: "SHP-2026-00131",
    status: "GPS stale",
    detail: "Vertex · Last update 18 mins ago",
    markerId: "shp-131",
    risk: "medium",
    mode: "Road",
    customer: "Vertex",
    region: "SEA",
  },
];

// UI-only fixture until backend integration phase.
export const liveMapMock: RouteMapFixture = {
  routes: [
    {
      id: "shp-128-route",
      label: "SHP-128 active route",
      coordinates: [
        { longitude: 106.6297, latitude: 10.8231 },
        { longitude: 106.6602, latitude: 10.801 },
        { longitude: 106.7009, latitude: 10.7769 },
        { longitude: 106.754, latitude: 10.742 },
      ],
      kind: "current",
    },
    {
      id: "shp-129-route",
      label: "SHP-129 delayed route",
      coordinates: [
        { longitude: 106.592, latitude: 10.856 },
        { longitude: 106.648, latitude: 10.842 },
        { longitude: 106.706, latitude: 10.815 },
      ],
      kind: "risk",
      layer: "traffic",
    },
  ],
  markers: [
    {
      id: "shp-128",
      label: "SHP-128 · In transit",
      detail: "Acme · 54 km/h · simulated snapshot 18 sec ago",
      shipmentId: "SHP-2026-00128",
      position: { longitude: 106.7009, latitude: 10.7769 },
      heading: 92,
      tone: "current",
    },
    {
      id: "shp-129",
      label: "SHP-129 · Delayed",
      detail: "Exception: traffic restriction",
      shipmentId: "SHP-2026-00129",
      position: { longitude: 106.706, latitude: 10.815 },
      tone: "alert",
    },
    {
      id: "shp-130",
      label: "SHP-130 · At hub",
      detail: "Hub dwell 22 minutes",
      shipmentId: "SHP-2026-00130",
      position: { longitude: 106.6297, latitude: 10.8231 },
      tone: "origin",
    },
    {
      id: "shp-131",
      label: "SHP-131 · GPS stale",
      detail: "Last update 18 mins ago",
      shipmentId: "SHP-2026-00131",
      position: { longitude: 106.754, latitude: 10.742 },
      tone: "alert",
    },
  ],
};
