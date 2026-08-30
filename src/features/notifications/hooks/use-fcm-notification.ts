"use client";

import { useCallback, useState } from "react";
import { env } from "@/configs";
import { toApiError } from "@/lib/api-error";
import { useNotificationMutations } from "@/hooks/mutations/notifications/use-notification-mutations";
import { getBrowserNotificationApi, requestNotificationPermission } from "../lib/fcm-browser";
import { registerFcmDevice } from "../lib/fcm-registration";
import {
  clearNotificationDeviceId,
  readNotificationDeviceId,
  writeNotificationDeviceId,
} from "../lib/device-storage";
import { FCM_REGISTRATION_CHANGED_EVENT } from "../constants";
import type { FcmRegistrationState } from "../types/fcm.types";

export type UseFcmNotificationResult = {
  state: FcmRegistrationState;
  errorMessage: string | null;
  deviceId: string | null;
  enable: () => Promise<void>;
  refreshToken: () => Promise<void>;
  disable: () => Promise<boolean>;
};

let inFlightRegistration: Promise<void> | null = null;

function safeErrorMessage(error: unknown): string {
  const apiError = toApiError(error);
  if (apiError.status === 409) {
    return "This browser device is already registered to another account.";
  }

  return "Unable to register browser notifications. Please try again.";
}

export function useFcmNotification(): UseFcmNotificationResult {
  const { registerDevice, removeDevice } = useNotificationMutations();
  const [state, setState] = useState<FcmRegistrationState>(
    env.firebase.enabled ? "idle" : "disabled",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredDevice, setRegisteredDevice] = useState<string | null>(null);
  const storedDeviceId = readNotificationDeviceId();
  const deviceId = registeredDevice ?? storedDeviceId;

  const registerCurrentToken = useCallback(async () => {
    if (!env.firebase.enabled) {
      setState("disabled");
      return;
    }

    const notificationApi = getBrowserNotificationApi();
    if (!notificationApi) {
      setState("unsupported");
      return;
    }

    if (notificationApi.permission !== "granted") {
      setState("idle");
      return;
    }

    setState("registering");
    setErrorMessage(null);

    try {
      const registration = await registerFcmDevice({
        appVersion: env.NEXT_PUBLIC_APP_NAME,
        registerDevice: registerDevice.mutateAsync,
        vapidKey: env.firebase.vapidKey,
      });

      if (registration.status === "unsupported") {
        setState("unsupported");
        return;
      }

      if (registration.status === "empty-token") {
        setState("error");
        setErrorMessage("Firebase did not return a browser token.");
        return;
      }

      const device = registration.device;

      writeNotificationDeviceId(device.id);
      setRegisteredDevice(device.id);
      setState("enabled");
      window.dispatchEvent(new Event(FCM_REGISTRATION_CHANGED_EVENT));
    } catch (error) {
      setState("error");
      setErrorMessage(safeErrorMessage(error));
    }
  }, [registerDevice]);

  const refreshToken = useCallback(async () => {
    if (inFlightRegistration) return inFlightRegistration;

    inFlightRegistration = registerCurrentToken();
    try {
      await inFlightRegistration;
    } finally {
      inFlightRegistration = null;
    }
  }, [registerCurrentToken]);

  const enable = useCallback(async () => {
    if (!env.firebase.enabled) {
      setState("disabled");
      return;
    }

    if (!getBrowserNotificationApi()) {
      setState("unsupported");
      return;
    }

    setState("requesting");
    setErrorMessage(null);

    const permission = await requestNotificationPermission();

    if (permission !== "granted") {
      setState("denied");
      return;
    }

    await refreshToken();
  }, [refreshToken]);

  const disable = useCallback(async () => {
    const storedDeviceId = deviceId ?? readNotificationDeviceId();
    if (!storedDeviceId) {
      clearNotificationDeviceId();
      setRegisteredDevice(null);
      setState(env.firebase.enabled ? "idle" : "disabled");
      return true;
    }

    try {
      await removeDevice.mutateAsync(storedDeviceId);
      clearNotificationDeviceId();
      setRegisteredDevice(null);
      setState("idle");
      setErrorMessage(null);
      return true;
    } catch (error) {
      if (toApiError(error).status === 404) {
        clearNotificationDeviceId();
        setRegisteredDevice(null);
        setState("idle");
        return true;
      }

      setState("error");
      setErrorMessage("Unable to disable browser notifications.");
      return false;
    }
  }, [deviceId, removeDevice]);

  return {
    state,
    errorMessage,
    deviceId,
    enable,
    refreshToken,
    disable,
  };
}
