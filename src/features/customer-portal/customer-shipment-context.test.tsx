import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ShipmentDetailPage } from "./shipment-detail";
import { TrackingPage } from "./tracking";

afterEach(cleanup);

describe("customer shipment context", () => {
  it("renders customer-visible shipment detail and actions", () => {
    render(<ShipmentDetailPage />);

    expect(
      screen.getByRole("heading", { name: "SHP-128" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Delayed · customer notified")).toBeInTheDocument();
    expect(screen.getByText("Container departed Cat Lai")).toBeInTheDocument();
    expect(screen.getByText("Reference: PO-2026-118")).toBeInTheDocument();
    expect(screen.getByText("Bill of Lading")).toBeInTheDocument();
    expect(screen.getByText("Commercial Invoice")).toBeInTheDocument();
    expect(screen.getByText("Packing List")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /view tracking/i }),
    ).toHaveAttribute("href", "/portal/shipments/SHP-2026-00128/tracking");
    expect(
      screen.getByRole("link", { name: /ask ai assistant/i }),
    ).toHaveAttribute("href", "/portal/assistant");
  });

  it("renders stale customer-safe tracking without internal GPS controls", () => {
    render(<TrackingPage />);

    expect(
      screen.getByRole("heading", { name: "Track SHP-128" }),
    ).toBeInTheDocument();
    expect(screen.getByText("GPS stale")).toBeInTheDocument();
    expect(
      screen.getAllByText(/last updated 18 minutes ago/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText(
        /current carrier position unavailable in this customer view/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("Port congestion advisory").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("ETA updated")).toBeInTheDocument();
    expect(screen.queryByText("Speed")).not.toBeInTheDocument();
    expect(screen.queryByText("Heading")).not.toBeInTheDocument();
    expect(screen.queryByText("Reconnect")).not.toBeInTheDocument();
    expect(screen.queryByText(/10\.7769/)).not.toBeInTheDocument();
  });
});
