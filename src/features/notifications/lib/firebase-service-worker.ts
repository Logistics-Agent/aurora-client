export const FIREBASE_COMPAT_VERSION = "12.18.0";

const INTERNAL_NOTIFICATION_PATH_PATTERN = String.raw`^\/(?:notifications(?:[\/?#].*)?|shipments\/[0-9a-fA-F-]{36}(?:[\/?#].*)?)$`;

export type FirebaseServiceWorkerConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export function createNoopServiceWorkerScript(): string {
  return "self.addEventListener('install', function() { self.skipWaiting(); });";
}

export function createFirebaseServiceWorkerScript(
  config: FirebaseServiceWorkerConfig,
): string {
  const firebaseConfig = JSON.stringify(config);
  const pathPattern = JSON.stringify(INTERNAL_NOTIFICATION_PATH_PATTERN);

  return `self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const notificationData = event.notification.data || {};
  const fcmMessage = notificationData.FCM_MSG || {};
  const rawActionUrl = notificationData.actionUrl ||
    fcmMessage.data && fcmMessage.data.actionUrl ||
    fcmMessage.fcmOptions && fcmMessage.fcmOptions.link;
  const pattern = new RegExp(${pathPattern});
  let safePath = '/notifications';
  if (typeof rawActionUrl === 'string') {
    try {
      const candidate = new URL(rawActionUrl, self.location.origin);
      const path = candidate.pathname + candidate.search + candidate.hash;
      if (candidate.origin === self.location.origin && pattern.test(path)) safePath = path;
    } catch (_) {}
  }
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
    for (const client of clientList) {
      if (client.url.startsWith(self.location.origin) && 'focus' in client) {
        client.navigate(safePath);
        return client.focus();
      }
    }
    return self.clients.openWindow(safePath);
  }));
});
importScripts("https://www.gstatic.com/firebasejs/${FIREBASE_COMPAT_VERSION}/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/${FIREBASE_COMPAT_VERSION}/firebase-messaging-compat.js");
firebase.initializeApp(${firebaseConfig});
const messaging = firebase.messaging();
messaging.onBackgroundMessage(function(payload) {
  if (payload.notification) return;
  const data = payload.data || {};
  const title = data.title || "Aurora notification";
  const body = data.body || "You have a new notification.";
  self.registration.showNotification(title, {
    body: body,
    data: { actionUrl: data.actionUrl || null },
  });
});`;
}
