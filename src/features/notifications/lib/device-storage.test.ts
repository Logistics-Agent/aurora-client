import { beforeEach, describe, expect, it } from "vitest";
import {
  clearNotificationDeviceId,
  readNotificationDeviceId,
  writeNotificationDeviceId,
} from "./device-storage";

describe("notification device storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("stores and reads only the BFF device id", () => {
    writeNotificationDeviceId("device-1");

    expect(readNotificationDeviceId()).toBe("device-1");
  });

  it("clears malformed or missing values", () => {
    window.localStorage.setItem("aurora.notification.deviceId", " ");
    expect(readNotificationDeviceId()).toBeNull();
    expect(
      window.localStorage.getItem("aurora.notification.deviceId"),
    ).toBeNull();
  });

  it("clears the device id explicitly", () => {
    writeNotificationDeviceId("device-1");
    clearNotificationDeviceId();

    expect(readNotificationDeviceId()).toBeNull();
  });

  it("does not store an authenticated user owner", () => {
    writeNotificationDeviceId("device-1");

    expect(window.localStorage.getItem("aurora.notification.deviceOwner")).toBeNull();
  });
});
