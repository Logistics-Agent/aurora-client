"use client";

import { create } from "zustand";
import type { RouteMapAvailability, RouteRealtimeState } from "../../types";

type LiveMapState = {
  selectedShipmentId: string;
  selectedMarkerId: string;
  realtimeState: RouteRealtimeState;
  mapAvailability: RouteMapAvailability;
  selectShipment: (shipmentId: string, markerId: string) => void;
  setRealtimeState: (state: RouteRealtimeState) => void;
  setMapAvailability: (state: RouteMapAvailability) => void;
};

export const useLiveMapStore = create<LiveMapState>((set) => ({
  selectedShipmentId: "SHP-128",
  selectedMarkerId: "shp-128",
  realtimeState: "live",
  mapAvailability: "available",
  selectShipment: (selectedShipmentId, selectedMarkerId) =>
    set({ selectedShipmentId, selectedMarkerId }),
  setRealtimeState: (realtimeState) => set({ realtimeState }),
  setMapAvailability: (mapAvailability) => set({ mapAvailability }),
}));
