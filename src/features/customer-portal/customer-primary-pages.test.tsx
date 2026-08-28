import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { OverviewPage } from "./overview";
import { ShipmentsPage } from "./shipments";

afterEach(cleanup);

describe("customer primary workspaces", () => {
  it("renders the complete customer overview and attention action", () => {
    render(<OverviewPage />);

    expect(
      screen.getByRole("heading", { name: "Good morning, Acme Trading" }),
    ).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("34")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /review document/i }),
    ).toHaveAttribute("href", "/portal/documents");
    expect(screen.getByText("Customer-safe data only")).toBeInTheDocument();
  });

  it("filters, selects and opens a customer shipment", async () => {
    const user = userEvent.setup();
    render(<ShipmentsPage />);

    expect(screen.getByText("Viewing 4 of 12 shipments")).toBeInTheDocument();
    await user.type(
      screen.getByPlaceholderText("Search shipment ID, origin or destination"),
      "Busan",
    );
    expect(screen.getByText("SHP-124")).toBeInTheDocument();
    expect(screen.queryByText("SHP-128")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /select shp-124/i }));
    expect(
      screen.getByRole("link", { name: /view shipment/i }),
    ).toHaveAttribute("href", "/portal/shipments/SHP-2026-00124");
  });
});
