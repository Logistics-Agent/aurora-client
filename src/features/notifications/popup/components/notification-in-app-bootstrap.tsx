"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotificationsQuery } from "@/hooks/queries/notifications/use-notifications-query";
import type { NotificationRecord } from "@/dto/notifications/notification.dto";
import { FCM_REGISTRATION_CHANGED_EVENT } from "../../constants";
import { readNotificationDeviceId } from "../../lib/device-storage";
import { showNotificationToast } from "../lib/notification-toast";

const IN_APP_NOTIFICATION_POLL_INTERVAL_MS = 30_000;

function toToastPayload(notification: NotificationRecord) {
  return {
    notificationId: notification.id,
    type: notification.eventType,
    shipmentId: notification.shipmentId,
    actionUrl: notification.actionUrl,
    title: notification.title,
    body: notification.body,
  };
}

export function NotificationInAppBootstrap(): React.JSX.Element | null {
  const router = useRouter();
  const [hasPushDevice, setHasPushDevice] = useState(() => readNotificationDeviceId() !== null);
  const knownNotificationIds = useRef<Set<string> | null>(null);
  const notificationsQuery = useNotificationsQuery(
    { page: 1, pageSize: 20, unreadOnly: false },
    {
      enabled: !hasPushDevice,
      refetchInterval: hasPushDevice ? false : IN_APP_NOTIFICATION_POLL_INTERVAL_MS,
      refetchOnWindowFocus: !hasPushDevice,
    },
  );

  useEffect(() => {
    const refreshPushDeviceState = () => {
      setHasPushDevice(readNotificationDeviceId() !== null);
    };

    window.addEventListener(FCM_REGISTRATION_CHANGED_EVENT, refreshPushDeviceState);

    return () => {
      window.removeEventListener(FCM_REGISTRATION_CHANGED_EVENT, refreshPushDeviceState);
    };
  }, []);

  useEffect(() => {
    const notifications = notificationsQuery.data?.notifications;
    if (!notifications) return;

    const currentNotificationIds = new Set(notifications.map((notification) => notification.id));
    const previousNotificationIds = knownNotificationIds.current;

    if (previousNotificationIds) {
      notifications
        .filter(
          (notification) => !notification.isRead && !previousNotificationIds.has(notification.id),
        )
        .forEach((notification) => {
          showNotificationToast(toToastPayload(notification), (path) => router.push(path));
        });
    }

    knownNotificationIds.current = currentNotificationIds;
  }, [notificationsQuery.data, router]);

  return null;
}
