"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, HelpCircle, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthLogout } from "@/hooks/mutations/auth/use-auth-logout";
import { useCurrentUserQuery } from "@/hooks/queries/auth/use-current-user-query";
import { useSidebarStore } from "@/stores/sidebar.store";
import { hasPermission } from "@/types/auth.types";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/configs/navigation.config";

type WorkspaceSidebarProps = {
  navigation: readonly NavigationItem[];
  ariaLabel: string;
  brandName: string;
  brandSubtitle: string;
  accountName?: string;
  accountSubtitle?: string;
  accountInitials?: string;
  showNotifications?: boolean;
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
}: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const logoutMutation = useAuthLogout();
  const { isExpanded, toggleSidebar } = useSidebarStore();
  const { data: user } = useCurrentUserQuery();

  // Dynamic user profile fallback
  const displayName = user?.name || accountName || "Staff User";
  const displayRole = user?.role || accountSubtitle || "Staff workspace";
  const displayInitials =
    user?.name
      ? user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : accountInitials || "ST";

  const getItemClassName = (active?: boolean) =>
    cn(
      "flex h-10 w-full items-center rounded-lg text-sm font-medium transition-[background-color,color,padding] duration-150",
      isExpanded ? "justify-start px-3 gap-3" : "justify-center px-0 gap-0",
      active
        ? "bg-blue-50 text-primary font-semibold dark:bg-blue-950/50 dark:text-blue-400"
        : "text-muted-foreground hover:bg-slate-50 hover:text-foreground dark:hover:bg-slate-800/60 dark:hover:text-foreground",
    );

  // Filter items by capability if user profile is loaded and item requires capability
  const visibleNavigation = navigation.filter((item) => {
    if (!item.capability || !user) return true;
    return hasPermission(user, item.capability);
  });

  return (
    <aside
      aria-label={ariaLabel}
      className={cn(
        "fixed inset-y-0 left-0 z-50 hidden overflow-hidden border-r border-border bg-card transition-[width] duration-200 ease-out lg:flex lg:flex-col",
        isExpanded ? "w-[224px]" : "w-[64px]",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-border transition-[padding] duration-200",
          isExpanded ? "justify-between px-3" : "justify-center px-2",
        )}
      >
        {isExpanded ? (
          <>
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-white shadow-sm">
                L
              </div>
              <div className="min-w-0 overflow-hidden whitespace-nowrap">
                <p className="truncate text-base font-bold leading-tight text-foreground">
                  {brandName}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {brandSubtitle}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="size-8 shrink-0 text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="size-4" />
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="size-9 shrink-0 rounded-lg text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="size-5 text-primary" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav
        aria-label={`${ariaLabel} menu`}
        className="flex-1 space-y-1 overflow-y-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {visibleNavigation.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/portal" && href !== "/overview" && pathname.startsWith(`${href}/`));

          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-current={active ? "page" : undefined}
              className={getItemClassName(active)}
            >
              <span className="flex size-8 shrink-0 items-center justify-center">
                <Icon className="size-4" />
              </span>
              {isExpanded && (
                <span className="min-w-0 flex-1 overflow-hidden truncate whitespace-nowrap text-left">
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 space-y-1 border-t border-border p-2">
        {showNotifications && (
          <Link
            href="/notifications"
            title="Notifications"
            className={getItemClassName(pathname.startsWith("/notifications"))}
          >
            <span className="flex size-8 shrink-0 items-center justify-center">
              <Bell className="size-4" />
            </span>
            {isExpanded && (
              <span className="min-w-0 flex-1 overflow-hidden truncate whitespace-nowrap text-left">
                Notifications
              </span>
            )}
          </Link>
        )}
        <Button
          type="button"
          variant="ghost"
          className={getItemClassName(false)}
          aria-label="Help"
          title="Help"
        >
          <span className="flex size-8 shrink-0 items-center justify-center">
            <HelpCircle className="size-4" />
          </span>
          {isExpanded && (
            <span className="min-w-0 flex-1 overflow-hidden truncate whitespace-nowrap text-left">
              Help
            </span>
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={getItemClassName(false)}
          aria-label="Sign out"
          title="Sign out"
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
        >
          <span className="flex size-8 shrink-0 items-center justify-center">
            <LogOut className="size-4" />
          </span>
          {isExpanded && (
            <span className="min-w-0 flex-1 overflow-hidden truncate whitespace-nowrap text-left">
              Sign out
            </span>
          )}
        </Button>

        {/* User profile (links to /settings) */}
        <Link
          href="/settings"
          title="Profile & Settings"
          className={cn(
            "flex h-11 items-center rounded-lg transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800/80",
            pathname === "/settings" && "bg-blue-50/80 dark:bg-blue-950/40",
            isExpanded ? "justify-start px-2.5 gap-2.5" : "justify-center px-0 gap-0",
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary text-xs font-semibold text-white">
                {displayInitials}
              </AvatarFallback>
            </Avatar>
          </span>
          {isExpanded && (
            <span className="min-w-0 flex-1 overflow-hidden truncate whitespace-nowrap text-left">
              <span className="block truncate text-sm font-semibold leading-tight text-foreground">
                {displayName}
              </span>
              <span className="block truncate text-xs font-normal text-muted-foreground">
                {displayRole}
              </span>
            </span>
          )}
        </Link>
      </div>
    </aside>
  );
}
