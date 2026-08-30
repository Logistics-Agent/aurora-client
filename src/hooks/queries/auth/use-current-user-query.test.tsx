import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { authService } from "@/api/services/auth.service";
import { useCurrentUserQuery } from "./use-current-user-query";

vi.mock("@/api/services/auth.service", () => ({
  authService: {
    getCurrentUser: vi.fn(),
  },
}));

describe("useCurrentUserQuery", () => {
  it("loads the current authenticated profile without retrying", async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      userId: "user-1",
      tenantId: "tenant-1",
      email: "ops@example.com",
      name: "Operations",
      role: "STAFF",
      permissions: ["notifications:access"],
      isAuthenticated: true,
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useCurrentUserQuery(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.isAuthenticated).toBe(true);
  });
});
