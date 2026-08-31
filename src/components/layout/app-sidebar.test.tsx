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

    expect(sidebar).toHaveClass("w-[64px]");
    expect(sidebar).toHaveClass("fixed");
    expect(sidebar).toHaveClass("inset-y-0");
    expect(sidebar).toHaveClass("z-50");
    expect(sidebar).toHaveClass("hover:w-[224px]");
    expect(sidebar).not.toHaveClass("focus-within:w-[224px]");
    expect(within(sidebar).getByText("Overview")).toBeInTheDocument();
    expect(
      within(sidebar).getByRole("link", { name: "Overview" }).firstElementChild,
    ).toHaveClass("size-8", "shrink-0");
    expect(
      within(sidebar).getByRole("button", { name: "Notifications" }),
    ).toBeInTheDocument();
  });
});
