import type {
  LogisticsGeoMarker,
  LogisticsGeoRoute,
} from "@/components/common";
import type { RouteRealtimeState } from "../../types";
import type { TrackedShipment } from "../types";

export function presentShipmentForSignal(
  shipment: TrackedShipment,
  state: RouteRealtimeState,
): TrackedShipment {
  if (state === "live") return shipment;

  if (state === "stale") {
    return {
      ...shipment,
      detail: `${shipment.customer} · Last update 18 mins ago · movement unavailable`,
    };
  }

  if (state === "reconnecting") {
    return {
      ...shipment,
      detail: `${shipment.customer} · Last-known position · reconnecting`,
    };
  }

  return {
    ...shipment,
    detail: `${shipment.customer} · GPS unavailable · no current movement`,
  };
}

export function presentMarkerForSignal(
  marker: LogisticsGeoMarker,
  state: RouteRealtimeState,
): LogisticsGeoMarker {
  if (state === "live") return marker;

  if (state === "stale") {
    return {
      ...marker,
      detail: "Last update 18 mins ago · movement unavailable",
      tone: "alert",
    };
  }

  if (state === "reconnecting") {
    return {
      ...marker,
      detail: "Last-known position · reconnecting",
      tone: "alert",
    };
  }

  return {
    ...marker,
    detail: "GPS unavailable · no current movement",
    tone: "alert",
  };
}

export function presentRouteForSignal(
  route: LogisticsGeoRoute,
  state: RouteRealtimeState,
): LogisticsGeoRoute {
  if (route.kind !== "current" || state === "live") return route;

  const hasLastKnownRoute = state === "stale" || state === "reconnecting";
  return {
    ...route,
    kind: "planned",
    label: hasLastKnownRoute
      ? `${route.label} · last-known`
      : `${route.label} · planned only`,
  };
}
