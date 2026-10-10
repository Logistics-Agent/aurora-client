import { describe, expect, it } from "vitest";
import { getBuildingLayerTarget, getMapPitch } from "./map-style";

describe("map style inspection", () => {
  it("discovers an OpenMapTiles-compatible building source", () => {
    expect(
      getBuildingLayerTarget({
        version: 8,
        sources: { openmaptiles: { type: "vector" } },
        layers: [
          {
            id: "building",
            type: "fill",
            source: "openmaptiles",
            "source-layer": "building",
          },
          { id: "labels", type: "symbol" },
        ],
      }),
    ).toEqual({
      source: "openmaptiles",
      sourceLayer: "building",
      beforeLayerId: "labels",
    });
  });

  it("returns undefined when building data is unavailable", () => {
    expect(
      getBuildingLayerTarget({ version: 8, sources: {}, layers: [] }),
    ).toBeUndefined();
    expect(
      getBuildingLayerTarget({
        version: 8,
        sources: { osm: { type: "raster" } },
        layers: [{ id: "osm", type: "raster" }],
      }),
    ).toBeUndefined();
  });

  it("handles building source without symbol layers gracefully", () => {
    expect(
      getBuildingLayerTarget({
        version: 8,
        sources: { openmaptiles: { type: "vector" } },
        layers: [
          {
            id: "building",
            type: "fill",
            source: "openmaptiles",
            "source-layer": "building",
          },
        ],
      }),
    ).toEqual({
      source: "openmaptiles",
      sourceLayer: "building",
      beforeLayerId: undefined,
    });
  });

  it("uses a restrained responsive and reduced-motion pitch", () => {
    expect(getMapPitch(1280, false)).toBe(56);
    expect(getMapPitch(800, false)).toBe(45);
    expect(getMapPitch(390, false)).toBe(35);
    expect(getMapPitch(1280, true)).toBe(0);
  });
});
