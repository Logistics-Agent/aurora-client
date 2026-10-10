import type {
  LogisticsGeoMarker,
  LogisticsGeoRoute,
} from "@/components/common";
import type { RealtimeState } from "@/components/common";

export type RouteMapFixture = {
  routes: LogisticsGeoRoute[];
  markers: LogisticsGeoMarker[];
};

export type RouteMapAvailability = "available" | "loading" | "unavailable";
export type RouteCalculationState = "ready" | "loading" | "calculating" | "failed";
export type RouteRealtimeState = RealtimeState;
