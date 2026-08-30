import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MessagePayload } from "firebase/messaging";
import { NotificationFcmBootstrap } from "./notification-fcm-bootstrap";
import { FCM_REGISTRATION_CHANGED_EVENT } from "../../constants";

const mockGetFirebaseMessaging = vi.fn();
const mockOnMessage = vi.fn();
const mockRefreshToken = vi.fn();
const mockInvalidateQueries = vi.fn();
const mockToast = vi.hoisted(() => vi.fn());
let messageHandler:
  | ((payload: MessagePayload) => void)
  | undefined;

vi.mock("@/features/notifications/lib/firebase-client", () => ({
  getFirebaseMessaging: () => mockGetFirebaseMessaging(),
}));

vi.mock("@/features/notifications/hooks/use-fcm-notification", () => ({
  useFcmNotification: () => ({ refreshToken: mockRefreshToken }),
}));

vi.mock("firebase/messaging", () => ({
  onMessage: (...args: unknown[]) => {
    mockOnMessage(...args);
    messageHandler = args[1] as (payload: MessagePayload) => void;
    return vi.fn();
  },
}));

vi.mock("sonner", () => ({ toast: mockToast }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

function renderBootstrap() {
  const queryClient = new QueryClient();
  vi.spyOn(queryClient, "invalidateQueries").mockImplementation(
    mockInvalidateQueries,
  );

  render(
    <QueryClientProvider client={queryClient}>
      <NotificationFcmBootstrap />
    </QueryClientProvider>,
  );

  return queryClient;
}

describe("NotificationFcmBootstrap", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    messageHandler = undefined;
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: { permission: "default" },
    });
  });

  it("does not initialize Firebase without notification permission", async () => {
    renderBootstrap();
    await Promise.resolve();

    expect(mockGetFirebaseMessaging).not.toHaveBeenCalled();
    expect(mockOnMessage).not.toHaveBeenCalled();
  });

  it("does not initialize Firebase until browser permission is granted", async () => {
    renderBootstrap();
    await Promise.resolve();

    expect(mockGetFirebaseMessaging).not.toHaveBeenCalled();
    expect(mockOnMessage).not.toHaveBeenCalled();
  });

  it("starts the foreground listener after first-time permission registration", async () => {
    mockGetFirebaseMessaging.mockResolvedValue({ name: "messaging" });
    renderBootstrap();
    await Promise.resolve();

    expect(mockOnMessage).not.toHaveBeenCalled();
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: { permission: "granted" },
    });
    window.dispatchEvent(new Event(FCM_REGISTRATION_CHANGED_EVENT));

    await waitFor(() => expect(mockOnMessage).toHaveBeenCalledTimes(1));
    expect(mockRefreshToken).not.toHaveBeenCalled();
  });

  it("shows one foreground toast and refreshes notification queries", async () => {
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: { permission: "granted" },
    });
    mockGetFirebaseMessaging.mockResolvedValue({ name: "messaging" });
    const queryClient = renderBootstrap();

    await waitFor(() => expect(mockOnMessage).toHaveBeenCalledTimes(1));

    await act(async () => {
      messageHandler?.({
        data: {
          notificationId: "notification-1",
          type: "SHIPMENT_DELIVERED",
          shipmentId: "00000000-0000-0000-0000-000000000001",
          actionUrl:
            "/shipments/00000000-0000-0000-0000-000000000001",
        },
        notification: {
          title: "Shipment delivered",
          body: "Shipment SHP-001 was delivered.",
        },
      } as unknown as MessagePayload);
    });

    expect(mockToast).toHaveBeenCalledTimes(1);
    expect(queryClient.invalidateQueries).toHaveBeenCalled();
  });
});
