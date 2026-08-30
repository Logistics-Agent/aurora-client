import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppSidebar } from "./app-sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/overview",
}));

vi.mock("@/hooks/mutations/auth/use-auth-logout", () => ({
  useAuthLogout: () => ({ isPending: false, mutate: vi.fn() }),
}));

vi.mock("./notification-bell", () => ({
  NotificationBell: () => (
    <button type="button" aria-label="Notifications">
      Notifications
    </button>
  ),
}));

describe("AppSidebar", () => {
  it("starts compact and expands on hover or keyboard focus", () => {
    render(<AppSidebar />);

    const sidebar = screen.getByRole("complementary", {
      name: "Staff navigation",
    });

    expect(sidebar).toHaveClass("w-[72px]");
    expect(sidebar).toHaveClass("fixed");
    expect(sidebar).toHaveClass("inset-y-0");
    expect(sidebar).toHaveClass("z-50");
    expect(sidebar).toHaveClass("hover:w-[248px]");
    expect(sidebar).not.toHaveClass("focus-within:w-[248px]");
    expect(within(sidebar).getByText("Overview")).toBeInTheDocument();
    expect(
      within(sidebar).getByRole("button", { name: "Notifications" }),
    ).toBeInTheDocument();
  });
});
