import type { RouteMapFixture } from "../../types";
import type { RouteAlternative } from "../types";

// UI-only fixture until backend integration phase.
export const routeAlternatives: RouteAlternative[] = [
  {
    id: "route-a",
    name: "Route A",
    distance: "82 km",
    duration: "1h 42m",
    cost: "$118",
    risk: "Low",
    recommended: true,
    coordinates: [
      { longitude: 106.6297, latitude: 10.8231 },
      { longitude: 106.7009, latitude: 10.7769 },
      { longitude: 106.822, latitude: 10.706 },
      { longitude: 107.0843, latitude: 10.346 },
      { longitude: 104.82, latitude: 5.6 },
      { longitude: 103.8198, latitude: 1.2903 },
    ],
  },
  {
    id: "route-b",
    name: "Route B",
    distance: "71 km",
    duration: "2h 05m",
    cost: "$102",
    risk: "Medium",
    recommended: false,
    coordinates: [
      { longitude: 106.6297, latitude: 10.8231 },
      { longitude: 106.78, latitude: 10.86 },
      { longitude: 107.12, latitude: 10.52 },
      { longitude: 105.4, latitude: 6.4 },
      { longitude: 103.8198, latitude: 1.2903 },
    ],
  },
  {
    id: "route-c",
    name: "Route C",
    distance: "90 km",
    duration: "1h 38m",
    cost: "$142",
    risk: "Low",
    recommended: false,
    coordinates: [
      { longitude: 106.6297, latitude: 10.8231 },
      { longitude: 106.71, latitude: 10.69 },
      { longitude: 106.96, latitude: 10.42 },
      { longitude: 104.25, latitude: 5.1 },
      { longitude: 103.8198, latitude: 1.2903 },
    ],
  },
];

// UI-only fixture until backend integration phase.
export const routePlanningMapMock: RouteMapFixture = {
  routes: routeAlternatives.map((route, index) => ({
    id: route.id,
    label: `${route.name} · ${route.duration}`,
    coordinates: route.coordinates,
    kind: index === 0 ? "current" : index === 1 ? "risk" : "alternative",
    layer: index === 1 ? "traffic" : index === 2 ? "restrictions" : undefined,
  })),
  markers: [
    {
      id: "hcm-warehouse",
      label: "HCM Warehouse",
      detail: "Origin · ready for departure",
      position: { longitude: 106.6297, latitude: 10.8231 },
      tone: "origin",
    },
    {
      id: "route-checkpoint",
      label: "Border checkpoint",
      detail: "Restriction review point",
      position: { longitude: 107.0843, latitude: 10.346 },
      tone: "alert",
    },
    {
      id: "singapore",
      label: "Singapore",
      detail: "Destination · ETA 14:35",
      position: { longitude: 103.8198, latitude: 1.2903 },
      tone: "destination",
    },
  ],
};

// UI-only fixture until backend integration phase.
export const routeAcceptanceFixture = {
  reviewer: "Linh Nguyen",
  timestamp: "10:48 ICT",
} as const;
