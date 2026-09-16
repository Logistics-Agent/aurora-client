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
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
    refetchOnWindowFocus?: boolean;
  },
) {
  const normalizedParams = normalizeNotificationListParams(params);

  return useQuery({
    queryKey: notificationsKeys.list(normalizedParams),
    queryFn: () => notificationService.getNotifications(normalizedParams),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
  });
}

export { DEFAULT_NOTIFICATION_LIST_PARAMS };
