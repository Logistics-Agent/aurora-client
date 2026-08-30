import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CommandCenterPage } from "./index";

type GeoMapTestProps = {
  routes: Array<{ label: string }>;
  markers: Array<{ label: string }>;
  children?: ReactNode;
};

vi.mock("@/components/common", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/common")>();

  return {
    ...actual,
    LogisticsGeoMap: ({ routes, markers, children }: GeoMapTestProps) => (
      <div aria-label="Real 3D shipment map">
        {routes.map((route) => (
          <span key={route.label}>{route.label}</span>
        ))}
        {markers.map((marker) => (
          <span key={marker.label}>{marker.label}</span>
        ))}
        {children}
      </div>
    ),
  };
});

afterEach(cleanup);

describe("CommandCenterPage", () => {
  it("renders the real map boundary for the network overview", () => {
    render(<CommandCenterPage />);

    expect(screen.getByLabelText("Real 3D shipment map")).toBeInTheDocument();
    expect(
      screen.getByText("HCM to Singapore network lane"),
    ).toBeInTheDocument();
    expect(screen.queryByText("3D map fallback")).not.toBeInTheDocument();
  });
});
