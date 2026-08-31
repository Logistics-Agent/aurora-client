import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFcmNotification } from "./use-fcm-notification";

const mockGetFirebaseMessaging = vi.fn();
const mockIsFcmSupported = vi.fn();
const mockRegisterFirebaseServiceWorker = vi.fn();
const mockGetToken = vi.fn();
const mockRegisterDevice = vi.fn();

vi.mock("@/configs", () => ({
  env: {
    NEXT_PUBLIC_APP_NAME: "Aurora Web",
    firebase: {
      enabled: true,
      apiKey: "public-api-key",
      authDomain: "aurora.firebaseapp.com",
      projectId: "aurora",
      storageBucket: "aurora.firebasestorage.app",
      messagingSenderId: "123456",
      appId: "app-id",
      vapidKey: "public-vapid-key",
    },
  },
}));

vi.mock("../lib/firebase-client", () => ({
  getFirebaseMessaging: () => mockGetFirebaseMessaging(),
  isFcmSupported: () => mockIsFcmSupported(),
  registerFirebaseServiceWorker: () =>
    mockRegisterFirebaseServiceWorker(),
}));

vi.mock("firebase/messaging", () => ({
  getToken: (...args: unknown[]) => mockGetToken(...args),
}));

vi.mock("@/hooks/mutations/notifications/use-notification-mutations", () => ({
  useNotificationMutations: () => ({
    registerDevice: { mutateAsync: mockRegisterDevice },
    removeDevice: { mutateAsync: vi.fn() },
  }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

describe("useFcmNotification", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    const notificationApi = {
      permission: "default" as NotificationPermission,
      requestPermission: vi.fn(async () => {
        notificationApi.permission = "granted";
        return "granted" as NotificationPermission;
      }),
    };
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: notificationApi,
    });
    Object.defineProperty(globalThis, "Notification", {
      configurable: true,
      value: notificationApi,
    });
    mockIsFcmSupported.mockResolvedValue(true);
    mockGetFirebaseMessaging.mockResolvedValue({ app: "messaging" });
    mockRegisterFirebaseServiceWorker.mockResolvedValue({
      scope: "/",
    });
    mockGetToken.mockResolvedValue("browser-token");
    mockRegisterDevice.mockResolvedValue({
      id: "device-1",
      platform: "Web",
      isActive: true,
    });
  });

  it("requests permission and registers the browser token", async () => {
    const { result } = renderHook(() => useFcmNotification(), { wrapper });

    await act(async () => {
      await result.current.enable();
    });

    await waitFor(() => expect(result.current.state).toBe("enabled"));
    expect(mockGetToken).toHaveBeenCalledWith(
      { app: "messaging" },
      expect.objectContaining({ vapidKey: "public-vapid-key" }),
    );
    expect(mockRegisterDevice).toHaveBeenCalledWith({
      token: "browser-token",
      platform: "Web",
      appVersion: expect.any(String),
    });
    expect(result.current.deviceId).toBe("device-1");
  });

  it("does not request a token when browser permission is denied", async () => {
    const notificationApi = {
      permission: "default",
      requestPermission: vi.fn().mockResolvedValue("denied"),
    };
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: notificationApi,
    });
    Object.defineProperty(globalThis, "Notification", {
      configurable: true,
      value: notificationApi,
    });
    const { result } = renderHook(() => useFcmNotification(), { wrapper });

    await act(async () => {
      await result.current.enable();
    });

    expect(result.current.state).toBe("denied");
    expect(mockGetToken).not.toHaveBeenCalled();
    expect(mockRegisterDevice).not.toHaveBeenCalled();
  });

  it("does not register an empty Firebase token", async () => {
    mockGetToken.mockResolvedValue("");
    const { result } = renderHook(() => useFcmNotification(), { wrapper });

    await act(async () => {
      await result.current.enable();
    });

    expect(result.current.state).toBe("error");
    expect(mockRegisterDevice).not.toHaveBeenCalled();
    expect(result.current.errorMessage).toBe(
      "Firebase did not return a browser token.",
    );
  });

  it("reports the Firebase reason when token creation fails", async () => {
    mockGetToken.mockRejectedValue(new Error("messaging/invalid-vapid-key"));
    const { result } = renderHook(() => useFcmNotification(), { wrapper });

    await act(async () => {
      await result.current.enable();
    });

    expect(result.current.state).toBe("error");
    expect(result.current.fcmToken).toBeNull();
    expect(result.current.errorMessage).toBe(
      "Firebase could not create a browser token: messaging/invalid-vapid-key",
    );
  });

  it("exposes the Firebase token when backend registration fails", async () => {
    const registrationError = new Error("Unauthorized");
    mockRegisterDevice.mockRejectedValue(registrationError);
    const { result } = renderHook(() => useFcmNotification(), { wrapper });

    await act(async () => {
      await result.current.enable();
    });

    expect(result.current.state).toBe("error");
    expect(result.current.fcmToken).toBe("browser-token");
    expect(result.current.errorMessage).toBe(
      "Notification API could not be reached. Check the BFF URL and local HTTPS certificate.",
    );
  });

  it("shares one in-flight registration across repeated enable calls", async () => {
    let resolveToken: ((token: string) => void) | undefined;
    mockGetToken.mockReturnValue(
      new Promise((resolve) => {
        resolveToken = resolve;
      }),
    );
    const { result } = renderHook(() => useFcmNotification(), { wrapper });

    let first: Promise<void>;
    let second: Promise<void>;
    await act(async () => {
      first = result.current.enable();
      second = result.current.enable();
    });
    resolveToken?.("browser-token");
    await act(async () => {
      await Promise.all([first!, second!]);
    });

    expect(mockRegisterDevice).toHaveBeenCalledTimes(1);
  });
});
