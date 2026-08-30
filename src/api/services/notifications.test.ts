import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import { notificationService } from "./notifications.service";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("notification API service", () => {
  it("lists notifications with normalized BFF query parameters", async () => {
    const get = vi.spyOn(api, "get").mockResolvedValue({
      notifications: [
        {
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
          actionUrl: "/shipments/00000000-0000-0000-0000-000000000001",
        },
      ],
      page: 1,
      pageSize: 20,
      totalItems: 1,
      totalPages: 1,
    } as never);

    const result = await notificationService.getNotifications({});

    expect(get).toHaveBeenCalledWith("api/v1/notifications", {
      params: { page: 1, pageSize: 20, unreadOnly: false },
    });
    expect(result.notifications[0].isRead).toBe(false);
  });

  it("returns the unread count from the BFF response", async () => {
    vi.spyOn(api, "get").mockResolvedValue({
      count: 3,
    } as never);

    await expect(notificationService.getUnreadNotificationCount()).resolves.toBe(
      3,
    );
  });

  it("normalizes protobuf timestamp objects returned by the BFF", async () => {
    vi.spyOn(api, "get").mockResolvedValue({
      notifications: [
        {
          id: "notification-1",
          eventType: "SHIPMENT_CREATED",
          channel: "IN_APP",
          title: "Shipment created",
          body: "Shipment SHP-001 was created.",
          isRead: true,
          createdAt: { seconds: "0", nanos: 0 },
          readAt: { seconds: "1", nanos: 500000000 },
          shipmentId: "",
          shipmentNumber: "",
          actionUrl: "",
        },
      ],
      page: 1,
      pageSize: 20,
      totalItems: 1,
      totalPages: 1,
    } as never);

    const result = await notificationService.getNotifications();

    expect(result.notifications[0].createdAt).toBe(
      "1970-01-01T00:00:00.000Z",
    );
    expect(result.notifications[0].readAt).toBe(
      "1970-01-01T00:00:01.500Z",
    );
    expect(result.notifications[0].shipmentId).toBeNull();
  });

  it("registers a Web device without tenant or user fields", async () => {
    const post = vi.spyOn(api, "post").mockResolvedValue({
      id: "device-1", platform: "Web", isActive: true,
    } as never);

    await notificationService.registerNotificationDevice({
      token: "browser-token",
      platform: "Web",
      appVersion: "local",
    });

    expect(post).toHaveBeenCalledWith("api/v1/notifications/devices", {
      token: "browser-token",
      platform: "Web",
      appVersion: "local",
    });
    expect(post.mock.calls[0][1]).not.toHaveProperty("tenantId");
    expect(post.mock.calls[0][1]).not.toHaveProperty("userId");
  });

  it("encodes the shipment id when subscribing", async () => {
    const post = vi.spyOn(api, "post").mockResolvedValue(undefined as never);
    const shipmentId = "shipment/with spaces";

    await notificationService.subscribeToShipment(shipmentId);

    expect(post).toHaveBeenCalledWith(
      "api/v1/notifications/subscriptions/shipments/shipment%2Fwith%20spaces",
    );
  });
});
