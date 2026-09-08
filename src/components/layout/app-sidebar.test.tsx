import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { staffNavigation } from "@/configs/navigation.config";
import { useSidebarStore } from "@/stores/sidebar.store";
import { AppSidebar } from "./app-sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/overview",
}));

vi.mock("@/hooks/mutations/auth/use-auth-logout", () => ({
  useAuthLogout: () => ({ isPending: false, mutate: vi.fn() }),
}));

vi.mock("@/hooks/queries/auth/use-current-user-query", () => ({
  useCurrentUserQuery: () => ({
    data: {
      userId: "user-1",
      tenantId: "tenant-1",
      email: "ops@acme.com",
      name: "Operations Staff",
      role: "STAFF",
      permissions: ["shipments:read", "route_planning:read", "mail:read"],
      isAuthenticated: true,
    },
    isLoading: false,
  }),
}));

vi.mock("./notification-bell", () => ({
  NotificationBell: () => (
    <button type="button" aria-label="Notifications">
      Notifications
    </button>
  ),
}));

describe("AppSidebar", () => {
  beforeEach(() => {
    useSidebarStore.setState({ isExpanded: true });
  });

  it("declares Mail as a direct-capability navigation item", () => {
    expect(staffNavigation).toContainEqual(
      expect.objectContaining({
        label: "Mail",
        href: "/mail",
        capability: "mail:read",
      }),
    );
  });

  it("renders expanded by default and can toggle to compact", async () => {
    const user = userEvent.setup();
    render(<AppSidebar />);

    const sidebar = screen.getByRole("complementary", {
      name: "Staff navigation",
    });

    expect(sidebar).toHaveClass("w-[224px]");
    expect(sidebar).toHaveClass("fixed");
    expect(sidebar).toHaveClass("inset-y-0");
    expect(sidebar).toHaveClass("z-50");
    expect(within(sidebar).getByText("Overview")).toBeInTheDocument();

    const mailLink = within(sidebar).getByRole("link", { name: "Mail" });
    expect(mailLink).toHaveAttribute("href", "/mail");

    const collapseButton = screen.getByRole("button", {
      name: "Collapse sidebar",
    });
    await user.click(collapseButton);

    expect(sidebar).toHaveClass("w-[64px]");
    expect(
      screen.getByRole("button", { name: "Expand sidebar" }),
    ).toBeInTheDocument();
  });
});
