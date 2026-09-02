"use client";

import { create } from "zustand";
import type { RouteMapAvailability, RouteRealtimeState } from "../../types";
import type { TrackingExceptionState } from "../types";

type ShipmentTrackingState = {
  selectedMarkerId: string;
  realtimeState: RouteRealtimeState;
  mapAvailability: RouteMapAvailability;
  trackingException: TrackingExceptionState;
  selectMarker: (markerId: string) => void;
  setRealtimeState: (state: RouteRealtimeState) => void;
  setMapAvailability: (state: RouteMapAvailability) => void;
  setTrackingException: (state: TrackingExceptionState) => void;
};

export const useShipmentTrackingStore = create<ShipmentTrackingState>(
  (set) => ({
    selectedMarkerId: "",
    realtimeState: "live",
    mapAvailability: "available",
    trackingException: "normal",
    selectMarker: (selectedMarkerId) => set({ selectedMarkerId }),
    setRealtimeState: (realtimeState) => set({ realtimeState }),
    setMapAvailability: (mapAvailability) => set({ mapAvailability }),
    setTrackingException: (trackingException) => set({ trackingException }),
  }),
);
