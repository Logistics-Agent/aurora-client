import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useShipmentTrackingStore } from "./stores/use-shipment-tracking-store";
import { ShipmentTrackingPage } from "./index";

describe("ShipmentTrackingPage", () => {
  afterEach(cleanup);

  beforeEach(() => {
    useShipmentTrackingStore.setState({
      selectedMarkerId: "tracking-current",
      realtimeState: "live",
      mapAvailability: "available",
      trackingException: "normal",
    });
  });

  it("shows a route-deviation action that preserves shipment context", () => {
    render(<ShipmentTrackingPage shipmentId="SHP-2026-00128" />);

    fireEvent.click(
      screen.getByRole("button", { name: /simulate route deviation/i }),
    );

    expect(
      screen.getByText(/vehicle is 2.4 km outside planned route/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /review alternatives/i }),
    ).toHaveAttribute("href", "/route-planning");
    expect(
      screen.getByText(/SHP-2026-00128 context is preserved/i),
    ).toBeInTheDocument();
  });

  it("does not reuse another shipment telemetry for an unknown id", () => {
    render(<ShipmentTrackingPage shipmentId="SHP-UNKNOWN" />);

    expect(
      screen.getByRole("heading", { name: "No tracking fixture" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("54 km/h")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /simulate route deviation/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /cycle map state/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/HCM → Singapore/)).not.toBeInTheDocument();
  });

  it("withholds current motion values when GPS is stale", () => {
    useShipmentTrackingStore.setState({ realtimeState: "stale" });
    render(<ShipmentTrackingPage shipmentId="SHP-2026-00128" />);

    expect(
      screen.getAllByText("Last update 18 mins ago").length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("54 km/h")).not.toBeInTheDocument();
    expect(screen.getAllByText("Unavailable").length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText(/^Live$/)).not.toBeInTheDocument();
  });

  it("reconnects from the persistent disconnected banner", () => {
    useShipmentTrackingStore.setState({ realtimeState: "disconnected" });
    render(<ShipmentTrackingPage shipmentId="SHP-2026-00128" />);

    fireEvent.click(screen.getByRole("button", { name: /^reconnect$/i }));
    expect(screen.getByText("Reconnecting")).toBeInTheDocument();
  });

  it("does not expose retained progress as current while GPS is offline", () => {
    useShipmentTrackingStore.setState({ realtimeState: "offline" });
    render(<ShipmentTrackingPage shipmentId="SHP-2026-00128" />);

    expect(screen.queryByText("62%")).not.toBeInTheDocument();
    expect(screen.getByText("Route progress unavailable")).toBeInTheDocument();
  });
});
