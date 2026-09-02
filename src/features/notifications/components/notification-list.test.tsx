import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { NotificationRecord } from "@/dto/notifications/notification.dto";
import { NotificationList } from "./notification-list";

const notification: NotificationRecord = {
  id: "notification-1",
  eventType: "SHIPMENT_DELIVERED",
  channel: "FCM",
  title: "Shipment delivered",
  body: "Shipment SHP-001 was delivered.",
  isRead: false,
  createdAt: "2026-08-30T00:00:00Z",
  readAt: null,
  shipmentId: "shipment-1",
  shipmentNumber: "SHP-001",
  actionUrl: "/notifications",
};

describe("NotificationList", () => {
  it("marks an unread notification read and opens its action", async () => {
    const user = userEvent.setup();
    const onMarkRead = vi.fn();
    const onOpen = vi.fn();

    render(
      <NotificationList
        notifications={[notification]}
        onMarkRead={onMarkRead}
        onOpen={onOpen}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /open shipment delivered/i }),
    );

    expect(onMarkRead).toHaveBeenCalledWith("notification-1");
    expect(onOpen).toHaveBeenCalledWith("/notifications");
  });
});
