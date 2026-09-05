import { describe, expect, it } from "vitest";
import {
  getOperationalBounds,
  markersToFeatureCollection,
  routesToFeatureCollection,
} from "./geojson";

const routes = [
  {
    id: "hcm-singapore",
    label: "HCM to Singapore",
    kind: "current" as const,
    coordinates: [
      { longitude: 106.7, latitude: 10.77 },
      { longitude: 103.82, latitude: 1.29 },
    ],
  },
];

const markers = [
  {
    id: "vehicle",
    label: "Vehicle",
    detail: "Simulated current",
    tone: "current" as const,
    position: { longitude: 105, latitude: 6 },
    metadata: { mode: "Road", status: "In transit" },
  },
];

describe("geo map conversion", () => {
  it("converts routes and markers to semantic GeoJSON", () => {
    expect(routesToFeatureCollection(routes).features[0]).toMatchObject({
      geometry: {
        type: "LineString",
        coordinates: [
          [106.7, 10.77],
          [103.82, 1.29],
        ],
      },
      properties: { id: "hcm-singapore", kind: "current" },
    });
    expect(markersToFeatureCollection(markers).features[0]).toMatchObject({
      geometry: { type: "Point", coordinates: [105, 6] },
      properties: {
        id: "vehicle",
        tone: "current",
        mode: "Road",
        status: "In transit",
      },
    });
  });

  it("returns bounds spanning every route and marker", () => {
    expect(getOperationalBounds(routes, markers)).toEqual([
      [103.82, 1.29],
      [106.7, 10.77],
    ]);
    expect(getOperationalBounds([], [])).toBeUndefined();
  });

  it("marks only selected and current markers as DOM-active for large fleets", () => {
    const fleet = Array.from({ length: 101 }, (_, index) => ({
      ...markers[0],
      id: `vehicle-${index}`,
      tone: index === 1 ? ("current" as const) : ("origin" as const),
    }));

    const featureCollection = markersToFeatureCollection(
      fleet,
      new Set(["vehicle-0", "vehicle-1"]),
    );

    expect(
      featureCollection.features
        .filter(({ properties }) => properties.hasDomMarker)
        .map(({ properties }) => properties.id),
    ).toEqual(["vehicle-0", "vehicle-1"]);
  });
});
