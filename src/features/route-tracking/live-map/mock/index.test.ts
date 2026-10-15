import { describe, expect, it } from "vitest";
import { liveMapMock, liveShipments } from ".";

describe("live map mock markers", () => {
  it("provides transport and status metadata for every shipment marker", () => {
    const shipmentMarkers = liveMapMock.markers.filter(
      (marker) => !marker.id.endsWith("-origin"),
    );

    expect(shipmentMarkers).toHaveLength(liveShipments.length);

    shipmentMarkers.forEach((marker, index) => {
      const shipment = liveShipments[index];

      expect(marker.metadata).toMatchObject({
        customer: shipment.customer,
        eta: shipment.eta,
        mode: shipment.mode,
        region: shipment.region,
        risk: shipment.risk,
        speed: shipment.speed,
        status: shipment.status,
      });
    });
  });

  it("provides an origin location marker for every route", () => {
    const originMarkers = liveMapMock.markers.filter((marker) =>
      marker.id.endsWith("-origin"),
    );

    expect(originMarkers).toHaveLength(liveMapMock.routes.length);
    expect(originMarkers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "shp-128-route-origin",
          label: "San José Central Cargo Hub",
          shipmentId: "SHP-2026-00128",
          tone: "origin",
          metadata: expect.objectContaining({
            customer: "Acme Latin America",
            status: "In transit",
            risk: "low",
          }),
          position: { longitude: -84.0833, latitude: 9.9333 },
        }),
        expect.objectContaining({
          id: "shp-135-route-origin",
          label: "Puerto Cortés Atlantic Deep Sea Terminal",
          shipmentId: "SHP-2026-00135",
          tone: "origin",
          position: { longitude: -87.9353, latitude: 15.8278 },
        }),
      ]),
    );
  });
});
