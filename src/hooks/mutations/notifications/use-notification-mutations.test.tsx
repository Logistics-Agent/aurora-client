import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { notificationService } from "@/api/services/notifications.service";
import { notificationsKeys } from "@/api/query-keys/notifications.keys";
import { useNotificationMutations } from "./use-notification-mutations";

vi.mock("@/api/services/notifications.service", () => ({
  notificationService: {
    markAllNotificationsRead: vi.fn(),
    markNotificationRead: vi.fn(),
    registerNotificationDevice: vi.fn(),
    removeNotificationDevice: vi.fn(),
    subscribeToShipment: vi.fn(),
  },
}));

const mockedMarkRead = vi.mocked(notificationService.markNotificationRead);
const mockedMarkAllRead = vi.mocked(
  notificationService.markAllNotificationsRead,
);

describe("useNotificationMutations", () => {
  it("invalidates list and unread count after marking one read", async () => {
    mockedMarkRead.mockResolvedValue();
    const queryClient = new QueryClient();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useNotificationMutations(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    await act(async () => {
      await result.current.markRead.mutateAsync("notification-1");
    });

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: notificationsKeys.all,
    });
  });

  it("invalidates list and unread count after marking all read", async () => {
    mockedMarkAllRead.mockResolvedValue(2);
    const queryClient = new QueryClient();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useNotificationMutations(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    await act(async () => {
      await result.current.markAllRead.mutateAsync();
    });

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: notificationsKeys.all,
    });
  });
});
