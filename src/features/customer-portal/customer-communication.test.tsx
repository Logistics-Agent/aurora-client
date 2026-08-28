import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { customerNotificationMocks, customerPreferenceMocks } from "./mock";
import { useCustomerPortalStore } from "./stores/use-customer-portal-store";
import { AssistantPage } from "./assistant";
import { NotificationsPage } from "./notifications";

describe("customer communication workspaces", () => {
  beforeEach(() => {
    useCustomerPortalStore.setState({
      questionAsked: false,
      notifications: customerNotificationMocks,
      preferences: customerPreferenceMocks,
    });
  });

  it("answers a scoped fixture question with explainability context", () => {
    render(<AssistantPage />);

    fireEvent.click(screen.getByRole("button", { name: /ask assistant/i }));

    expect(screen.getByLabelText("AI insight")).toBeInTheDocument();
    expect(screen.getByText(/89% confidence/i)).toBeInTheDocument();
    expect(
      screen.getByText(/AI does not change shipment or commercial data/i),
    ).toBeInTheDocument();
  });

  it("marks a notification read and updates email preferences locally", () => {
    render(<NotificationsPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /mark SHP-128 ETA updated as read/i }),
    );
    expect(
      screen.queryByRole("button", {
        name: /mark SHP-128 ETA updated as read/i,
      }),
    ).not.toBeInTheDocument();

    const emailSwitch = screen.getByRole("switch", {
      name: /email notifications for document updates/i,
    });
    expect(emailSwitch).toHaveAttribute("data-state", "unchecked");
    fireEvent.click(emailSwitch);
    expect(emailSwitch).toHaveAttribute("data-state", "checked");
  });
});
