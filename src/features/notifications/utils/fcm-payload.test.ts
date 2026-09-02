import { describe, expect, it } from "vitest";
import type { MessagePayload } from "firebase/messaging";
import { readFcmPayload, safeNotificationPath } from "./fcm-payload";

describe("safeNotificationPath", () => {
  it("accepts internal notification and shipment routes", () => {
    expect(safeNotificationPath("/notifications")).toBe("/notifications");
    expect(
      safeNotificationPath(
        "/shipments/00000000-0000-0000-0000-000000000001",
      ),
    ).toBe("/shipments/00000000-0000-0000-0000-000000000001");
  });

  it("rejects external and malformed action URLs", () => {
    expect(safeNotificationPath("https://evil.example")).toBeNull();
    expect(safeNotificationPath("//evil.example")).toBeNull();
    expect(safeNotificationPath("/shipments/not-a-guid")).toBeNull();
    expect(safeNotificationPath("/admin/users")).toBeNull();
    expect(safeNotificationPath("/notifications\\evil")).toBeNull();
  });
});

describe("readFcmPayload", () => {
  it("reads the Notification FCM data contract", () => {
    const payload = {
      data: {
        notificationId: "notification-1",
        type: "SHIPMENT_DELIVERED",
        shipmentId: "00000000-0000-0000-0000-000000000001",
        actionUrl: "/shipments/00000000-0000-0000-0000-000000000001",
      },
      notification: {
        title: "Shipment delivered",
        body: "Shipment SHP-001 was delivered.",
      },
      from: "sender",
      collapseKey: "collapse-key",
      messageId: "message-1",
    };

    expect(readFcmPayload(payload as unknown as MessagePayload)).toEqual({
      notificationId: "notification-1",
      type: "SHIPMENT_DELIVERED",
      shipmentId: "00000000-0000-0000-0000-000000000001",
      actionUrl: "/shipments/00000000-0000-0000-0000-000000000001",
      title: "Shipment delivered",
      body: "Shipment SHP-001 was delivered.",
    });
  });

  it("rejects payloads without the required identifiers", () => {
    expect(
      readFcmPayload({
        data: { type: "SHIPMENT_DELIVERED" },
      } as unknown as MessagePayload),
    ).toBeNull();
  });
});
