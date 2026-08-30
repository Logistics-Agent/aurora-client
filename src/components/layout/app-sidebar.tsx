"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RealtimeStatus } from "@/components/common";
import { useAuthLogout } from "@/hooks/mutations/auth/use-auth-logout";
import { staffNavigation } from "@/configs/navigation.config";
import { NotificationBell } from "./notification-bell";

export function AppSidebar() {
  const pathname = usePathname();
  const logoutMutation = useAuthLogout();

  return (
    <aside
      aria-label="Staff navigation"
      className="group/sidebar fixed inset-y-0 left-0 z-50 hidden w-[72px] overflow-hidden border-r border-border bg-card transition-[width] duration-200 ease-out hover:w-[248px] lg:flex lg:flex-col"
    >
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4">
        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-white">
          L
        </div>
        <div className="min-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
          <p className="truncate text-base font-bold">Aurora</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            ACME Logistics
          </p>
        </div>
      </div>

      <nav
        aria-label="Staff desktop navigation"
        className="flex-1 space-y-1 overflow-y-auto p-3"
      >
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
                title={label}
                aria-current={active ? "page" : undefined}
                className={`flex h-10 items-center justify-center gap-3 rounded-lg px-3 text-sm font-medium transition-[background-color,color] group-hover/sidebar:justify-start ${active ? "bg-blue-50 text-primary" : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"}`}
              >
                <Icon className="size-4 shrink-0" />
                <span className="min-w-0 overflow-hidden truncate whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
                  {label}
                </span>
              </Link>
            );
          })}
      </nav>

      <div className="shrink-0 space-y-3 border-t border-border p-3">
        <div className="flex min-h-6 justify-center overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
          <RealtimeStatus state="live" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-3 group-hover/sidebar:justify-start">
            <NotificationBell />
            <span className="overflow-hidden truncate whitespace-nowrap text-sm text-muted-foreground opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
              Notifications
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-center gap-3 px-3 text-muted-foreground group-hover/sidebar:justify-start"
            aria-label="Help"
          >
            <HelpCircle className="size-4 shrink-0" />
            <span className="overflow-hidden truncate whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
              Help
            </span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-center gap-3 px-3 text-muted-foreground group-hover/sidebar:justify-start"
            aria-label="Sign out"
            disabled={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="size-4 shrink-0" />
            <span className="overflow-hidden truncate whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
              Sign out
            </span>
          </Button>
          <div className="flex items-center justify-center gap-3 px-3 py-1 group-hover/sidebar:justify-start">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="bg-primary text-xs font-semibold text-white">
                AN
              </AvatarFallback>
            </Avatar>
            <span className="overflow-hidden truncate whitespace-nowrap text-sm font-medium opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
              Operations
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
