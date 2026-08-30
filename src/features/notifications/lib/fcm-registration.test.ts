import { describe, expect, it, vi } from "vitest";
import { registerFcmDevice } from "./fcm-registration";

const mockGetFirebaseMessaging = vi.fn();
const mockIsFcmSupported = vi.fn();
const mockRegisterFirebaseServiceWorker = vi.fn();
const mockGetToken = vi.fn();

vi.mock("./firebase-client", () => ({
  getFirebaseMessaging: () => mockGetFirebaseMessaging(),
  isFcmSupported: () => mockIsFcmSupported(),
  registerFirebaseServiceWorker: () => mockRegisterFirebaseServiceWorker(),
}));

vi.mock("firebase/messaging", () => ({
  getToken: (...args: unknown[]) => mockGetToken(...args),
}));

describe("registerFcmDevice", () => {
  it("returns unsupported without requesting a token", async () => {
    mockIsFcmSupported.mockResolvedValue(false);
    const registerDevice = vi.fn();

    await expect(
      registerFcmDevice({
        appVersion: "Aurora Web",
        registerDevice,
        vapidKey: "public-vapid-key",
      }),
    ).resolves.toEqual({ status: "unsupported" });
    expect(mockGetToken).not.toHaveBeenCalled();
    expect(registerDevice).not.toHaveBeenCalled();
  });

  it("gets a token and registers the browser device", async () => {
    const messaging = { name: "messaging" };
    const serviceWorkerRegistration = { scope: "/" };
    const device = { id: "device-1", platform: "Web", isActive: true };
    const registerDevice = vi.fn().mockResolvedValue(device);
    mockIsFcmSupported.mockResolvedValue(true);
    mockGetFirebaseMessaging.mockResolvedValue(messaging);
    mockRegisterFirebaseServiceWorker.mockResolvedValue(
      serviceWorkerRegistration,
    );
    mockGetToken.mockResolvedValue("browser-token");

    await expect(
      registerFcmDevice({
        appVersion: "Aurora Web",
        registerDevice,
        vapidKey: "public-vapid-key",
      }),
    ).resolves.toEqual({ status: "registered", device });

    expect(mockGetToken).toHaveBeenCalledWith(messaging, {
      serviceWorkerRegistration,
      vapidKey: "public-vapid-key",
    });
    expect(registerDevice).toHaveBeenCalledWith({
      token: "browser-token",
      platform: "Web",
      appVersion: "Aurora Web",
    });
  });

  it("returns an empty-token result without registering a device", async () => {
    mockIsFcmSupported.mockResolvedValue(true);
    mockGetFirebaseMessaging.mockResolvedValue({ name: "messaging" });
    mockRegisterFirebaseServiceWorker.mockResolvedValue({ scope: "/" });
    mockGetToken.mockResolvedValue("");
    const registerDevice = vi.fn();

    await expect(
      registerFcmDevice({
        appVersion: "Aurora Web",
        registerDevice,
        vapidKey: "public-vapid-key",
      }),
    ).resolves.toEqual({ status: "empty-token" });
    expect(registerDevice).not.toHaveBeenCalled();
  });
});
