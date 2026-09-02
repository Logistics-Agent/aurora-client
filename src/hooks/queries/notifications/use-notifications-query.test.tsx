import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { notificationService } from "@/api/services/notifications.service";
import type { NotificationListResponse } from "@/dto/notifications/notification.dto";
import { useNotificationsQuery } from "./use-notifications-query";

vi.mock("@/api/services/notifications.service", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/api/services/notifications.service")>()),
  notificationService: {
    getNotifications: vi.fn(),
  },
}));

const mockedListNotifications = vi.mocked(notificationService.getNotifications);

describe("useNotificationsQuery", () => {
  it("loads the default first page from the notification service", async () => {
    const response: NotificationListResponse = {
      notifications: [],
      page: 1,
      pageSize: 20,
      totalItems: 0,
      totalPages: 0,
    };
    mockedListNotifications.mockResolvedValue(response);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useNotificationsQuery(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedListNotifications).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      unreadOnly: false,
    });
    expect(result.current.data).toEqual(response);
  });
});
