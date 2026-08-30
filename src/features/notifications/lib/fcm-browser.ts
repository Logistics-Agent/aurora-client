export function getBrowserNotificationApi(): typeof Notification | null {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null;
  }

  return window.Notification ?? null;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | null> {
  const notificationApi = getBrowserNotificationApi();
  if (!notificationApi) return null;
  if (notificationApi.permission !== "default") {
    return notificationApi.permission;
  }

  return notificationApi.requestPermission();
}
