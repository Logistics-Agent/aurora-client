"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, HelpCircle, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthLogout } from "@/hooks/mutations/auth/use-auth-logout";
import { useSidebarStore } from "@/stores/sidebar.store";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/configs/navigation.config";

<<<<<<< Updated upstream
const sidebarItemClassName =
  "flex h-10 w-full items-center justify-start rounded-lg px-2 text-sm font-medium transition-colors";

=======
>>>>>>> Stashed changes
type WorkspaceSidebarProps = {
  navigation: readonly NavigationItem[];
  ariaLabel: string;
  brandName: string;
  brandSubtitle: string;
  accountName: string;
  accountSubtitle: string;
  accountInitials: string;
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

  const getItemClassName = (active?: boolean) =>
    cn(
      "flex h-10 items-center rounded-lg text-sm font-medium transition-[background-color,color,padding] duration-150",
      isExpanded ? "justify-start px-2.5 gap-2.5" : "justify-center px-0 gap-0",
      active
        ? "bg-blue-50 text-primary font-semibold"
        : "text-muted-foreground hover:bg-slate-50 hover:text-foreground",
    );

  return (
    <aside
      aria-label={ariaLabel}
      className={cn(
        "fixed inset-y-0 left-0 z-50 hidden overflow-hidden border-r border-border bg-card transition-[width] duration-200 ease-out lg:flex lg:flex-col",
        isExpanded ? "w-[224px]" : "w-[64px]",
      )}
    >
<<<<<<< Updated upstream
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-white">
          L
        </div>
        <div className="min-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
          <p className="truncate text-base font-bold">{brandName}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {brandSubtitle}
          </p>
        </div>
=======
      <div className={cn(
        "flex h-16 shrink-0 items-center border-b border-border transition-[padding] duration-200",
        isExpanded ? "justify-between px-3" : "justify-center px-2",
      )}>
        {isExpanded ? (
          <>
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-white shadow-sm">
                L
              </div>
              <div className="min-w-0 overflow-hidden whitespace-nowrap">
                <p className="truncate text-base font-bold leading-tight">{brandName}</p>
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
              className="size-8 shrink-0 text-muted-foreground hover:bg-slate-100 hover:text-foreground"
              aria-label="Collapse sidebar"
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
            className="size-9 shrink-0 rounded-lg text-muted-foreground hover:bg-slate-100 hover:text-foreground"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="size-5 text-primary" />
          </Button>
        )}
>>>>>>> Stashed changes
      </div>

      <nav
        aria-label={`${ariaLabel} menu`}
        className="flex-1 space-y-1 overflow-y-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
<<<<<<< Updated upstream
              className={`${sidebarItemClassName} ${active ? "bg-blue-50 text-primary" : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"}`}
=======
              className={getItemClassName(active)}
>>>>>>> Stashed changes
            >
              <span className="flex size-8 shrink-0 items-center justify-center">
                <Icon className="size-4" />
              </span>
<<<<<<< Updated upstream
              <span className="min-w-0 flex-1 overflow-hidden truncate whitespace-nowrap text-left text-sm opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
                {label}
              </span>
=======
              {isExpanded && (
                <span className="min-w-0 flex-1 overflow-hidden truncate whitespace-nowrap text-left">
                  {label}
                </span>
              )}
>>>>>>> Stashed changes
            </Link>
          );
        })}
      </nav>

<<<<<<< Updated upstream
      <div className="shrink-0 space-y-1 border-t border-border p-2">
        {showNotifications && (
          <Link
            href="/notifications"
            title="Notifications"
            className={`${sidebarItemClassName} text-muted-foreground hover:bg-slate-50 hover:text-foreground`}
          >
            <span className="flex size-8 shrink-0 items-center justify-center">
              <Bell className="size-4" />
            </span>
            <span className="min-w-0 flex-1 overflow-hidden truncate whitespace-nowrap text-left opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
              Notifications
            </span>
          </Link>
        )}
        <button
          type="button"
          className={`${sidebarItemClassName} text-muted-foreground hover:bg-slate-50 hover:text-foreground`}
          aria-label="Help"
        >
          <span className="flex size-8 shrink-0 items-center justify-center">
            <HelpCircle className="size-4" />
          </span>
          <span className="min-w-0 flex-1 overflow-hidden truncate whitespace-nowrap text-left opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
            Help
          </span>
        </button>
        <button
          type="button"
          className={`${sidebarItemClassName} text-muted-foreground hover:bg-slate-50 hover:text-foreground disabled:pointer-events-none disabled:opacity-50`}
          aria-label="Sign out"
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
        >
          <span className="flex size-8 shrink-0 items-center justify-center">
            <LogOut className="size-4" />
          </span>
          <span className="min-w-0 flex-1 overflow-hidden truncate whitespace-nowrap text-left opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
            Sign out
          </span>
        </button>
        <div className={`${sidebarItemClassName} text-foreground hover:bg-slate-50`}>
          <span className="flex size-8 shrink-0 items-center justify-center">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary text-xs font-semibold text-white">
                {accountInitials}
              </AvatarFallback>
            </Avatar>
          </span>
          <span className="min-w-0 flex-1 overflow-hidden truncate whitespace-nowrap pl-2 text-left text-sm font-medium opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
            <span className="block truncate font-semibold leading-tight">{accountName}</span>
            <span className="block truncate text-xs font-normal text-muted-foreground">
              {accountSubtitle}
            </span>
          </span>
=======
      <div className="shrink-0 space-y-3 border-t border-border p-2">
        {showRealtimeStatus && (
          <div className={cn(
            "flex min-h-6 overflow-hidden whitespace-nowrap",
            isExpanded ? "justify-start px-2" : "justify-center",
          )}>
            <RealtimeStatus state="live" />
          </div>
        )}
        <div className="space-y-1">
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
          <div className={cn(
            "flex h-10 items-center rounded-lg",
            isExpanded ? "justify-start px-2.5 gap-2.5" : "justify-center px-0 gap-0",
          )}>
            <span className="flex size-8 shrink-0 items-center justify-center">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary text-xs font-semibold text-white">
                  {accountInitials}
                </AvatarFallback>
              </Avatar>
            </span>
            {isExpanded && (
              <span className="min-w-0 flex-1 overflow-hidden truncate whitespace-nowrap text-sm font-medium">
                <span className="block truncate text-foreground">{accountName}</span>
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {accountSubtitle}
                </span>
              </span>
            )}
          </div>
>>>>>>> Stashed changes
        </div>
      </div>
    </aside>
  );
}
