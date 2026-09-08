import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LogisticsGeoMap } from "./logistics-geo-map";

describe("LogisticsGeoMap", () => {
  afterEach(cleanup);

  it("preserves semantic shipment context in the WebGL fallback", async () => {
    render(
      <LogisticsGeoMap
        routes={[
          {
            id: "route",
            label: "Route",
            kind: "current",
            coordinates: [
              { longitude: 106.7, latitude: 10.77 },
              { longitude: 103.82, latitude: 1.29 },
            ],
          },
        ]}
        markers={[
          {
            id: "vehicle",
            label: "Vehicle",
            detail: "Simulated current",
            tone: "current",
            position: { longitude: 106.7, latitude: 10.77 },
          },
        ]}
      >
        <p>Shipment context remains accessible</p>
      </LogisticsGeoMap>,
    );

    expect(await screen.findByText("3D map fallback")).toBeInTheDocument();
    expect(
      screen.getByText("Shipment context remains accessible"),
    ).toBeInTheDocument();
  });

  it("handles selectedRouteId and onRouteSelect", async () => {
    let selectedRoute = "";
    render(
      <LogisticsGeoMap
        selectedRouteId="route-a"
        onRouteSelect={(id) => {
          selectedRoute = id;
        }}
        routes={[
          {
            id: "route-a",
            label: "Route A",
            kind: "current",
            coordinates: [
              { longitude: 106.7, latitude: 10.77 },
              { longitude: 103.82, latitude: 1.29 },
            ],
          },
        ]}
        markers={[]}
      />,
    );

    expect(await screen.findByText("3D map fallback")).toBeInTheDocument();
  });
});
