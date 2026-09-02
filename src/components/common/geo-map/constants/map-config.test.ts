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

});
