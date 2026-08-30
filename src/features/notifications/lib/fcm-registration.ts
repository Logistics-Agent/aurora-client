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

export type FcmRegistrationResult =
  | { status: "empty-token" }
  | { status: "registered"; device: DeviceResponse }
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

  const serviceWorkerRegistration = await registerFirebaseServiceWorker();
  const token = await getToken(messaging, {
    serviceWorkerRegistration,
    vapidKey,
  });

  if (!token) return { status: "empty-token" };

  const device = await registerDevice({
    token,
    platform: "Web",
    appVersion,
  });

  return { status: "registered", device };
}
