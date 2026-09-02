import { describe, expect, it } from "vitest";
import { getMarkerPresentation } from "./marker-presentation";

describe("getMarkerPresentation", () => {
  it("returns typed mode and status for shipment markers", () => {
    expect(
      getMarkerPresentation({
        id: "shipment",
        label: "Shipment",
        detail: "Fixture",
        tone: "current",
        position: { longitude: 106.7, latitude: 10.77 },
        metadata: { mode: "Ocean", status: "Delayed" },
      }),
    ).toEqual({ mode: "Ocean", status: "Delayed" });
  });

  it("leaves generic map markers on the circle renderer", () => {
    expect(
      getMarkerPresentation({
        id: "generic",
        label: "Generic marker",
        detail: "Fixture",
        tone: "origin",
        position: { longitude: 106.7, latitude: 10.77 },
      }),
    ).toBeUndefined();
  });
});
