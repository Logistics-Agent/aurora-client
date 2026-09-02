"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/api/services/notifications.service";
import { notificationsKeys } from "@/api/query-keys/notifications.keys";

export function useUnreadNotificationCountQuery(options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: notificationsKeys.unreadCount(),
    queryFn: notificationService.getUnreadNotificationCount,
    enabled: options?.enabled ?? true,
  });
}
