import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MapLocationMarkerIcon } from "./map-location-marker-icon";
import { ShipmentMarkerIcon } from "./shipment-marker-icon";
import { ShipmentStatusIcon } from "./shipment-status-icon";
import { TransportModeIcon } from "./transport-mode-icon";

describe("logistics icons", () => {
  it("renders the correct transport mode icon", () => {
    const { container } = render(<TransportModeIcon mode="Ocean" />);

    expect(screen.getByLabelText("Ocean transport")).toHaveAttribute(
      "data-icon",
      "ship",
    );
    expect(
      container.querySelector('path[data-asset="ship.svg"]'),
    ).toHaveAttribute(
      "data-asset",
      "ship.svg",
    );
  });

  it("renders a semantic icon for shipment status", () => {
    render(<ShipmentStatusIcon status="GPS stale" />);

    expect(screen.getByLabelText("GPS stale shipment status")).toHaveAttribute(
      "data-icon",
      "gps-stale",
    );
  });

  it("combines the transport icon and status styling for a map marker", () => {
    render(<ShipmentMarkerIcon mode="Road" status="Delayed" />);

    expect(
      screen.getByRole("img", { name: "Road shipment, Delayed" }),
    ).toHaveAttribute("data-status", "Delayed");
    expect(screen.getByLabelText("Road transport")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Road shipment, Delayed" })).toHaveClass(
      "size-8",
    );
    expect(screen.getByLabelText("Road transport")).toHaveClass("size-5");
  });

  it("renders a semantic icon for non-shipment map locations", () => {
    render(<MapLocationMarkerIcon tone="origin" />);

    expect(screen.getByRole("img", { name: "origin map location" })).toHaveClass(
      "size-8",
    );
    expect(screen.getByLabelText("origin map location")).toHaveAttribute(
      "data-tone",
      "origin",
    );
    expect(
      screen
        .getByRole("img", { name: "origin map location" })
        .querySelector("[data-icon=warehouse]"),
    ).not.toBeNull();
  });
});
