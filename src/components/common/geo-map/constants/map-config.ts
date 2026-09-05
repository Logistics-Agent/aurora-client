import type { StyleSpecification } from "maplibre-gl";

export const DEFAULT_MAP_STYLE_URL =
  "https://tiles.openfreemap.org/styles/liberty";

export const MAP_STYLE_LOAD_TIMEOUT_MS = 8_000;

export const OPENFREEMAP_LITE_STYLE = {
  version: 8,
  sources: {
    openmaptiles: {
      type: "vector",
      url: "https://tiles.openfreemap.org/planet",
      attribution:
        "© OpenFreeMap · © OpenMapTiles · © OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#eef4f8" },
    },
    {
      id: "landcover",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "landcover",
      paint: { "fill-color": "#e3eddc", "fill-opacity": 0.72 },
    },
    {
      id: "park",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "park",
      paint: { "fill-color": "#d8ead2", "fill-opacity": 0.78 },
    },
    {
      id: "water",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "water",
      paint: { "fill-color": "#b9ddf5" },
    },
    {
      id: "roads-casing",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      paint: {
        "line-color": "#cbd5df",
        "line-width": ["interpolate", ["linear"], ["zoom"], 5, 0.4, 16, 7],
      },
    },
    {
      id: "roads",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      paint: {
        "line-color": "#ffffff",
        "line-width": ["interpolate", ["linear"], ["zoom"], 5, 0.2, 16, 5],
      },
    },
    {
      id: "buildings-reference",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "building",
      minzoom: 13,
      paint: { "fill-color": "#cbd5e1", "fill-opacity": 0.35 },
    },
  ],
} satisfies StyleSpecification;

type PublicMapEnvironment = {
  NEXT_PUBLIC_MAP_STYLE_URL?: string;
  NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL?: string;
  NEXT_PUBLIC_MAPTILER_KEY?: string;
};

export function getMapRuntimeConfig(environment: PublicMapEnvironment) {
  const maptilerKey = environment.NEXT_PUBLIC_MAPTILER_KEY?.trim();
  const fallbackStyleUrl =
    environment.NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL?.trim();

  return {
    styleUrl:
      environment.NEXT_PUBLIC_MAP_STYLE_URL?.trim() || DEFAULT_MAP_STYLE_URL,
    fallbackStyleUrl: fallbackStyleUrl || undefined,
    hasIndependentFallback: Boolean(fallbackStyleUrl),
    terrainUrl: maptilerKey
      ? `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${maptilerKey}`
      : undefined,
    hasTerrain: Boolean(maptilerKey),
  };
}

export const MAP_RUNTIME_CONFIG = getMapRuntimeConfig({
  NEXT_PUBLIC_MAP_STYLE_URL: process.env.NEXT_PUBLIC_MAP_STYLE_URL,
  NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL:
    process.env.NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL,
  NEXT_PUBLIC_MAPTILER_KEY: process.env.NEXT_PUBLIC_MAPTILER_KEY,
});
