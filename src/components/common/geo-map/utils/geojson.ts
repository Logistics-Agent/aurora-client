import type { LogisticsGeoMarker, LogisticsGeoRoute } from "../types";

export function routesToFeatureCollection(routes: LogisticsGeoRoute[]) {
  return {
    type: "FeatureCollection" as const,
    features: routes.map((route) => ({
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: route.coordinates.map(
          ({ longitude, latitude }) =>
            [longitude, latitude] as [number, number],
        ),
      },
      properties: {
        id: route.id,
        label: route.label,
        kind: route.kind,
        layer: route.layer ?? "operations",
      },
    })),
  };
}

export function markersToFeatureCollection(markers: LogisticsGeoMarker[]) {
  return {
    type: "FeatureCollection" as const,
    features: markers.map((marker) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [marker.position.longitude, marker.position.latitude] as [
          number,
          number,
        ],
      },
      properties: {
        id: marker.id,
        label: marker.label,
        detail: marker.detail,
        tone: marker.tone,
        shipmentId: marker.shipmentId ?? "",
        heading: marker.heading ?? 0,
      },
    })),
  };
}

export function getOperationalBounds(
  routes: LogisticsGeoRoute[],
  markers: LogisticsGeoMarker[],
): [[number, number], [number, number]] | undefined {
  const points = [
    ...routes.flatMap((route) => route.coordinates),
    ...markers.map((marker) => marker.position),
  ];
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
