import type {
  ShipmentStatus,
  TransportMode,
} from "@/components/icons";
import type { LogisticsGeoMarker } from "../types";

const transportModes: readonly TransportMode[] = ["Road", "Ocean", "Air"];
const shipmentStatuses: readonly ShipmentStatus[] = [
  "In transit",
  "Delayed",
  "At hub",
  "GPS stale",
];

function isTransportMode(value: string): value is TransportMode {
  return transportModes.includes(value as TransportMode);
}

function isShipmentStatus(value: string): value is ShipmentStatus {
  return shipmentStatuses.includes(value as ShipmentStatus);
}

export function getMarkerPresentation(marker: LogisticsGeoMarker) {
  const mode = marker.metadata?.mode;
  const status = marker.metadata?.status;

  if (
    typeof mode !== "string" ||
    typeof status !== "string" ||
    !isTransportMode(mode) ||
    !isShipmentStatus(status)
  ) {
    return undefined;
  }

  return { mode, status };
}
