import { rootQueryKeys } from "./root.keys";

export const trackingKeys = {
  all: [...rootQueryKeys.all, "tracking"] as const,
  currentLocations: () => [...trackingKeys.all, "current-location"] as const,
  currentLocation: (id: string, type: "shipment" | "vehicle") =>
    [...trackingKeys.currentLocations(), type, id] as const,
} as const;
