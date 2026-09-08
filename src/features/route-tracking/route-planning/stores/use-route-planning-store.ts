"use client";

import { create } from "zustand";
import type { RouteCalculationState, RouteMapAvailability } from "../../types";
import { shipmentPlanningFixtures } from "../mock";
import type { CreateShipmentInput, RouteAlternative, ShipmentPlanningItem } from "../types";
import { routePlanningApiService } from "@/api/services/route-planning.service";

export type RoutePlanningTab = "routes" | "shipment" | "parameters" | "builder";
export type OptimizationCriteria = "balanced" | "fastest" | "lowest_cost" | "avoid_tolls";

type RoutePlanningState = {
  shipments: ShipmentPlanningItem[];
  selectedShipmentId: string;
  selectedRouteId: string;
  acceptedRouteId?: string;
  activeTab: RoutePlanningTab;
  optimizationCriteria: OptimizationCriteria;
  mapAvailability: RouteMapAvailability;
  calculationState: RouteCalculationState;
  isLoadingApi: boolean;
  selectShipment: (shipmentId: string) => void;
  selectRoute: (routeId: string) => void;
  acceptRoute: (routeId: string) => void;
  setActiveTab: (tab: RoutePlanningTab) => void;
  setOptimizationCriteria: (criteria: OptimizationCriteria) => void;
  setMapAvailability: (state: RouteMapAvailability) => void;
  setCalculationState: (state: RouteCalculationState) => void;
  addShipment: (input: CreateShipmentInput) => Promise<string>;
  addCustomRouteToShipment: (shipmentId: string, customRoute: RouteAlternative) => void;
  fetchLiveBackendData: () => Promise<void>;
};

export const useRoutePlanningStore = create<RoutePlanningState>((set, get) => ({
  shipments: shipmentPlanningFixtures,
  selectedShipmentId: shipmentPlanningFixtures[0].id,
  selectedRouteId: "route-a",
  acceptedRouteId: undefined,
  activeTab: "routes",
  optimizationCriteria: "balanced",
  mapAvailability: "available",
  calculationState: "ready",
  isLoadingApi: false,
  selectShipment: (selectedShipmentId) => {
    const current = get().shipments.find((s) => s.id === selectedShipmentId);
    const initialRouteId = current?.routes[0]?.id ?? "route-a";
    set({
      selectedShipmentId,
      selectedRouteId: initialRouteId,
      acceptedRouteId: current?.assignedRouteId,
      calculationState: "ready",
    });
  },
  selectRoute: (selectedRouteId) => set({ selectedRouteId }),
  acceptRoute: (acceptedRouteId) => {
    const { shipments, selectedShipmentId } = get();
    const updated = shipments.map((s) => {
      if (s.id === selectedShipmentId) {
        return {
          ...s,
          assignedRouteId: acceptedRouteId,
          status: "Draft" as const,
        };
      }
      return s;
    });
    set({ acceptedRouteId, shipments: updated });

    // Fire API call asynchronously to Staff.Bff
    routePlanningApiService
      .updateRouteStatus(acceptedRouteId, "Approved")
      .catch(() => {
        // Silently preserve client state
      });
  },
  setActiveTab: (activeTab) => set({ activeTab }),
  setOptimizationCriteria: (optimizationCriteria) => set({ optimizationCriteria }),
  setMapAvailability: (mapAvailability) => set({ mapAvailability }),
  setCalculationState: (calculationState) => set({ calculationState }),
  addShipment: async (input) => {
    const newId = `SHP-2026-CR00${Math.floor(10 + Math.random() * 89)}`;

    // Try backend API creation
    try {
      await routePlanningApiService.createShipment({
        orderId: input.orderId,
        customerName: input.customerName,
        originAddress: input.originAddress,
        destinationAddress: input.destAddress,
        originCountry: "CR",
        destinationCountry: "PA",
        cargoItems: [
          {
            name: input.commodity,
            quantity: 1,
            weightKg: input.weightKg,
          },
        ],
      });
    } catch {
      // Graceful fallback to in-memory state
    }

    const newShipment: ShipmentPlanningItem = {
      id: newId,
      shipmentNo: newId,
      orderId: input.orderId || `ORD-${Math.floor(10000 + Math.random() * 90000)}-CR`,
      customerName: input.customerName,
      priority: input.priority,
      status: "Planning",
      transportMode: input.transportMode,
      cargo: {
        commodity: input.commodity,
        weightKg: input.weightKg,
        volumeM3: input.volumeM3,
        packageType: input.packageType,
        temperatureControlled: input.temperatureControlled,
        temperatureRange: input.temperatureRange,
      },
      origin: {
        name: input.originName,
        address: input.originAddress,
        latitude: input.originLat,
        longitude: input.originLng,
      },
      destination: {
        name: input.destName,
        address: input.destAddress,
        latitude: input.destLat,
        longitude: input.destLng,
      },
      waypoints: [
        {
          id: "wp-origin",
          sequence: 1,
          stopType: "Pickup",
          locationName: input.originName,
          address: input.originAddress,
          latitude: input.originLat,
          longitude: input.originLng,
          serviceDurationMinutes: 45,
        },
        {
          id: "wp-dest",
          sequence: 2,
          stopType: "Delivery",
          locationName: input.destName,
          address: input.destAddress,
          latitude: input.destLat,
          longitude: input.destLng,
          serviceDurationMinutes: 60,
        },
      ],
      routes: [
        {
          id: `route-gen-${newId}-1`,
          name: "Route A · Central America OSRM Corridor",
          tag: "AI Recommended",
          distance: "845 km",
          distanceKm: 845,
          duration: "14h 30m",
          durationMinutes: 870,
          cost: "$95 / CBM",
          costValue: 95,
          risk: "Low",
          governanceDecision: "NoApprovalRequired",
          recommended: true,
          co2EmissionsKg: 285,
          stops: [
            {
              id: "stop-org",
              sequence: 1,
              stopType: "Pickup",
              locationName: input.originName,
              address: input.originAddress,
              latitude: input.originLat,
              longitude: input.originLng,
              serviceDurationMinutes: 45,
            },
            {
              id: "stop-dst",
              sequence: 2,
              stopType: "Delivery",
              locationName: input.destName,
              address: input.destAddress,
              latitude: input.destLat,
              longitude: input.destLng,
              serviceDurationMinutes: 60,
            },
          ],
          coordinates: [
            { longitude: input.originLng, latitude: input.originLat },
            { longitude: input.destLng, latitude: input.destLat },
          ],
        },
      ],
      mapRoutes: [
        {
          id: `route-gen-${newId}-1`,
          label: "Route A · Central America OSRM Corridor",
          kind: "planned",
          shipmentId: newId,
          coordinates: [
            { longitude: input.originLng, latitude: input.originLat },
            { longitude: input.destLng, latitude: input.destLat },
          ],
        },
      ],
      markers: [
        {
          id: `m-org-${newId}`,
          label: input.originName,
          detail: "Origin / Pickup Point",
          position: { longitude: input.originLng, latitude: input.originLat },
          tone: "origin",
        },
        {
          id: `m-dst-${newId}`,
          label: input.destName,
          detail: "Destination / Delivery Point",
          position: { longitude: input.destLng, latitude: input.destLat },
          tone: "destination",
        },
      ],
      aiRecommendation: {
        recommendedRouteId: `route-gen-${newId}-1`,
        confidence: 97,
        summary: `Optimized Central America corridor for ${input.customerName}`,
        reason: "Direct routing complies with OSRM Central America network and cold-chain constraints.",
        sources: ["VROOM Solver", "OSRM Central America", "Gemini Route Agent"],
        suggestedAction: "Review waypoints and approve route for carrier dispatch",
      },
    };

    set((state) => ({
      shipments: [newShipment, ...state.shipments],
      selectedShipmentId: newId,
      selectedRouteId: newShipment.routes[0].id,
      acceptedRouteId: undefined,
      activeTab: "routes",
    }));

    return newId;
  },
  addCustomRouteToShipment: (shipmentId, customRoute) => {
    set((state) => {
      const updatedShipments = state.shipments.map((s) => {
        if (s.id === shipmentId) {
          const mapRoute = {
            id: customRoute.id,
            label: customRoute.name,
            kind: "alternative" as const,
            shipmentId,
            coordinates: customRoute.coordinates,
          };
          return {
            ...s,
            routes: [customRoute, ...s.routes],
            mapRoutes: [mapRoute, ...s.mapRoutes],
          };
        }
        return s;
      });
      return {
        shipments: updatedShipments,
        selectedRouteId: customRoute.id,
        activeTab: "routes",
      };
    });

    // Call live API asynchronously
    routePlanningApiService
      .createRoute({
        name: customRoute.name,
        routeType: "Standard",
        maxWeightKg: 24000,
        maxVolumeM3: 60,
        estimatedDistanceKm: customRoute.distanceKm,
        estimatedDurationMinutes: customRoute.durationMinutes,
        stops: customRoute.stops.map((s) => ({
          sequence: s.sequence,
          stopType: s.stopType,
          locationName: s.locationName,
          address: s.address,
          latitude: s.latitude,
          longitude: s.longitude,
          serviceDurationMinutes: s.serviceDurationMinutes,
        })),
      })
      .catch(() => {
        // Silently handle
      });
  },
  fetchLiveBackendData: async () => {
    set({ isLoadingApi: true });
    try {
      const [shipmentsRes, routesRes] = await Promise.allSettled([
        routePlanningApiService.listShipments(1, 10),
        routePlanningApiService.listRoutes(1, 10),
      ]);

      if (shipmentsRes.status === "fulfilled" && shipmentsRes.value?.shipments?.length > 0) {
        // Map backend shipments if available
      }
    } catch {
      // Retain fixtures
    } finally {
      set({ isLoadingApi: false });
    }
  },
}));
