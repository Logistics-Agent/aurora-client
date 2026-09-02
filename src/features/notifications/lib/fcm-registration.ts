import { getToken } from "firebase/messaging";
import type { DeviceResponse, RegisterDeviceRequest } from "@/dto/notifications/notification.dto";
import {
  getFirebaseMessaging,
  isFcmSupported,
  registerFirebaseServiceWorker,
} from "./firebase-client";

type RegisterDevice = (
  input: RegisterDeviceRequest,
) => Promise<DeviceResponse>;

const FCM_TOKEN_REQUEST_TIMEOUT_MS = 15_000;

class FcmTokenRequestTimeoutError extends Error {
  constructor() {
    super("Firebase token request timed out.");
    this.name = "FcmTokenRequestTimeoutError";
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new FcmTokenRequestTimeoutError());
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

export type FcmRegistrationResult =
  | { status: "empty-token" }
  | { status: "firebase-error"; error: unknown }
  | { status: "registered"; device: DeviceResponse }
  | { status: "registration-failed"; token: string; error: unknown }
  | { status: "timeout" }
  | { status: "unsupported" };

export async function registerFcmDevice({
  appVersion,
  registerDevice,
  vapidKey,
}: {
  appVersion: string;
  registerDevice: RegisterDevice;
  vapidKey: string;
}): Promise<FcmRegistrationResult> {
  if (!(await isFcmSupported())) return { status: "unsupported" };

  const messaging = await getFirebaseMessaging();
  if (!messaging) return { status: "unsupported" };

  let serviceWorkerRegistration: ServiceWorkerRegistration;
  try {
    serviceWorkerRegistration = await registerFirebaseServiceWorker();
  } catch (error) {
    return { status: "firebase-error", error };
  }
  let token: string;

  try {
    token = await withTimeout(
      getToken(messaging, {
        serviceWorkerRegistration,
        vapidKey,
      }),
      FCM_TOKEN_REQUEST_TIMEOUT_MS,
    );
  } catch (error) {
    if (error instanceof FcmTokenRequestTimeoutError) {
      return { status: "timeout" };
    }

    return { status: "firebase-error", error };
  }

  if (!token) return { status: "empty-token" };

  let device: DeviceResponse;
  try {
    device = await registerDevice({
      token,
      platform: "Web",
      appVersion,
    });
  } catch (error) {
    return { status: "registration-failed", token, error };
  }

  return { status: "registered", device };
}
