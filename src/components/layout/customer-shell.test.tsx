import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CustomerShell } from "./customer-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/portal/shipments",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/hooks/mutations/auth/use-auth-logout", () => ({
  useAuthLogout: () => ({ isPending: false, mutate: vi.fn() }),
}));

afterEach(cleanup);

describe("CustomerShell", () => {
  it("renders the desktop customer workspace and preserves page content", () => {
    render(
      <CustomerShell>
        <p>Portal page content</p>
      </CustomerShell>,
    );

    const sidebar = screen.getByRole("complementary", {
      name: "Customer portal navigation",
    });
    expect(sidebar).toHaveClass("w-[64px]");
    expect(sidebar).toHaveClass("hover:w-[224px]");
    expect(within(sidebar).getByText("Overview")).toBeInTheDocument();
    expect(within(sidebar).getByText("My Shipments")).toBeInTheDocument();
    expect(within(sidebar).getByText("Documents")).toBeInTheDocument();
    expect(within(sidebar).getByText("Invoices")).toBeInTheDocument();
    expect(within(sidebar).getByText("LogiSphere")).toBeInTheDocument();
    expect(within(sidebar).getByText("Customer Portal")).toBeInTheDocument();
    expect(within(sidebar).getByText("Acme Trading Ltd.")).toBeInTheDocument();
    expect(
      within(sidebar).getByRole("button", { name: "Help" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Portal page content")).toBeInTheDocument();
  });

  it("renders the four-item mobile bottom navigation", () => {
    render(<CustomerShell>Content</CustomerShell>);
    const navigation = screen.getByRole("navigation", {
      name: "Customer mobile navigation",
    });
    expect(within(navigation).getAllByRole("link")).toHaveLength(4);
    expect(within(navigation).getByText("Shipments")).toBeInTheDocument();
    expect(within(navigation).getByText("Docs")).toBeInTheDocument();
  });
});
