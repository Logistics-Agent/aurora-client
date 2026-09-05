import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { staffNavigation } from "@/configs/navigation.config";
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
  it("declares Mail as a direct-capability navigation item", () => {
    expect(staffNavigation).toContainEqual(
      expect.objectContaining({
        label: "Mail",
        href: "/mail",
        capability: "mail:read",
      }),
    );
  });

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
    const notificationLink = within(sidebar).getByRole("link", {
      name: "Notifications",
    });
    expect(notificationLink).toHaveAttribute("href", "/notifications");
    expect(notificationLink).toHaveClass("w-full", "h-10");

    const mailLink = within(sidebar).getByRole("link", { name: "Mail" });
    expect(mailLink).toHaveAttribute("href", "/mail");
  });
});
