"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RealtimeStatus } from "@/components/common";
import { staffNavigation } from "@/configs/navigation.config";

export function AppSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  return (
    <aside
      className={`hidden shrink-0 border-r border-border bg-card transition-[width] duration-200 lg:flex lg:flex-col ${collapsed ? "w-[72px]" : "w-[248px]"}`}
    >
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-white">
          L
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-base font-bold">Aurora</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              ACME Logistics
            </p>
          </div>
        )}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {staffNavigation
          .filter(
            (item) =>
              item.label !== "Users & Roles" && item.label !== "AI Operations",
          )
          .map(({ label, href, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/overview" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${active ? "bg-blue-50 text-primary" : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"}`}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
      </nav>
      <div className="space-y-3 border-t border-border p-3">
        {!collapsed && <RealtimeStatus state="live" />}
        <Button
          variant="ghost"
          size="icon"
          className="w-full"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>
    </aside>
  );
}
