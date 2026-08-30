"use client";

import { useQuery } from "@tanstack/react-query";
import {
  DEFAULT_NOTIFICATION_LIST_PARAMS,
  normalizeNotificationListParams,
  notificationService,
} from "@/api/services/notifications.service";
import type { NotificationListParams } from "@/dto/notifications/notification.dto";
import { notificationsKeys } from "@/api/query-keys/notifications.keys";

export function useNotificationsQuery(
  params: NotificationListParams = {},
  options?: { enabled?: boolean },
) {
  const normalizedParams = normalizeNotificationListParams(params);

  return useQuery({
    queryKey: notificationsKeys.list(normalizedParams),
    queryFn: () => notificationService.getNotifications(normalizedParams),
    enabled: options?.enabled ?? true,
  });
}

export { DEFAULT_NOTIFICATION_LIST_PARAMS };
