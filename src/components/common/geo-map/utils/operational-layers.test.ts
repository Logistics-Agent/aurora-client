import type { Map as MapLibreMap } from "maplibre-gl";
import { describe, expect, it } from "vitest";
import {
  addBuildingExtrusions,
  addTerrain,
  setBuildingLayersVisibility,
  syncOperationalLayers,
} from "./operational-layers";

describe("setBuildingLayersVisibility", () => {
  it("updates both the style buildings and the custom extrusion layer", () => {
    const updates: Array<[string, "visible" | "none"]> = [];
    const map = {
      getStyle: () => ({
        version: 8,
        sources: {},
        layers: [
          { id: "building-fill", type: "fill", "source-layer": "building" },
          {
            id: "building-part-fill",
            type: "fill",
            "source-layer": "building:part",
          },
          { id: "aurora-3d-buildings", type: "fill-extrusion" },
          { id: "roads", type: "line", "source-layer": "transportation" },
        ],
      }),
      setLayoutProperty: (
        layerId: string,
        property: "visibility",
        value: "visible" | "none",
      ) => {
        expect(property).toBe("visibility");
        updates.push([layerId, value]);
      },
    } as unknown as MapLibreMap;

    setBuildingLayersVisibility(map, false);

    expect(updates).toEqual([
      ["building-fill", "none"],
      ["building-part-fill", "none"],
      ["aurora-3d-buildings", "none"],
    ]);
  });

  it("guards setLayoutProperty behind layer existence checks", () => {
    const updates: string[] = [];
    const existingLayers = new Set(["building-fill"]);
    const map = {
      getStyle: () => ({
        version: 8,
        sources: {},
        layers: [
          { id: "building-fill", type: "fill", "source-layer": "building" },
          { id: "missing-building", type: "fill", "source-layer": "building" },
        ],
      }),
      getLayer: (id: string) => (existingLayers.has(id) ? { id } : undefined),
      setLayoutProperty: (layerId: string) => {
        updates.push(layerId);
      },
    } as unknown as MapLibreMap;

    setBuildingLayersVisibility(map, false);

    expect(updates).toEqual(["building-fill"]);
  });
});
describe("syncOperationalLayers", () => {
  it("hides DOM-active markers from the GPU circle layer", () => {
    const addedLayers: Array<Record<string, unknown>> = [];
    const map = {
      getSource: () => undefined,
      addSource: () => {},
      getLayer: () => undefined,
      addLayer: (layer: Record<string, unknown>) => addedLayers.push(layer),
    } as unknown as MapLibreMap;

    syncOperationalLayers(
      map,
      [],
      [
        {
          id: "vehicle",
          label: "Vehicle",
          detail: "Current",
          tone: "current",
          position: { longitude: 105, latitude: 6 },
        },
      ],
      new Set(["vehicle"]),
    );

    const markerLayer = addedLayers.find(
      (layer) => layer.id === "aurora-markers",
    );
    expect(markerLayer?.paint).toMatchObject({
      "circle-opacity": [
        "case",
        ["==", ["get", "hasDomMarker"], true],
        0,
        1,
      ],
    });
  });
});
describe("addTerrain", () => {
  it("returns false and disables terrain when terrainUrl is absent", () => {
    let setTerrainArg: unknown = "initial";
    const map = {
      getSource: () => undefined,
      addSource: () => {},
      setTerrain: (arg: unknown) => {
        setTerrainArg = arg;
      },
    } as unknown as MapLibreMap;

    const result = addTerrain(map, undefined);

    expect(result).toBe(false);
    expect(setTerrainArg).toBeNull();
  });

  it("registers source and enables terrain when terrainUrl is present", () => {
    let addedSource: unknown = null;
    let setTerrainArg: unknown = null;
    const map = {
      getSource: () => undefined,
      addSource: (id: string, source: unknown) => {
        addedSource = { id, source };
      },
      setTerrain: (arg: unknown) => {
        setTerrainArg = arg;
      },
    } as unknown as MapLibreMap;

    const result = addTerrain(map, "https://api.maptiler.com/terrain.json");

    expect(result).toBe(true);
    expect(addedSource).toEqual({
      id: "aurora-terrain",
      source: {
        type: "raster-dem",
        url: "https://api.maptiler.com/terrain.json",
        tileSize: 512,
        maxzoom: 14,
      },
    });
    expect(setTerrainArg).toEqual({
      source: "aurora-terrain",
      exaggeration: 1.15,
    });
  });

  it("does not re-add source if it already exists", () => {
    let addSourceCalled = false;
    const map = {
      getSource: (id: string) =>
        id === "aurora-terrain" ? { id } : undefined,
      addSource: () => {
        addSourceCalled = true;
      },
      setTerrain: () => {},
    } as unknown as MapLibreMap;

    const result = addTerrain(map, "https://api.maptiler.com/terrain.json");

    expect(result).toBe(true);
    expect(addSourceCalled).toBe(false);
  });
});

describe("addBuildingExtrusions", () => {
  it("guards beforeLayerId if the symbol layer does not exist on the map instance", () => {
    let beforeLayerPassed: string | undefined = "not-called";
    const map = {
      getLayer: (id: string) => (id === "labels" ? undefined : undefined),
      getStyle: () => ({
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
      addLayer: (_layer: unknown, beforeId?: string) => {
        beforeLayerPassed = beforeId;
      },
    } as unknown as MapLibreMap;

    const result = addBuildingExtrusions(map);

    expect(result).toBe(true);
    expect(beforeLayerPassed).toBeUndefined();
  });
});
