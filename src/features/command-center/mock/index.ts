import type {
  LogisticsGeoMarker,
  LogisticsGeoRoute,
} from "@/components/common";

export type CommandKpi = {
  label: string;
  value: string;
  meta: string;
  intent: "info" | "critical" | "success" | "ai";
};

export type CommandExceptionMock = {
  id: string;
  customer: string;
  flag: string;
  risk: "medium" | "high" | "critical";
  markerId: string;
};

// UI-only fixture until backend integration phase.
export const commandKpis: CommandKpi[] = [
  {
    label: "Active shipments",
    value: "125",
    meta: "+12 today",
    intent: "info",
  },
  { label: "Exceptions", value: "18", meta: "4 critical", intent: "critical" },
  {
    label: "On-time rate",
    value: "94.2%",
    meta: "+1.8% this week",
    intent: "success",
  },
  { label: "AI processing", value: "3", meta: "2 need review", intent: "ai" },
];

// UI-only fixture until backend integration phase.
export const commandExceptions: CommandExceptionMock[] = [
  {
    id: "SHP-2026-00128",
    customer: "Acme Electronics",
    flag: "Port congestion",
    risk: "medium",
    markerId: "command-shp-128",
  },
  {
    id: "SHP-2026-00127",
    customer: "Northstar Retail",
    flag: "Route deviation",
    risk: "high",
    markerId: "command-shp-127",
  },
  {
    id: "SHP-2026-00125",
    customer: "Vertex Medical",
    flag: "OCR review blocks release",
    risk: "critical",
    markerId: "command-shp-125",
  },
];

// UI-only fixture until backend integration phase.
export const commandMapMock: {
  routes: LogisticsGeoRoute[];
  markers: LogisticsGeoMarker[];
} = {
  routes: [
    {
      id: "network-main",
      label: "HCM to Singapore network lane",
      kind: "current",
      coordinates: [
        { longitude: 106.7, latitude: 10.77 },
        { longitude: 105.2, latitude: 7.0 },
        { longitude: 103.82, latitude: 1.29 },
      ],
    },
    {
      id: "network-risk",
      label: "At-risk northern lane",
      kind: "risk",
      coordinates: [
        { longitude: 105.85, latitude: 21.03 },
        { longitude: 106.7, latitude: 10.77 },
      ],
    },
  ],
  markers: [
    {
      id: "command-shp-128",
      label: "SHP-2026-00128",
      detail: "Port congestion · medium risk",
      shipmentId: "SHP-2026-00128",
      tone: "current",
      position: { longitude: 105.2, latitude: 7.0 },
    },
    {
      id: "command-shp-127",
      label: "SHP-2026-00127",
      detail: "Route deviation · high risk",
      shipmentId: "SHP-2026-00127",
      tone: "alert",
      position: { longitude: 106.7, latitude: 10.77 },
    },
    {
      id: "command-shp-125",
      label: "SHP-2026-00125",
      detail: "Document release blocked",
      shipmentId: "SHP-2026-00125",
      tone: "alert",
      position: { longitude: 103.82, latitude: 1.29 },
    },
  ],
};

// UI-only fixture until backend integration phase.
export const commandPulse = [
  ["Departures", "42"],
  ["Arrivals", "38"],
  ["At risk", "7"],
  ["Offline", "2"],
] as const;
