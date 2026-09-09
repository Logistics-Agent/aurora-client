"use client";

import { useQuery } from "@tanstack/react-query";
import { trackingKeys } from "@/api/query-keys/tracking.keys";
import { trackingService } from "@/api/services/tracking.service";

export function useCurrentLocationQuery(
  id: string,
  type: "shipment" | "vehicle" = "shipment",
  refetchInterval = 2_500,
) {
  return useQuery({
    queryKey: trackingKeys.currentLocation(id, type),
    queryFn: () => trackingService.getCurrentLocation(id, type),
    enabled: Boolean(id),
    refetchInterval,
    refetchIntervalInBackground: true,
    retry: false,
  });
}
