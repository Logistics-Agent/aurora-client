import { describe, expect, it, vi } from "vitest";
import type { FcmPayload } from "../../types/fcm.types";
import {
  NOTIFICATION_TOAST_DURATION_MS,
  NOTIFICATIONS_ROUTE,
} from "../constants";
import { showNotificationToast } from "./notification-toast";

const mockToast = vi.hoisted(() => vi.fn());
vi.mock("sonner", () => ({ toast: mockToast }));

const payload: FcmPayload = {
  notificationId: "notification-1",
  type: "SHIPMENT_DELIVERED",
  shipmentId: "00000000-0000-0000-0000-000000000001",
  actionUrl: "/shipments/00000000-0000-0000-0000-000000000001",
  title: "Shipment delivered",
  body: "Shipment SHP-001 was delivered.",
};

describe("showNotificationToast", () => {
  it("shows title/body and opens only the validated internal action path", () => {
    const onOpen = vi.fn();

    showNotificationToast(payload, onOpen);

    expect(mockToast).toHaveBeenCalledWith(
      "Shipment delivered",
      expect.objectContaining({
        description: "Shipment SHP-001 was delivered.",
        duration: NOTIFICATION_TOAST_DURATION_MS,
        action: expect.objectContaining({ label: "Open" }),
      }),
    );

    const options = mockToast.mock.calls[0][1];
    options.action.onClick();
    expect(onOpen).toHaveBeenCalledWith(payload.actionUrl);
  });

  it("does not offer navigation for an unsafe action path", () => {
    mockToast.mockClear();

    showNotificationToast(
      { ...payload, actionUrl: "https://evil.example" },
      vi.fn(),
    );

    expect(mockToast.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        action: undefined,
      }),
    );
    expect(NOTIFICATIONS_ROUTE).toBe("/notifications");
  });
});
