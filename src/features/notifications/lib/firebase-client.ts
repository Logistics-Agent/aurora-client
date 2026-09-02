import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getMessaging,
  isSupported as firebaseMessagingIsSupported,
  type Messaging,
} from "firebase/messaging";
import { env } from "@/configs";

let firebaseApp: FirebaseApp | undefined;
let messaging: Messaging | null | undefined;

function getOrCreateFirebaseApp(): FirebaseApp {
  if (firebaseApp) return firebaseApp;

  firebaseApp = getApps().length
    ? getApp()
    : initializeApp({
        apiKey: env.firebase.apiKey,
        authDomain: env.firebase.authDomain,
        projectId: env.firebase.projectId,
        storageBucket: env.firebase.storageBucket,
        messagingSenderId: env.firebase.messagingSenderId,
        appId: env.firebase.appId,
      });

  return firebaseApp;
}

export async function isFcmSupported(): Promise<boolean> {
  if (
    typeof window === "undefined" ||
    !env.firebase.enabled ||
    !("serviceWorker" in navigator)
  ) {
    return false;
  }

  try {
    return await firebaseMessagingIsSupported();
  } catch {
    return false;
  }
}

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (!(await isFcmSupported())) return null;
  if (messaging !== undefined) return messaging;

  try {
    messaging = getMessaging(getOrCreateFirebaseApp());
  } catch {
    messaging = null;
  }

  return messaging;
}

export async function registerFirebaseServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (
    typeof navigator === "undefined" ||
    !("serviceWorker" in navigator)
  ) {
    throw new Error("Service workers are not supported.");
  }

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
    { scope: "/" },
  );
  return navigator.serviceWorker.ready.then(() => registration);
}
