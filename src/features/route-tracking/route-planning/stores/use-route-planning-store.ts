"use client";

import { create } from "zustand";
import type { RouteCalculationState, RouteMapAvailability } from "../../types";

type RoutePlanningState = {
  selectedRouteId: string;
  acceptedRouteId?: string;
  mapAvailability: RouteMapAvailability;
  calculationState: RouteCalculationState;
  selectRoute: (routeId: string) => void;
  acceptRoute: (routeId: string) => void;
  setMapAvailability: (state: RouteMapAvailability) => void;
  setCalculationState: (state: RouteCalculationState) => void;
};

export const useRoutePlanningStore = create<RoutePlanningState>((set) => ({
  selectedRouteId: "route-a",
  acceptedRouteId: undefined,
  mapAvailability: "available",
  calculationState: "ready",
  selectRoute: (selectedRouteId) => set({ selectedRouteId }),
  acceptRoute: (acceptedRouteId) => set({ acceptedRouteId }),
  setMapAvailability: (mapAvailability) => set({ mapAvailability }),
  setCalculationState: (calculationState) => set({ calculationState }),
}));
