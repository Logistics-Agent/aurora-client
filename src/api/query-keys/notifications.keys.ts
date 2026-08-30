import type { NotificationListParams } from "@/dto/notifications/notification.dto";
import { rootQueryKeys } from "./root.keys";

export const notificationsKeys = {
  all: [...rootQueryKeys.all, "notifications"] as const,
  lists: () => [...notificationsKeys.all, "list"] as const,
  list: (params: NotificationListParams) =>
    [...notificationsKeys.lists(), params] as const,
  unreadCount: () => [...notificationsKeys.all, "unread-count"] as const,
} as const;
