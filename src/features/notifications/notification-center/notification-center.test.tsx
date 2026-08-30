import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotificationCenterPage } from "./index";

const mocks = vi.hoisted(() => ({
  notifications: {
    data: {
      notifications: [
        {
          id: "notification-1",
          eventType: "SHIPMENT_DELIVERED",
          channel: "IN_APP",
          title: "Shipment delivered",
          body: "Shipment SHP-001 was delivered.",
          isRead: false,
          createdAt: "2026-08-30T10:00:00Z",
          readAt: null,
          shipmentId: "00000000-0000-0000-0000-000000000001",
          shipmentNumber: "SHP-001",
          actionUrl: "/shipments/00000000-0000-0000-0000-000000000001",
        },
      ],
      page: 1,
      pageSize: 20,
      totalItems: 1,
      totalPages: 1,
    },
    isPending: false,
    isError: false,
    isSuccess: true,
    refetch: vi.fn(),
  },
  markRead: { mutateAsync: vi.fn() },
  markAllRead: { mutateAsync: vi.fn(), isPending: false },
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/hooks/queries/notifications/use-notifications-query", () => ({
  useNotificationsQuery: () => mocks.notifications,
}));

vi.mock("@/hooks/mutations/notifications/use-notification-mutations", () => ({
  useNotificationMutations: () => ({
    markRead: mocks.markRead,
    markAllRead: mocks.markAllRead,
  }),
}));

vi.mock("../components/fcm-permission-control", () => ({
  FcmPermissionControl: () => <div>FCM permission control</div>,
}));

describe("NotificationCenterPage", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    mocks.markRead.mutateAsync.mockReset();
    mocks.markAllRead.mutateAsync.mockReset();
    mocks.push.mockReset();
  });

  it("renders live notifications and uses safe internal navigation", async () => {
    const user = userEvent.setup();

    render(<NotificationCenterPage />);

    expect(screen.getByText("Shipment delivered")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open Shipment delivered" }));

    expect(mocks.markRead.mutateAsync).toHaveBeenCalledWith("notification-1");
    expect(mocks.push).toHaveBeenCalledWith(
      "/shipments/00000000-0000-0000-0000-000000000001",
    );
  });

  it("renders notification data without an Auth dependency", () => {
    render(<NotificationCenterPage />);

    expect(screen.getByText("Shipment delivered")).toBeInTheDocument();
  });
});
