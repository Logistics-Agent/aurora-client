import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getBrowserNotificationApi,
  requestNotificationPermission,
} from "./fcm-browser";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fcm browser helpers", () => {
  it("returns null when browser notifications are unavailable", () => {
    vi.stubGlobal("Notification", undefined);
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: undefined,
    });

    expect(getBrowserNotificationApi()).toBeNull();
  });

  it("keeps an existing browser permission", async () => {
    const notificationApi = {
      permission: "granted" as NotificationPermission,
      requestPermission: vi.fn(),
    };
    vi.stubGlobal("Notification", notificationApi);

    await expect(requestNotificationPermission()).resolves.toBe("granted");
    expect(notificationApi.requestPermission).not.toHaveBeenCalled();
  });

  it("requests permission when the browser has not decided yet", async () => {
    const notificationApi = {
      permission: "default" as NotificationPermission,
      requestPermission: vi.fn().mockResolvedValue("denied"),
    };
    vi.stubGlobal("Notification", notificationApi);

    await expect(requestNotificationPermission()).resolves.toBe("denied");
    expect(notificationApi.requestPermission).toHaveBeenCalledOnce();
  });
});
