import {
  HTML_MARKER_LIMIT,
  type GeoPoint,
  type LogisticsGeoMarker,
  type LogisticsGeoRoute,
} from "../types";

export function getDomMarkerIds(
  markers: LogisticsGeoMarker[],
  selectedMarkerId?: string,
) {
  if (markers.length <= HTML_MARKER_LIMIT) {
    return new Set(markers.map((marker) => marker.id));
  }

  return new Set(
    markers
      .filter(
        (marker) =>
          marker.id === selectedMarkerId || marker.tone === "current",
      )
      .map((marker) => marker.id),
  );
}

export function routesToFeatureCollection(routes: LogisticsGeoRoute[]) {
  return {
    type: "FeatureCollection" as const,
    features: routes.map((route) => {
      const rawCoords = route.coordinates ?? (route as any).path ?? [];
      const validCoords = Array.isArray(rawCoords)
        ? rawCoords.filter(
            (c): c is GeoPoint =>
              Boolean(c && typeof c.longitude === "number" && typeof c.latitude === "number"),
          )
        : [];

      return {
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: validCoords.map(
            ({ longitude, latitude }) =>
              [longitude, latitude] as [number, number],
          ),
        },
        properties: {
          id: route.id,
          label: route.label ?? (route as any).title ?? "Route",
          kind: route.kind ?? "planned",
          layer: route.layer ?? "operations",
        },
      };
    }),
  };
}

export function markersToFeatureCollection(
  markers: LogisticsGeoMarker[],
  domMarkerIds = getDomMarkerIds(markers),
) {
  return {
    type: "FeatureCollection" as const,
    features: markers
      .filter(
        (marker) =>
          marker.position &&
          typeof marker.position.longitude === "number" &&
          typeof marker.position.latitude === "number",
      )
      .map((marker) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [
            marker.position.longitude,
            marker.position.latitude,
          ] as [number, number],
        },
        properties: {
          id: marker.id,
          label: marker.label,
          detail: marker.detail,
          tone: marker.tone,
          shipmentId: marker.shipmentId ?? "",
          heading: marker.heading ?? 0,
          mode: marker.metadata?.mode ?? "",
          status: marker.metadata?.status ?? "",
          hasDomMarker: domMarkerIds.has(marker.id),
        },
      })),
  };
}

export function getOperationalBounds(
  routes: LogisticsGeoRoute[],
  markers: LogisticsGeoMarker[],
  focusedRouteId?: string,
): [[number, number], [number, number]] | undefined {
  let targetRoutes = routes;
  if (focusedRouteId) {
    const matched = routes.find((r) => r.id === focusedRouteId);
    if (
      matched &&
      Array.isArray(matched.coordinates) &&
      matched.coordinates.length > 0
    ) {
      targetRoutes = [matched];
    }
  }

  const points = [
    ...targetRoutes.flatMap((route) => {
      const raw = route.coordinates ?? (route as any).path;
      return Array.isArray(raw) ? raw : [];
    }),
    ...markers.map((marker) => marker.position),
  ].filter(
    (point): point is GeoPoint =>
      Boolean(
        point &&
          typeof point.longitude === "number" &&
          typeof point.latitude === "number",
      ),
  );

  if (points.length === 0) return undefined;

  return points.reduce<[[number, number], [number, number]]>(
    (bounds, point) => [
      [
        Math.min(bounds[0][0], point.longitude),
        Math.min(bounds[0][1], point.latitude),
      ],
      [
        Math.max(bounds[1][0], point.longitude),
        Math.max(bounds[1][1], point.latitude),
      ],
    ],
    [
      [points[0].longitude, points[0].latitude],
      [points[0].longitude, points[0].latitude],
    ],
  );
}
