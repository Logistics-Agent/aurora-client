import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ShipmentDetailPage } from "./index";

describe("ShipmentDetailPage", () => {
  afterEach(cleanup);

  it("labels fixture GPS as simulated instead of live", () => {
    render(<ShipmentDetailPage shipmentId="SHP-2026-00128" />);

    fireEvent.click(screen.getByRole("button", { name: "Route" }));

    expect(screen.getByText("Simulated current")).toBeInTheDocument();
    expect(screen.queryByText(/^Live$/)).not.toBeInTheDocument();
  });
});
