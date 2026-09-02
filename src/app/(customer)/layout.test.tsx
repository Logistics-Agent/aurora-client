import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CustomerLayout from "./layout";

vi.mock("@/components/layout", () => ({
  CustomerShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="customer-shell">{children}</div>
  ),
}));

vi.mock("@/features/notifications/popup", () => ({
  NotificationPopup: () => <div data-testid="notification-popup" />,
}));

describe("CustomerLayout", () => {
  it("mounts the notification popup inside the customer shell", () => {
    render(
      <CustomerLayout>
        <p>Customer page</p>
      </CustomerLayout>,
    );

    expect(screen.getByTestId("customer-shell")).toContainElement(
      screen.getByTestId("notification-popup"),
    );
    expect(screen.getByText("Customer page")).toBeInTheDocument();
  });
});
