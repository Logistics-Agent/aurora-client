import type {
  LogisticsGeoMarker,
  LogisticsGeoRoute,
} from "@/components/common";

export type ShipmentUiFixture = {
  id: string;
  customer: string;
  lane: string;
  status: string;
  risk: "low" | "medium" | "high" | "critical";
  eta: string;
  flag: string;
};

// UI-only fixture until backend integration phase.
export const shipmentUiFixtures: ShipmentUiFixture[] = [
  {
    id: "SHP-2026-00128",
    customer: "Acme Electronics",
    lane: "HCM → Singapore",
    status: "In Transit",
    risk: "medium",
    eta: "14 Jun · 18:40",
    flag: "Port congestion",
  },
  {
    id: "SHP-2026-00127",
    customer: "Northstar Retail",
    lane: "Hanoi → Tokyo",
    status: "Delayed",
    risk: "high",
    eta: "15 Jun · 09:20",
    flag: "Route deviation",
  },
  {
    id: "SHP-2026-00126",
    customer: "Mekong Foods",
    lane: "Can Tho → Manila",
    status: "Delivered",
    risk: "low",
    eta: "Completed",
    flag: "—",
  },
  {
    id: "SHP-2026-00125",
    customer: "Vertex Medical",
    lane: "Da Nang → Busan",
    status: "Documents",
    risk: "critical",
    eta: "16 Jun · 11:00",
    flag: "OCR review",
  },
];

// UI-only fixture until backend integration phase.
export const shipmentDetailMapMock: {
  routes: LogisticsGeoRoute[];
  markers: LogisticsGeoMarker[];
} = {
  routes: [
    {
      id: "shipment-completed",
      label: "Completed leg",
      coordinates: [
        { longitude: 106.72, latitude: 10.96 },
        { longitude: 106.67, latitude: 10.84 },
        { longitude: 106.7009, latitude: 10.7769 },
      ],
      kind: "completed",
    },
    {
      id: "shipment-current",
      label: "Current leg",
      coordinates: [
        { longitude: 106.7009, latitude: 10.7769 },
        { longitude: 106.76, latitude: 10.71 },
        { longitude: 107.0843, latitude: 10.346 },
      ],
      kind: "current",
    },
    {
      id: "shipment-planned",
      label: "Planned leg",
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
      id: "shipment-origin",
      label: "VSIP Warehouse",
      detail: "Departed 11:08 ICT",
      position: { longitude: 106.72, latitude: 10.96 },
      tone: "origin",
    },
    {
      id: "shipment-current-gps",
      label: "Current GPS",
      detail: "10.7769, 106.7009 · 54 km/h east",
      shipmentId: "SHP-2026-00128",
      position: { longitude: 106.7009, latitude: 10.7769 },
      heading: 90,
      tone: "current",
    },
    {
      id: "shipment-destination",
      label: "Singapore",
      detail: "ETA 14:35",
      position: { longitude: 103.8198, latitude: 1.2903 },
      tone: "destination",
    },
  ],
};

// UI-only fixture until backend integration phase.
export const shipmentGpsMock = {
  coordinates: "10.7769, 106.7009",
  speed: "54 km/h",
  heading: "East",
  lastUpdate: "18 sec ago",
  progress: "62%",
} as const;

export function createShipmentReference(value: string): string {
  return value.trim() || "SHP-2026-DRAFT";
}
