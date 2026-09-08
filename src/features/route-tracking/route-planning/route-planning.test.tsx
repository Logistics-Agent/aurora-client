import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useRoutePlanningStore } from "./stores/use-route-planning-store";
import { RoutePlanningPage } from "./index";

describe("RoutePlanningPage", () => {
  afterEach(cleanup);

  beforeEach(() => {
    useRoutePlanningStore.setState({
      selectedShipmentId: "SHP-2026-00128",
      selectedRouteId: "route-a",
      mapAvailability: "available",
      calculationState: "ready",
      acceptedRouteId: undefined,
      activeTab: "routes",
    });
  });

  it("selects and accepts an alternative route", () => {
    render(<RoutePlanningPage />);

    const routeB = screen.getByRole("button", { name: /choose route b/i });
    fireEvent.click(routeB);
    expect(routeB).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: /accept & assign route b/i }));
    expect(
      screen.getByText(/linh nguyen/i),
    ).toBeInTheDocument();
  });

  it("switches tabs between Proposed Routes, Cargo Specs, Waypoints, and Route Builder", () => {
    render(<RoutePlanningPage />);

    fireEvent.click(screen.getByRole("button", { name: /^cargo specs$/i }));
    expect(screen.getByText(/gross cargo weight/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^waypoints$/i }));
    expect(screen.getByText(/optimization strategy/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^route builder$/i }));
    expect(screen.getByText(/run vroom solver/i)).toBeInTheDocument();
  });

  it("compares all route alternatives before human acceptance", () => {
    render(<RoutePlanningPage />);

    fireEvent.click(screen.getByRole("button", { name: /^compare routes$/i }));
    const dialog = screen.getByRole("dialog", { name: /route comparison/i });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/Corridor Name/i)).toBeInTheDocument();
  });

  it("switches shipment context and updates cargo specs", () => {
    render(<RoutePlanningPage />);

    const select = screen.getByRole("combobox", {
      name: /select shipment for route planning/i,
    });
    fireEvent.change(select, { target: { value: "SHP-2026-00127" } });

    expect(screen.getByText("Northstar Retail")).toBeInTheDocument();
  });
});
