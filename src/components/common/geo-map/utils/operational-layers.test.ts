import type { Map as MapLibreMap } from "maplibre-gl";
import { describe, expect, it } from "vitest";
import { setBuildingLayersVisibility } from "./operational-layers";

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
});
