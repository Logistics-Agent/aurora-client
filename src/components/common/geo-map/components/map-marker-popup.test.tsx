import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MapMarkerPopup } from "./map-marker-popup";

describe("MapMarkerPopup", () => {
  it("shows shipment context and closes only when the user dismisses it", () => {
    const onClose = vi.fn();

    render(
      <MapMarkerPopup
        marker={{
          id: "shp-128",
          label: "Cargo shipment",
          detail: "Position received via satellite",
          position: { longitude: 106.7, latitude: 10.78 },
          tone: "current",
          shipmentId: "SHP-128",
          metadata: {
            customer: "Acme",
            eta: "14:35",
            heading: 92,
            mode: "Road",
            region: "SEA",
            risk: "low",
            signal: "Simulated · 18 sec ago",
            speed: "54 km/h",
            status: "In transit",
          },
        }}
        position={{ left: 24, top: 36 }}
        onClose={onClose}
      />,
    );

    expect(screen.getByText("Cargo shipment")).toBeInTheDocument();
    expect(
      screen.getByText("Position received via satellite"),
    ).toBeInTheDocument();
    expect(screen.getByText("SHP-128")).toBeInTheDocument();
    expect(screen.getByText("Customer")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("In transit")).toBeInTheDocument();
    expect(screen.getByText("54 km/h")).toBeInTheDocument();
    expect(screen.getByText("14:35")).toBeInTheDocument();
    expect(screen.getByText("10.7800, 106.7000")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open shipment/i })).toHaveAttribute(
      "href",
      "/shipments/SHP-128",
    );
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /close marker details/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
