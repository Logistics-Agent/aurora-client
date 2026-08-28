import type { RouteMapAvailability, RouteRealtimeState } from "../types";

export function nextRealtimeState(
  state: RouteRealtimeState,
): RouteRealtimeState {
  const transitions: Record<RouteRealtimeState, RouteRealtimeState> = {
    live: "stale",
    stale: "offline",
    offline: "disconnected",
    disconnected: "reconnecting",
    reconnecting: "live",
    unavailable: "live",
  };

  return transitions[state];
}

export function nextMapAvailability(
  state: RouteMapAvailability,
): RouteMapAvailability {
  const transitions: Record<RouteMapAvailability, RouteMapAvailability> = {
    available: "loading",
    loading: "unavailable",
    unavailable: "available",
  };

  return transitions[state];
}
