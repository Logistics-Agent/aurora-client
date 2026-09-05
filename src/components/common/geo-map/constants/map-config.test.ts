import { describe, expect, it } from "vitest";
import {
  DEFAULT_MAP_STYLE_URL,
  getMapRuntimeConfig,
  OPENFREEMAP_LITE_STYLE,
} from "./map-config";

describe("map runtime config", () => {
  it("uses the real OpenFreeMap style without credentials", () => {
    expect(DEFAULT_MAP_STYLE_URL).toBe(
      "https://tiles.openfreemap.org/styles/liberty",
    );
    expect(getMapRuntimeConfig({})).toEqual({
      styleUrl: DEFAULT_MAP_STYLE_URL,
      fallbackStyleUrl: undefined,
      hasIndependentFallback: false,
      terrainUrl: undefined,
      hasTerrain: false,
    });
  });

  it("builds optional MapTiler terrain configuration", () => {
    expect(
      getMapRuntimeConfig({
        NEXT_PUBLIC_MAP_STYLE_URL: "https://maps.example/style.json",
        NEXT_PUBLIC_MAPTILER_KEY: "demo-key",
      }),
    ).toEqual({
      styleUrl: "https://maps.example/style.json",
      fallbackStyleUrl: undefined,
      hasIndependentFallback: false,
      terrainUrl:
        "https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=demo-key",
      hasTerrain: true,
    });
  });

  it("keeps the resilient style on the reachable OpenFreeMap vector source", () => {
    expect(OPENFREEMAP_LITE_STYLE.sources.openmaptiles).toMatchObject({
      type: "vector",
      url: "https://tiles.openfreemap.org/planet",
    });
    expect(JSON.stringify(OPENFREEMAP_LITE_STYLE)).not.toContain(
      "tile.openstreetmap.org",
    );
  });

  it("handles empty and whitespace-only NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL", () => {
    expect(
      getMapRuntimeConfig({
        NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL: "",
      }),
    ).toMatchObject({
      fallbackStyleUrl: undefined,
      hasIndependentFallback: false,
    });

    expect(
      getMapRuntimeConfig({
        NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL: "   ",
      }),
    ).toMatchObject({
      fallbackStyleUrl: undefined,
      hasIndependentFallback: false,
    });
  });

  it("configures valid NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL", () => {
    expect(
      getMapRuntimeConfig({
        NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL:
          "https://fallback-tiles.example.com/style.json",
      }),
    ).toMatchObject({
      fallbackStyleUrl: "https://fallback-tiles.example.com/style.json",
      hasIndependentFallback: true,
    });
  });
});
