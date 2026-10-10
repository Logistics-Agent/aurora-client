"use client";

import { NotificationFcmBootstrap } from "./components/notification-fcm-bootstrap";
import { NotificationInAppBootstrap } from "./components/notification-in-app-bootstrap";

export function NotificationPopup() {
  return (
    <>
      <NotificationFcmBootstrap />
      <NotificationInAppBootstrap />
    </>
  );
}
