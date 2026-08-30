"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/api/services/notifications.service";
import type { RegisterDeviceRequest } from "@/dto/notifications/notification.dto";
import { notificationsKeys } from "@/api/query-keys/notifications.keys";

export function useNotificationMutations() {
  const queryClient = useQueryClient();
  const invalidateNotifications = () =>
    queryClient.invalidateQueries({
      queryKey: notificationsKeys.all,
    });

  const registerDevice = useMutation({
    mutationFn: (input: RegisterDeviceRequest) =>
      notificationService.registerNotificationDevice(input),
  });

  const removeDevice = useMutation({
    mutationFn: notificationService.removeNotificationDevice,
    onSuccess: invalidateNotifications,
  });

  const subscribeShipment = useMutation({
    mutationFn: notificationService.subscribeToShipment,
    onSuccess: invalidateNotifications,
  });

  const markRead = useMutation({
    mutationFn: notificationService.markNotificationRead,
    onSuccess: invalidateNotifications,
  });

  const markAllRead = useMutation({
    mutationFn: notificationService.markAllNotificationsRead,
    onSuccess: invalidateNotifications,
  });

  return {
    registerDevice,
    removeDevice,
    subscribeShipment,
    markRead,
    markAllRead,
  };
}
