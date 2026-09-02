"use client";

import { onMessage } from "firebase/messaging";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { notificationsKeys } from "@/api/query-keys/notifications.keys";
import { FCM_REGISTRATION_CHANGED_EVENT } from "../../constants";
import { useFcmNotification } from "../../hooks/use-fcm-notification";
import {
  getFirebaseMessaging,
} from "../../lib/firebase-client";
import { readNotificationDeviceId } from "../../lib/device-storage";
import { readFcmPayload } from "../../utils/fcm-payload";
import { showNotificationToast } from "../lib/notification-toast";

export function NotificationFcmBootstrap(): React.JSX.Element | null {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { refreshToken } = useFcmNotification();
  const refreshTokenRef = useRef(refreshToken);

  useEffect(() => {
    refreshTokenRef.current = refreshToken;
  }, [refreshToken]);

  useEffect(() => {
    let active = true;
    let unsubscribe: () => void = () => undefined;
    let messagingInitialized = false;

    const initializeForegroundMessaging = async (refreshTokenFirst = true) => {
      if (typeof window === "undefined") return;

      if (window.Notification?.permission !== "granted") return;

      if (refreshTokenFirst && readNotificationDeviceId()) {
        await refreshTokenRef.current();
      }

      const messaging = await getFirebaseMessaging();
      if (!active || !messaging || messagingInitialized) return;

      messagingInitialized = true;
      unsubscribe = onMessage(messaging, (message) => {
        const payload = readFcmPayload(message);
        if (!payload) return;

        showNotificationToast(payload, (path) => router.push(path));
        void queryClient.invalidateQueries({
          queryKey: notificationsKeys.all,
        });
      });
    };

    const handleRegistrationChanged = () => {
      void initializeForegroundMessaging(false);
    };

    window.addEventListener(
      FCM_REGISTRATION_CHANGED_EVENT,
      handleRegistrationChanged,
    );
    void initializeForegroundMessaging();

    return () => {
      active = false;
      window.removeEventListener(
        FCM_REGISTRATION_CHANGED_EVENT,
        handleRegistrationChanged,
      );
      unsubscribe();
    };
  }, [queryClient, router]);

  return null;
}
