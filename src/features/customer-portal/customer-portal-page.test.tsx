import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CustomerPortalPage } from "./index";

const screens = [
  ["customer-overview", "Good morning, Acme Trading"],
  ["customer-shipments", "My Shipments"],
  ["customer-detail", "SHP-128"],
  ["customer-tracking", "Track SHP-128"],
  ["customer-documents", "Documents"],
  ["customer-quotes", "Quotes"],
  ["customer-invoices", "Invoices"],
  ["customer-assistant", "AI Assistant"],
  ["customer-notifications", "Notifications"],
] as const;

describe("CustomerPortalPage", () => {
  afterEach(cleanup);

  it.each(screens)("maps %s to its focused workspace", (kind, heading) => {
    render(<CustomerPortalPage kind={kind} />);
    expect(
      screen.getByRole("heading", { name: heading, level: 1 }),
    ).toBeInTheDocument();
  });
});
