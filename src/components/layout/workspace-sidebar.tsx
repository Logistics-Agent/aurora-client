"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RealtimeStatus } from "@/components/common";
import { useAuthLogout } from "@/hooks/mutations/auth/use-auth-logout";
import type { NavigationItem } from "@/configs/navigation.config";
import { NotificationBell } from "./notification-bell";

type WorkspaceSidebarProps = {
  navigation: readonly NavigationItem[];
  ariaLabel: string;
  brandName: string;
  brandSubtitle: string;
  accountName: string;
  accountSubtitle: string;
  accountInitials: string;
  showNotifications?: boolean;
  showRealtimeStatus?: boolean;
};

export function WorkspaceSidebar({
  navigation,
  ariaLabel,
  brandName,
  brandSubtitle,
  accountName,
  accountSubtitle,
  accountInitials,
  showNotifications = false,
  showRealtimeStatus = false,
}: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const logoutMutation = useAuthLogout();

  return (
    <aside
      aria-label={ariaLabel}
      className="group/sidebar fixed inset-y-0 left-0 z-50 hidden w-[64px] overflow-hidden border-r border-border bg-card transition-[width] duration-200 ease-out hover:w-[224px] lg:flex lg:flex-col"
    >
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-3">
        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-white">
          L
        </div>
        <div className="min-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
          <p className="truncate text-base font-bold">{brandName}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {brandSubtitle}
          </p>
        </div>
      </div>

      <nav
        aria-label={`${ariaLabel} menu`}
        className="flex-1 space-y-1 overflow-y-auto p-2"
      >
        {navigation.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/portal" && pathname.startsWith(`${href}/`));

          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-current={active ? "page" : undefined}
              className={`flex h-10 items-center justify-center gap-0 rounded-lg px-2 text-sm font-medium transition-[background-color,color] group-hover/sidebar:justify-start ${active ? "bg-blue-50 text-primary" : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"}`}
            >
              <span className="flex size-8 shrink-0 items-center justify-center">
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1 overflow-hidden truncate whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-3 border-t border-border p-2">
        {showRealtimeStatus && (
          <div className="flex min-h-6 justify-center overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
            <RealtimeStatus state="live" />
          </div>
        )}
        <div className="space-y-1">
          {showNotifications && (
            <div className="flex h-10 items-center justify-center gap-0 px-2 group-hover/sidebar:justify-start">
              <span className="flex size-8 shrink-0 items-center justify-center">
                <NotificationBell />
              </span>
              <span className="min-w-0 flex-1 overflow-hidden truncate whitespace-nowrap text-sm text-muted-foreground opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
                Notifications
              </span>
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-center gap-0 px-2 text-muted-foreground group-hover/sidebar:justify-start"
            aria-label="Help"
          >
            <span className="flex size-8 shrink-0 items-center justify-center">
              <HelpCircle className="size-4" />
            </span>
            <span className="min-w-0 flex-1 overflow-hidden truncate whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
              Help
            </span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-center gap-0 px-2 text-muted-foreground group-hover/sidebar:justify-start"
            aria-label="Sign out"
            disabled={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
          >
            <span className="flex size-8 shrink-0 items-center justify-center">
              <LogOut className="size-4" />
            </span>
            <span className="min-w-0 flex-1 overflow-hidden truncate whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
              Sign out
            </span>
          </Button>
          <div className="flex h-10 items-center justify-center gap-0 px-2 group-hover/sidebar:justify-start">
            <span className="flex size-8 shrink-0 items-center justify-center">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary text-xs font-semibold text-white">
                  {accountInitials}
                </AvatarFallback>
              </Avatar>
            </span>
            <span className="min-w-0 flex-1 overflow-hidden truncate whitespace-nowrap text-sm font-medium opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
              <span className="block truncate">{accountName}</span>
              <span className="block truncate text-xs font-normal text-muted-foreground">
                {accountSubtitle}
              </span>
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
