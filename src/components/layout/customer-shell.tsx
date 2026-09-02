"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { customerNavigation } from "@/configs/navigation.config";
import { WorkspaceSidebar } from "./workspace-sidebar";

const mobileNavigation = customerNavigation
  .filter(({ href }) =>
    [
      "/portal",
      "/portal/shipments",
      "/portal/documents",
      "/portal/invoices",
    ].includes(href),
  )
  .map((item) => ({
    ...item,
    mobileLabel:
      item.href === "/portal/shipments"
        ? "Shipments"
        : item.href === "/portal/documents"
          ? "Docs"
          : item.label,
  }));

function isActivePath(pathname: string, href: string) {
  return href === "/portal"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function CustomerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      <WorkspaceSidebar
        navigation={customerNavigation}
        ariaLabel="Customer portal navigation"
        brandName="LogiSphere"
        brandSubtitle="Customer Portal"
        accountName="Acme Trading Ltd."
        accountSubtitle="Customer account"
        accountInitials="AC"
      />

      <main className="min-w-0 flex-1 overflow-y-auto pb-[66px] lg:ml-[64px] lg:pb-0">
        <div className="w-full p-4 sm:p-6 lg:p-8">{children}</div>
      </main>

      <nav
        aria-label="Customer mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 grid h-[66px] grid-cols-4 border-t border-border bg-card/95 px-2 py-1 backdrop-blur lg:hidden"
      >
        {mobileNavigation.map(({ mobileLabel, href, icon: Icon }) => {
          const active = isActivePath(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-md text-[10px] ${active ? "font-semibold text-primary" : "text-muted-foreground"}`}
            >
              <Icon className="size-4" />
              <span className="truncate">{mobileLabel}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
