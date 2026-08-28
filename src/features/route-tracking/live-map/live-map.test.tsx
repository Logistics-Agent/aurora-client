import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useLiveMapStore } from "./stores/use-live-map-store";
import { LiveMapPage } from "./index";

describe("LiveMapPage", () => {
  afterEach(cleanup);

  beforeEach(() => {
    useLiveMapStore.setState({
      selectedShipmentId: "SHP-128",
      selectedMarkerId: "shp-128",
      realtimeState: "live",
      mapAvailability: "available",
    });
  });

  it("opens the selected shipment drawer with the matching route", () => {
    render(<LiveMapPage />);

    fireEvent.click(
      screen.getByRole("button", { name: "Select shipment SHP-129" }),
    );

    const drawer = screen.getByRole("complementary", {
      name: /selected shipment details/i,
    });
    expect(drawer).toHaveTextContent("SHP-129");
    expect(
      screen.getByRole("link", { name: /open shipment shp-129/i }),
    ).toHaveAttribute("href", "/shipments/SHP-2026-00129");
    expect(
      screen.getByLabelText("Interactive shipment GPS map"),
    ).not.toContainElement(drawer);
  });

  it("labels current fixtures as simulated and filters the queue", () => {
    render(<LiveMapPage />);

    expect(screen.queryAllByText(/^Live$/)).toHaveLength(0);
    expect(
      screen.getAllByText(/simulated current/i).length,
    ).toBeGreaterThanOrEqual(1);

    fireEvent.click(screen.getByRole("button", { name: "Risk: high" }));
    expect(
      screen.getByRole("button", { name: "Select shipment SHP-129" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Select shipment SHP-128" }),
    ).not.toBeInTheDocument();
  });

  it("preserves shipment controls while the map is loading", () => {
    useLiveMapStore.setState({ mapAvailability: "loading" });
    render(<LiveMapPage />);

    expect(screen.getByText("Loading map context")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /search active shipments/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("complementary", {
        name: /selected shipment details/i,
      }),
    ).toBeInTheDocument();
  });

  it("withholds current movement when the fleet signal is stale or offline", () => {
    useLiveMapStore.setState({ realtimeState: "stale" });
    const { rerender } = render(<LiveMapPage />);

    expect(screen.queryByText(/54 km\/h/)).not.toBeInTheDocument();
    expect(
      screen.getAllByText(/last update 18 mins ago/i).length,
    ).toBeGreaterThanOrEqual(1);

    useLiveMapStore.setState({ realtimeState: "offline" });
    rerender(<LiveMapPage />);
    expect(screen.queryByText(/54 km\/h/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/gps unavailable/i).length).toBeGreaterThan(0);
  });

  it("applies filters to markers and closes a filtered-out drawer", () => {
    render(<LiveMapPage />);

    expect(
      screen.getByRole("button", { name: /shp-128.*in transit/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("complementary", {
        name: /selected shipment details/i,
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Risk: high" }));

    expect(
      screen.queryByRole("button", { name: /shp-128.*in transit/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("complementary", {
        name: /selected shipment details/i,
      }),
    ).not.toBeInTheDocument();
  });
});
