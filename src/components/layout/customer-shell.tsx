"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { customerNavigation } from "@/configs/navigation.config";

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
    <div className="min-h-screen bg-background md:flex">
      <aside
        aria-label="Customer portal navigation"
        className="hidden w-[232px] shrink-0 border-r border-border bg-card md:fixed md:inset-y-0 md:flex md:flex-col"
      >
        <div className="px-6 pb-7 pt-6">
          <p className="text-lg font-semibold">LogiSphere</p>
          <p className="text-xs text-muted-foreground">Customer Portal</p>
        </div>
        <nav
          className="space-y-1 px-3"
          aria-label="Customer desktop navigation"
        >
          {customerNavigation.map(({ label, href, icon: Icon }) => {
            const active = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-10 items-center gap-3 rounded-lg px-4 text-sm transition-colors ${active ? "bg-blue-50 font-semibold text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-5">
          <div className="rounded-lg bg-secondary p-3">
            <p className="text-sm font-semibold">Acme Trading Ltd.</p>
            <p className="text-xs text-muted-foreground">Customer account</p>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 md:ml-[232px]">
        <header className="sticky top-0 z-40 h-[58px] border-b border-border bg-card/95 backdrop-blur md:h-16">
          <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-7">
            <div>
              <p className="font-semibold md:hidden">LogiSphere</p>
              <p className="hidden text-sm font-semibold md:block">
                Customer workspace
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="hidden text-xs text-muted-foreground md:block">
                UTC+7 · Vietnam
              </p>
              <button
                type="button"
                aria-label="Search customer portal"
                className="grid size-9 place-items-center rounded-lg text-primary hover:bg-blue-50 md:hidden"
              >
                <Search className="size-4" />
              </button>
              <div className="hidden size-9 place-items-center rounded-full bg-primary text-xs font-bold text-white md:grid">
                AC
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1240px] px-4 py-6 pb-28 sm:px-6 md:pb-8 lg:px-7">
          {children}
        </main>
      </div>

      <nav
        aria-label="Customer mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 grid h-[66px] grid-cols-4 border-t border-border bg-card/95 px-2 py-1 backdrop-blur md:hidden"
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
