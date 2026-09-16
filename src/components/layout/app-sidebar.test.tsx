import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
      permissions: ["shipments:read", "route_planning:read", "mail:read", "mail:quarantine:read"],
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

vi.mock("@/hooks/queries/notifications/use-unread-notification-count-query", () => ({
  useUnreadNotificationCountQuery: () => ({ data: 3 }),
}));

afterEach(cleanup);

describe("AppSidebar", () => {
  beforeEach(() => {
    useSidebarStore.setState({ isExpanded: true });
  });

  it("declares Mail as an expandable capability navigation item", () => {
    expect(staffNavigation).toContainEqual(
      expect.objectContaining({
        label: "Mail",
        href: "/mail",
        capability: "mail:read",
        children: expect.arrayContaining([
          expect.objectContaining({ label: "Mail exchange", href: "/mail" }),
          expect.objectContaining({
            label: "Quarantine",
            href: "/mail/quarantine",
            capability: "mail:quarantine:read",
          }),
        ]),
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
    expect(within(sidebar).getByLabelText("3 unread notifications")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open navigation menu" })).toBeInTheDocument();

    const mailToggle = within(sidebar).getByRole("button", { name: "Mail" });
    expect(mailToggle).toHaveAttribute("aria-expanded", "false");

    await user.click(mailToggle);

    expect(mailToggle).toHaveAttribute("aria-expanded", "true");
    expect(within(sidebar).getByRole("link", { name: "Mail exchange" })).toHaveAttribute(
      "href",
      "/mail",
    );
    expect(within(sidebar).getByRole("link", { name: "Quarantine" })).toHaveAttribute(
      "href",
      "/mail/quarantine",
    );
    expect(within(sidebar).queryByText("History")).not.toBeInTheDocument();

    const collapseButton = screen.getByRole("button", {
      name: "Collapse sidebar",
    });
    await user.click(collapseButton);

    expect(sidebar).toHaveClass("w-[64px]");
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeInTheDocument();
  });

  it("opens the complete mobile navigation in a drawer", async () => {
    const user = userEvent.setup();
    render(<AppSidebar />);

    await user.click(screen.getByRole("button", { name: "Open navigation menu" }));

    const drawer = screen.getByRole("dialog", { name: "Staff navigation" });
    expect(within(drawer).getByText("Overview")).toBeInTheDocument();
    expect(within(drawer).getByText("Notifications")).toBeInTheDocument();

    await user.click(within(drawer).getByRole("button", { name: "Mail" }));
    expect(within(drawer).getByRole("link", { name: "Mail exchange" })).toBeInTheDocument();
    expect(within(drawer).getByRole("link", { name: "Quarantine" })).toBeInTheDocument();
  });
});
