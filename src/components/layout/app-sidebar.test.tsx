import { render, screen, within } from "@testing-library/react";
<<<<<<< Updated upstream
import { describe, expect, it, vi } from "vitest";
import { staffNavigation } from "@/configs/navigation.config";
=======
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSidebarStore } from "@/stores/sidebar.store";
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
  beforeEach(() => {
    useSidebarStore.setState({ isExpanded: true });
  });

  it("renders expanded by default and can toggle to compact", async () => {
    const user = userEvent.setup();
>>>>>>> Stashed changes
    render(<AppSidebar />);

    const sidebar = screen.getByRole("complementary", {
      name: "Staff navigation",
    });

    expect(sidebar).toHaveClass("w-[224px]");
    expect(sidebar).toHaveClass("fixed");
    expect(sidebar).toHaveClass("inset-y-0");
    expect(sidebar).toHaveClass("z-50");
    expect(within(sidebar).getByText("Overview")).toBeInTheDocument();

    const collapseButton = screen.getByRole("button", {
      name: "Collapse sidebar",
    });
<<<<<<< Updated upstream
    expect(notificationLink).toHaveAttribute("href", "/notifications");
    expect(notificationLink).toHaveClass("w-full", "h-10");

    const mailLink = within(sidebar).getByRole("link", { name: "Mail" });
    expect(mailLink).toHaveAttribute("href", "/mail");
=======
    await user.click(collapseButton);

    expect(sidebar).toHaveClass("w-[64px]");
    expect(
      screen.getByRole("button", { name: "Expand sidebar" }),
    ).toBeInTheDocument();
>>>>>>> Stashed changes
  });
});
