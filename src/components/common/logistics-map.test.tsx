import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LogisticsMap } from "./logistics-map";

const routes = [
  {
    id: "route-a",
    label: "Active route",
    path: "M10 10 L100 100",
    kind: "current" as const,
  },
];

const markers = [
  {
    id: "gps-1",
    label: "Current GPS position",
    detail: "Updated 18 sec ago",
    shipmentId: "SHP-2026-00128",
    x: 50,
    y: 50,
    tone: "current" as const,
  },
];

describe("LogisticsMap", () => {
  afterEach(cleanup);

  it("zooms, resets the viewport and toggles operational layers", async () => {
    const user = userEvent.setup();
    render(<LogisticsMap routes={routes} markers={markers} />);

    expect(screen.getByText("Map zoom 100%")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /zoom in/i }));
    expect(screen.getByText("Map zoom 125%")).toBeInTheDocument();

    const trafficLayer = screen.getByRole("button", {
      name: /traffic layer/i,
    });
    expect(trafficLayer).toHaveAttribute("aria-pressed", "true");
    await user.click(trafficLayer);
    expect(trafficLayer).toHaveAttribute("aria-pressed", "false");

    await user.click(screen.getByRole("button", { name: /reset map view/i }));
    expect(screen.getByText("Map zoom 100%")).toBeInTheDocument();
  });

  it("renders a map loading state without losing shipment context", () => {
    render(
      <LogisticsMap routes={routes} markers={markers} loading>
        <p>Preserved shipment queue</p>
      </LogisticsMap>,
    );

    expect(screen.getByText("Loading map context")).toBeInTheDocument();
    expect(
      screen.getByText(/shipment and route context remains available/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Preserved shipment queue")).toBeInTheDocument();
  });

  it("does not expose inert markers as buttons", () => {
    render(<LogisticsMap routes={routes} markers={markers} />);

    expect(
      screen.queryByRole("button", { name: /current gps position/i }),
    ).not.toBeInTheDocument();
  });

  it("selects a GPS marker and exposes shipment context", async () => {
    const user = userEvent.setup();
    const onMarkerSelect = vi.fn();

    const { rerender } = render(
      <LogisticsMap
        routes={routes}
        markers={markers}
        onMarkerSelect={onMarkerSelect}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /current gps position/i }),
    );
    expect(onMarkerSelect).toHaveBeenCalledWith("gps-1");

    rerender(
      <LogisticsMap
        routes={routes}
        markers={markers}
        selectedMarkerId="gps-1"
      />,
    );
    expect(screen.getByText("SHP-2026-00128")).toBeInTheDocument();
    expect(screen.getByText("Updated 18 sec ago")).toBeInTheDocument();
  });

  it("preserves a retry action when map tiles are unavailable", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <LogisticsMap
        routes={routes}
        markers={markers}
        unavailable
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText("Map tiles unavailable")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /retry map/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
