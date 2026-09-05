"use client";

import { LogisticsMap } from "../../logistics-map";
import type {
  LogisticsMapMarker,
  LogisticsMapRoute,
} from "../../logistics-map";
import type { LogisticsGeoMarker, LogisticsGeoRoute } from "../types";

import type { MapHealthState } from "../types/map-health";

function projectFallbackPoint(
  longitude: number,
  latitude: number,
  bounds: [[number, number], [number, number]],
) {
  const longitudeRange = Math.max(0.001, bounds[1][0] - bounds[0][0]);
  const latitudeRange = Math.max(0.001, bounds[1][1] - bounds[0][1]);
  return {
    x: 10 + ((longitude - bounds[0][0]) / longitudeRange) * 80,
    y: 90 - ((latitude - bounds[0][1]) / latitudeRange) * 80,
  };
}

export function SvgMapFallback({
  routes,
  markers,
  selectedRouteId,
  selectedMarkerId,
  onMarkerSelect,
  loading,
  unavailable,
  onRetry,
  className,
  children,
  healthState,
}: {
  routes: LogisticsGeoRoute[];
  markers: LogisticsGeoMarker[];
  selectedRouteId?: string;
  selectedMarkerId?: string;
  onMarkerSelect?: (markerId: string) => void;
  loading?: boolean;
  unavailable?: boolean;
  onRetry?: () => void;
  className?: string;
  children?: React.ReactNode;
  healthState?: MapHealthState;
}) {
  const points = [
    ...routes.flatMap((route) => route.coordinates),
    ...markers.map((marker) => marker.position),
  ];
  const bounds: [[number, number], [number, number]] = points.length
    ? [
        [
          Math.min(...points.map((point) => point.longitude)),
          Math.min(...points.map((point) => point.latitude)),
        ],
        [
          Math.max(...points.map((point) => point.longitude)),
          Math.max(...points.map((point) => point.latitude)),
        ],
      ]
    : [
        [0, 0],
        [1, 1],
      ];
  const fallbackRoutes: LogisticsMapRoute[] = routes.map((route) => ({
    id: route.id,
    label: route.label,
    kind: route.kind,
    layer: route.layer,
    path: route.coordinates
      .map((point, index) => {
        const projected = projectFallbackPoint(
          point.longitude,
          point.latitude,
          bounds,
        );
        return `${index === 0 ? "M" : "L"}${projected.x * 8} ${projected.y * 4.4}`;
      })
      .join(" "),
  }));
  const fallbackMarkers: LogisticsMapMarker[] = markers.map((marker) => ({
    id: marker.id,
    label: marker.label,
    detail: marker.detail,
    shipmentId: marker.shipmentId,
    tone: marker.tone,
    ...projectFallbackPoint(
      marker.position.longitude,
      marker.position.latitude,
      bounds,
    ),
    heading: marker.heading,
    metadata: marker.metadata,
    position: marker.position,
  }));

  return (
    <LogisticsMap
      routes={fallbackRoutes}
      markers={fallbackMarkers}
      selectedRouteId={selectedRouteId}
      selectedMarkerId={selectedMarkerId}
      onMarkerSelect={onMarkerSelect}
      loading={loading}
      unavailable={unavailable}
      onRetry={onRetry}
      className={className}
    >
      <div className="absolute left-3 top-3 z-40 flex items-center gap-2">
        <span
          className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800"
          data-health-state={healthState}
          aria-label={
            healthState
              ? `3D map fallback due to ${healthState}`
              : "3D map fallback"
          }
        >
          3D map fallback
        </span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full border border-amber-300 bg-white/90 px-2.5 py-1 text-[11px] font-medium text-amber-900 shadow-sm transition-colors hover:bg-amber-50"
            aria-label="Retry map"
          >
            Retry
          </button>
        )}
      </div>
      {children}
    </LogisticsMap>
  );
}
