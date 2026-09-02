import type { MessagePayload } from "firebase/messaging";
import type { FcmPayload } from "../types/fcm.types";

const internalPathPattern =
  /^\/(?:notifications(?:[/?#].*)?|shipments\/[0-9a-fA-F-]{36}(?:[/?#].*)?)$/;

export function safeNotificationPath(
  value: string | undefined,
): string | null {
  if (!value || !internalPathPattern.test(value)) return null;
  return value;
}

export function readFcmPayload(payload: MessagePayload): FcmPayload | null {
  const data = payload.data ?? {};
  const notificationId = data.notificationId?.trim();
  const type = data.type?.trim();

  if (!notificationId || !type) return null;

  return {
    notificationId,
    type,
    shipmentId: data.shipmentId?.trim() || null,
    actionUrl: safeNotificationPath(data.actionUrl),
    title: payload.notification?.title?.trim() || "Aurora notification",
    body:
      payload.notification?.body?.trim() ||
      "You have a new notification.",
  };
}
