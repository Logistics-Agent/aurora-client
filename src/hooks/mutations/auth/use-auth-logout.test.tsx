import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { authService } from "@/api/services/auth.service";
import { useAuthLogout } from "./use-auth-logout";

const mocks = vi.hoisted(() => ({
  disable: vi.fn(),
  push: vi.fn(),
}));

vi.mock("@/api/services/auth.service", () => ({
  authService: {
    logout: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/features/notifications/hooks/use-fcm-notification", () => ({
  useFcmNotification: () => ({ disable: mocks.disable }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

describe("useAuthLogout", () => {
  it("does not clear the auth session when device cleanup fails", async () => {
    mocks.disable.mockResolvedValueOnce(false);
    const { result } = renderHook(() => useAuthLogout(), { wrapper });

    await expect(result.current.mutateAsync()).rejects.toThrow(
      "Unable to disable browser notifications.",
    );
    expect(authService.logout).not.toHaveBeenCalled();
  });

  it("disables the notification device before signing out", async () => {
    const order: string[] = [];
    mocks.disable.mockImplementationOnce(async () => {
      order.push("disable");
      return true;
    });
    vi.mocked(authService.logout).mockImplementationOnce(async () => {
      order.push("logout");
    });
    const { result } = renderHook(() => useAuthLogout(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(order).toEqual(["disable", "logout"]);
    expect(mocks.push).toHaveBeenCalledWith("/login");
  });
});
