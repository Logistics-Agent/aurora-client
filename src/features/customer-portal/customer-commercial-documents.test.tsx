import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DocumentsPage } from "./documents";
import { InvoicesPage } from "./invoices";
import { QuotesPage } from "./quotes";

describe("customer commercial and document workspaces", () => {
  it("filters documents and opens a local preview", () => {
    render(<DocumentsPage />);

    fireEvent.change(screen.getByPlaceholderText(/search documents/i), {
      target: { value: "Commercial" },
    });

    expect(screen.queryByText("Bill of Lading")).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /open commercial invoice/i }),
    );
    expect(
      screen.getByText("Document preview: Commercial Invoice"),
    ).toBeInTheDocument();
  });

  it("confirms a quote locally", () => {
    render(<QuotesPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /confirm quote q-2026-014/i }),
    );
    expect(screen.getAllByText("Confirmed").length).toBeGreaterThan(1);
  });

  it("selects an invoice and displays its customer-safe detail", () => {
    render(<InvoicesPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /view invoice inv-2208/i }),
    );
    expect(screen.getByText("Due 31 Aug")).toBeInTheDocument();
    expect(screen.getAllByText("USD 4,280").length).toBeGreaterThan(0);
  });
});
