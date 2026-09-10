import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRoutePlanningStore } from "./stores/use-route-planning-store";
import { RoutePlanningPage } from "./index";
import type { ShipmentPlanningItem } from "./types";
import { routePlanningApiService } from "@/api/services/route-planning.service";

const testShipmentA: ShipmentPlanningItem = {
  id: "SHP-2026-00128",
  shipmentNo: "SHP-2026-00128",
  orderId: "ORD-98214-VN",
  customerName: "Acme Electronics",
  priority: "High",
  status: "Planning",
  transportMode: "Multimodal",
  cargo: {
    commodity: "Semiconductor Chips & Microprocessors",
    weightKg: 18420,
    volumeM3: 45.2,
    packageType: "2 × 40’ High Cube Reefer",
    temperatureControlled: true,
    temperatureRange: "18°C – 22°C (Strict)",
  },
  origin: {
    name: "VSIP Logistics Park (HCM)",
    address: "No. 8 Huu Nghi Ave, VSIP I, Thuan An, Binh Duong",
    latitude: 10.8231,
    longitude: 106.6297,
  },
  destination: {
    name: "Jurong Port Logistics Hub (Singapore)",
    address: "37 Jurong Port Rd, Singapore 619110",
    latitude: 1.2903,
    longitude: 103.8198,
  },
  waypoints: [
    {
      id: "wp-1",
      sequence: 1,
      stopType: "Pickup",
      locationName: "VSIP Logistics Park",
      address: "Thuan An, Binh Duong",
      latitude: 10.8231,
      longitude: 106.6297,
      serviceDurationMinutes: 45,
    },
    {
      id: "wp-2",
      sequence: 2,
      stopType: "Delivery",
      locationName: "Jurong Port Singapore",
      address: "Jurong Port Rd, Singapore",
      latitude: 1.2903,
      longitude: 103.8198,
      serviceDurationMinutes: 60,
    },
  ],
  routes: [
    {
      id: "route-a",
      name: "Route A · Intermodal Express",
      tag: "AI Recommended",
      distance: "82 km (Land) + 1,420 km (Sea)",
      distanceKm: 1502,
      duration: "1h 42m (Road) · 36h (Total)",
      durationMinutes: 2160,
      cost: "$118 / CBM",
      costValue: 118,
      risk: "Low",
      governanceDecision: "NoApprovalRequired",
      recommended: true,
      co2EmissionsKg: 340,
      stops: [
        {
          id: "s-1",
          sequence: 1,
          stopType: "Pickup",
          locationName: "VSIP Warehouse",
          address: "Thuan An, Binh Duong",
          latitude: 10.8231,
          longitude: 106.6297,
        },
        {
          id: "s-2",
          sequence: 2,
          stopType: "Delivery",
          locationName: "Singapore Hub",
          address: "Jurong Port Rd",
          latitude: 1.2903,
          longitude: 103.8198,
        },
      ],
      coordinates: [
        { longitude: 106.6297, latitude: 10.8231 },
        { longitude: 103.8198, latitude: 1.2903 },
      ],
    },
    {
      id: "route-b",
      name: "Route B · Direct Coastal Highway",
      tag: "Fastest ETA",
      distance: "71 km (Land) + 1,390 km (Sea)",
      distanceKm: 1461,
      duration: "1h 25m (Road) · 32h (Total)",
      durationMinutes: 1920,
      cost: "$165 / CBM",
      costValue: 165,
      risk: "Medium",
      governanceDecision: "StaffAllowed",
      recommended: false,
      co2EmissionsKg: 420,
      stops: [
        {
          id: "s-1",
          sequence: 1,
          stopType: "Pickup",
          locationName: "VSIP Warehouse",
          address: "Thuan An, Binh Duong",
          latitude: 10.8231,
          longitude: 106.6297,
        },
        {
          id: "s-2",
          sequence: 2,
          stopType: "Delivery",
          locationName: "Singapore Hub",
          address: "Jurong Port Rd",
          latitude: 1.2903,
          longitude: 103.8198,
        },
      ],
      coordinates: [
        { longitude: 106.6297, latitude: 10.8231 },
        { longitude: 103.8198, latitude: 1.2903 },
      ],
    },
  ],
  mapRoutes: [
    {
      id: "route-a",
      label: "Route A · Intermodal Express",
      shipmentId: "SHP-2026-00128",
      kind: "current",
      coordinates: [
        { longitude: 106.6297, latitude: 10.8231 },
        { longitude: 103.8198, latitude: 1.2903 },
      ],
    },
  ],
  markers: [
    {
      id: "vsip-origin",
      label: "VSIP Logistics Park (HCM)",
      detail: "Origin · Pickup Complete",
      position: { longitude: 106.6297, latitude: 10.8231 },
      tone: "origin",
    },
  ],
  aiRecommendation: {
    recommendedRouteId: "route-a",
    confidence: 94,
    summary: "Route A avoids maritime congestion by utilizing direct vessel schedule.",
    reason: "Historical transit delay on Route B is higher due to coastal inspection checkpoints.",
    sources: ["Port EDI Data", "Vessel Tracking AIS"],
    suggestedAction: "Approve route and generate customs declaration",
  },
};

const testShipmentB: ShipmentPlanningItem = {
  ...testShipmentA,
  id: "SHP-2026-00127",
  shipmentNo: "SHP-2026-00127",
  customerName: "Northstar Retail",
};

describe("RoutePlanningPage", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.spyOn(routePlanningApiService, "listShipments").mockResolvedValue({
      shipments: [],
      page: 1,
      limit: 50,
      totalCount: 0,
    });
    vi.spyOn(routePlanningApiService, "listRoutes").mockResolvedValue({
      items: [],
      page: 1,
      limit: 50,
      totalItems: 0,
      totalPages: 1,
    });

    useRoutePlanningStore.setState({
      shipments: [testShipmentA, testShipmentB],
      selectedShipmentId: "SHP-2026-00128",
      selectedRouteId: "route-a",
      mapAvailability: "available",
      calculationState: "ready",
      acceptedRouteId: undefined,
      activeTab: "routes",
      isLoadingApi: false,
    });
  });

  it("selects and accepts an alternative route", () => {
    render(<RoutePlanningPage />);

    const routeB = screen.getByRole("button", { name: /choose route b/i });
    fireEvent.click(routeB);
    expect(routeB).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: /accept & assign route b/i }));
    expect(
      screen.getByText(/Route Approved & Dispatched/i),
    ).toBeInTheDocument();
  });

  it("switches tabs between Proposed Routes, Cargo Specs, Waypoints, and Route Builder", () => {
    render(<RoutePlanningPage />);

    fireEvent.click(screen.getByRole("button", { name: /^cargo specs$/i }));
    expect(screen.getByText(/gross cargo weight/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^waypoints$/i }));
    expect(screen.getByText(/optimization strategy/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^route builder$/i }));
    expect(screen.getByText(/run vroom solver/i)).toBeInTheDocument();
  });

  it("compares all route alternatives before human acceptance", () => {
    render(<RoutePlanningPage />);

    fireEvent.click(screen.getByRole("button", { name: /^compare routes$/i }));
    const dialog = screen.getByRole("dialog", { name: /route comparison/i });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/Corridor Name/i)).toBeInTheDocument();
  });

  it("switches shipment context and updates cargo specs", () => {
    render(<RoutePlanningPage />);

    const select = screen.getByRole("combobox", {
      name: /select shipment for route planning/i,
    });
    fireEvent.change(select, { target: { value: "SHP-2026-00127" } });

    expect(screen.getByText("Northstar Retail")).toBeInTheDocument();
  });
});
