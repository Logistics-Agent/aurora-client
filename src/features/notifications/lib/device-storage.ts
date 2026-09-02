const DEVICE_ID_KEY = "aurora.notification.deviceId";

export function readNotificationDeviceId(): string | null {
  if (typeof window === "undefined") return null;

  const deviceId = window.localStorage.getItem(DEVICE_ID_KEY)?.trim();

  if (!deviceId) {
    window.localStorage.removeItem(DEVICE_ID_KEY);
    return null;
  }

  return deviceId;
}

export function writeNotificationDeviceId(deviceId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEVICE_ID_KEY, deviceId);
}

export function clearNotificationDeviceId(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DEVICE_ID_KEY);
}
