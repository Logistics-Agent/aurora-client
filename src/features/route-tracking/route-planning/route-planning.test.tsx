import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useRoutePlanningStore } from "./stores/use-route-planning-store";
import { RoutePlanningPage } from "./index";

describe("RoutePlanningPage", () => {
  afterEach(cleanup);

  beforeEach(() => {
    useRoutePlanningStore.setState({
      selectedRouteId: "route-a",
      mapAvailability: "available",
      calculationState: "ready",
      acceptedRouteId: undefined,
    });
  });

  it("selects and accepts an alternative route", () => {
    render(<RoutePlanningPage />);

    const routeB = screen.getByRole("button", { name: "Choose Route B" });
    fireEvent.click(routeB);
    expect(routeB).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: /accept route b/i }));
    expect(
      screen.getByText(/route b selected by linh nguyen/i),
    ).toBeInTheDocument();
  });

  it("recovers from calculation failure", () => {
    render(<RoutePlanningPage />);

    fireEvent.click(screen.getByRole("button", { name: /simulate failure/i }));
    expect(screen.getByText("Route calculation failed")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /accept route a/i }),
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /retry calculation/i }));
    expect(screen.getByText("Proposed routes")).toBeInTheDocument();
  });

  it("compares all route alternatives before human acceptance", () => {
    render(<RoutePlanningPage />);

    fireEvent.click(screen.getByRole("button", { name: /^compare routes$/i }));
    expect(
      screen.getByRole("dialog", { name: /route comparison/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/3 route alternatives/i)).toBeInTheDocument();
  });
});
