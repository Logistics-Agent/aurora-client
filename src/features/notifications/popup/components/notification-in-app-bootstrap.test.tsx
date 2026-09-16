import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NotificationListResponse } from "@/dto/notifications/notification.dto";
import { NotificationInAppBootstrap } from "./notification-in-app-bootstrap";

const mocks = vi.hoisted(() => ({
  query: {
    data: undefined as NotificationListResponse | undefined,
    isPending: false,
    isError: false,
  },
  useNotificationsQuery: vi.fn(),
  showNotificationToast: vi.fn(),
}));

vi.mock("@/hooks/queries/notifications/use-notifications-query", () => ({
  useNotificationsQuery: (...args: unknown[]) => {
    mocks.useNotificationsQuery(...args);
    return mocks.query;
  },
}));

vi.mock("../lib/notification-toast", () => ({
  showNotificationToast: mocks.showNotificationToast,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const notification = {
  id: "notification-1",
  eventType: "SHIPMENT_DELIVERED",
  channel: "IN_APP",
  title: "Shipment delivered",
  body: "Shipment SHP-001 was delivered.",
  isRead: false,
  createdAt: "2026-09-16T10:00:00Z",
  readAt: null,
  shipmentId: "00000000-0000-0000-0000-000000000001",
  shipmentNumber: "SHP-001",
  actionUrl: "/shipments/00000000-0000-0000-0000-000000000001",
};

function response(notifications: (typeof notification)[]): NotificationListResponse {
  return {
    notifications,
    page: 1,
    pageSize: 20,
    totalItems: notifications.length,
    totalPages: notifications.length > 0 ? 1 : 0,
  };
}

describe("NotificationInAppBootstrap", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    mocks.query = { data: response([]), isPending: false, isError: false };
    window.localStorage.clear();
  });

  it("polls notifications without browser permission and toasts only newly received unread items", async () => {
    const view = render(<NotificationInAppBootstrap />);

    expect(mocks.useNotificationsQuery).toHaveBeenCalledWith(
      { page: 1, pageSize: 20, unreadOnly: false },
      { enabled: true, refetchInterval: 30_000, refetchOnWindowFocus: true },
    );
    expect(mocks.showNotificationToast).not.toHaveBeenCalled();

    mocks.query = {
      data: response([notification]),
      isPending: false,
      isError: false,
    };
    view.rerender(<NotificationInAppBootstrap />);

    await waitFor(() => expect(mocks.showNotificationToast).toHaveBeenCalledTimes(1));
    expect(mocks.showNotificationToast).toHaveBeenCalledWith(
      expect.objectContaining({
        notificationId: notification.id,
        title: notification.title,
        body: notification.body,
      }),
      expect.any(Function),
    );
  });

  it("disables polling toasts after browser push has been registered", () => {
    window.localStorage.setItem("aurora.notification.deviceId", "device-1");

    render(<NotificationInAppBootstrap />);

    expect(mocks.useNotificationsQuery).toHaveBeenCalledWith(
      { page: 1, pageSize: 20, unreadOnly: false },
      { enabled: false, refetchInterval: false, refetchOnWindowFocus: false },
    );
  });
});
