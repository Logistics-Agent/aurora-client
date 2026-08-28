import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";
import type {
  LogisticsGeoMarker,
  LogisticsGeoRoute,
  LogisticsGeoRouteKind,
} from "../types";
import {
  markersToFeatureCollection,
  routesToFeatureCollection,
} from "./geojson";
import { getBuildingLayerTarget } from "./map-style";

const ROUTE_SOURCE_ID = "aurora-operational-routes";
const MARKER_SOURCE_ID = "aurora-operational-markers";
const BUILDING_LAYER_ID = "aurora-3d-buildings";

const routePaint: Record<
  LogisticsGeoRouteKind,
  { color: string; width: number; dash?: number[] }
> = {
  planned: { color: "#94a3b8", width: 4, dash: [2, 2] },
  completed: { color: "#20b982", width: 5 },
  current: { color: "#2f74ff", width: 6 },
  alternative: { color: "#7867f2", width: 4, dash: [1.5, 1.5] },
  risk: { color: "#f59e0b", width: 5, dash: [2, 1.5] },
};

export function syncOperationalLayers(
  map: MapLibreMap,
  routes: LogisticsGeoRoute[],
  markers: LogisticsGeoMarker[],
) {
  const routeData = routesToFeatureCollection(routes);
  const markerData = markersToFeatureCollection(markers);
  const routeSource = map.getSource(ROUTE_SOURCE_ID) as
    | GeoJSONSource
    | undefined;
  const markerSource = map.getSource(MARKER_SOURCE_ID) as
    | GeoJSONSource
    | undefined;

  if (routeSource) routeSource.setData(routeData);
  else map.addSource(ROUTE_SOURCE_ID, { type: "geojson", data: routeData });

  if (markerSource) markerSource.setData(markerData);
  else map.addSource(MARKER_SOURCE_ID, { type: "geojson", data: markerData });

  (Object.keys(routePaint) as LogisticsGeoRouteKind[]).forEach((kind) => {
    const layerId = `aurora-route-${kind}`;
    if (map.getLayer(layerId)) return;
    const paint = routePaint[kind];
    map.addLayer({
      id: layerId,
      type: "line",
      source: ROUTE_SOURCE_ID,
      filter: ["==", ["get", "kind"], kind],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": paint.color,
        "line-width": paint.width,
        "line-opacity": 0.92,
        ...(paint.dash ? { "line-dasharray": paint.dash } : {}),
      },
    });
  });

  if (!map.getLayer("aurora-markers")) {
    map.addLayer({
      id: "aurora-markers",
      type: "circle",
      source: MARKER_SOURCE_ID,
      paint: {
        "circle-radius": ["case", ["==", ["get", "tone"], "current"], 9, 7],
        "circle-color": [
          "match",
          ["get", "tone"],
          "origin",
          "#20b982",
          "current",
          "#2f74ff",
          "alert",
          "#f59e0b",
          "#94a3b8",
        ],
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 3,
      },
    });
  }
}

export function addBuildingExtrusions(map: MapLibreMap) {
  if (map.getLayer(BUILDING_LAYER_ID)) return true;
  const target = getBuildingLayerTarget(map.getStyle());
  if (!target) return false;

  map.addLayer(
    {
      id: BUILDING_LAYER_ID,
      type: "fill-extrusion",
      source: target.source,
      "source-layer": target.sourceLayer,
      minzoom: 13,
      paint: {
        "fill-extrusion-color": "#cbd5e1",
        "fill-extrusion-height": [
          "coalesce",
          ["get", "render_height"],
          ["get", "height"],
          12,
        ],
        "fill-extrusion-base": [
          "coalesce",
          ["get", "render_min_height"],
          ["get", "min_height"],
          0,
        ],
        "fill-extrusion-opacity": 0.48,
      },
    },
    target.beforeLayerId,
  );
  return true;
}

export function addTerrain(map: MapLibreMap, terrainUrl?: string) {
  if (!terrainUrl) return false;
  if (!map.getSource("aurora-terrain")) {
    map.addSource("aurora-terrain", {
      type: "raster-dem",
      url: terrainUrl,
      tileSize: 512,
      maxzoom: 14,
    });
  }
  map.setTerrain({ source: "aurora-terrain", exaggeration: 1.15 });
  return true;
}
