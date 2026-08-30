import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotificationBell } from "./notification-bell";

vi.mock("@/hooks/queries/notifications/use-unread-notification-count-query", () => ({
  useUnreadNotificationCountQuery: () => ({ data: 3 }),
}));

vi.mock("@/hooks/queries/notifications/use-notifications-query", () => ({
  useNotificationsQuery: () => ({
    data: {
      notifications: [],
      page: 1,
      pageSize: 20,
      totalItems: 0,
      totalPages: 0,
    },
    isPending: false,
    isError: false,
    isSuccess: true,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/hooks/mutations/notifications/use-notification-mutations", () => ({
  useNotificationMutations: () => ({
    markRead: { mutateAsync: vi.fn(), isPending: false },
    markAllRead: { mutateAsync: vi.fn(), isPending: false },
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("NotificationBell", () => {
  afterEach(cleanup);

  it("renders the live unread count and notification trigger", () => {
    render(<NotificationBell />);

    expect(screen.getByLabelText(/notifications, 3 unread/i)).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("opens the notification panel only after the bell is clicked", async () => {
    const user = userEvent.setup();

    render(<NotificationBell />);

    expect(screen.queryByRole("dialog", { name: "Notifications" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /notifications/i }));

    expect(screen.getByRole("dialog", { name: "Notifications" })).toBeInTheDocument();
    expect(screen.getByText("No notifications yet!")).toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  });
});
