import { toast } from "sonner";
import { NOTIFICATION_TOAST_DURATION_MS } from "../constants";
import type {
  NotificationToastOpenHandler,
} from "../types";
import type { FcmPayload } from "../../types/fcm.types";
import { safeNotificationPath } from "../../utils/fcm-payload";

export function showNotificationToast(
  payload: FcmPayload,
  onOpen: NotificationToastOpenHandler,
): void {
  const safePath = safeNotificationPath(payload.actionUrl ?? undefined);

  toast(payload.title, {
    description: payload.body,
    duration: NOTIFICATION_TOAST_DURATION_MS,
    action: safePath
      ? {
          label: "Open",
          onClick: () => onOpen(safePath),
        }
      : undefined,
  });
}
