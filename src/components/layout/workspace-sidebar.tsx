"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { Bell, ChevronDown, LogOut, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuthLogout } from "@/hooks/mutations/auth/use-auth-logout";
import { useCurrentUserQuery } from "@/hooks/queries/auth/use-current-user-query";
import { useUnreadNotificationCountQuery } from "@/hooks/queries/notifications/use-unread-notification-count-query";
import { useSidebarStore } from "@/stores/sidebar.store";
import { hasPermission } from "@/types/auth.types";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/configs/navigation.config";

type WorkspaceSidebarProps = {
  navigation: readonly NavigationItem[];
  ariaLabel: string;
  brandName: string;
  brandSubtitle: string;
  brandLogoSrc?: string;
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
  brandLogoSrc,
  accountName,
  accountSubtitle,
  accountInitials,
  showNotifications = false,
}: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const logoutMutation = useAuthLogout();
  const { isExpanded, toggleSidebar } = useSidebarStore();
  const { data: user } = useCurrentUserQuery();
  const { data: unreadNotificationCount } = useUnreadNotificationCountQuery({
    enabled: showNotifications,
    refetchInterval: showNotifications ? 30_000 : false,
    refetchOnWindowFocus: showNotifications,
  });
  const unreadCount = typeof unreadNotificationCount === "number" ? unreadNotificationCount : 0;
  const unreadBadge = unreadCount > 99 ? "99+" : String(unreadCount);

  // Dynamic user profile fallback
  const displayName = user?.name || accountName || "Staff User";
  const displayRole = user?.role || accountSubtitle || "Staff workspace";
  const displayInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : accountInitials || "ST";

  const getItemClassName = (active?: boolean, nested = false) =>
    cn(
      "flex h-10 w-full items-center rounded-lg text-sm font-medium transition-[background-color,color,padding] duration-150",
      isExpanded ? "justify-start px-3 gap-3" : "justify-center px-0 gap-0",
      nested && isExpanded && "pl-11",
      active
        ? "bg-blue-50 text-primary font-semibold dark:bg-blue-950/50 dark:text-blue-400"
        : "text-muted-foreground hover:bg-slate-50 hover:text-foreground dark:hover:bg-slate-800/60 dark:hover:text-foreground",
    );

  // Filter items by capability if user profile is loaded and item requires capability
  const visibleNavigation = useMemo(
    () =>
      navigation.reduce<NavigationItem[]>((items, item) => {
        if (item.capability && user && !hasPermission(user, item.capability)) return items;

        const visibleChildren = item.children?.filter(
          (child) => !child.capability || !user || hasPermission(user, child.capability),
        );
        items.push(visibleChildren ? { ...item, children: visibleChildren } : item);
        return items;
      }, []),
    [navigation, user],
  );
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const activeExpandableItems = useMemo(
    () =>
      new Set(
        visibleNavigation
          .filter((item) => item.children?.some((child) => isNavigationItemActive(child, pathname)))
          .map((item) => item.href),
      ),
    [pathname, visibleNavigation],
  );

  return (
    <>
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
                {brandLogoSrc ? (
                  <div className="relative h-10 w-[154px] shrink-0">
                    <Image
                      src={brandLogoSrc}
                      alt={`${brandName} ${brandSubtitle}`}
                      fill
                      priority
                      sizes="154px"
                      className="object-contain object-left"
                    />
                  </div>
                ) : (
                  <div className="min-w-0 overflow-hidden whitespace-nowrap">
                    <p className="truncate text-base leading-tight font-bold text-foreground">
                      {brandName}
                    </p>
                    <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {brandSubtitle}
                    </p>
                  </div>
                )}
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
          className="flex-1 [scrollbar-width:none] space-y-1 overflow-y-auto p-2 [&::-webkit-scrollbar]:hidden"
        >
          {visibleNavigation.map((item) => {
            const active = isNavigationItemActive(item, pathname);
            const children = item.children ?? [];

            if (children.length === 0) {
              return (
                <NavigationLink
                  key={item.href}
                  item={item}
                  active={active}
                  className={getItemClassName(active)}
                />
              );
            }

            const isOpen = expandedItems[item.href] ?? activeExpandableItems.has(item.href);
            const Icon = item.icon;
            return (
              <div key={item.href}>
                <button
                  type="button"
                  title={item.label}
                  aria-expanded={isOpen}
                  className={getItemClassName(active)}
                  onClick={() =>
                    setExpandedItems((current) => ({ ...current, [item.href]: !isOpen }))
                  }
                >
                  <span className="flex size-8 shrink-0 items-center justify-center">
                    <Icon className="size-4" />
                  </span>
                  {isExpanded ? (
                    <>
                      <span className="min-w-0 flex-1 truncate overflow-hidden text-left whitespace-nowrap">
                        {item.label}
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-4 shrink-0 transition-transform",
                          isOpen && "rotate-180",
                        )}
                        aria-hidden="true"
                      />
                    </>
                  ) : null}
                </button>
                {isExpanded && isOpen ? (
                  <div className="mt-1 grid gap-1">
                    {children.map((child) => {
                      const childActive = isNavigationItemActive(child, pathname);
                      return (
                        <NavigationLink
                          key={child.href}
                          item={child}
                          active={childActive}
                          className={getItemClassName(childActive, true)}
                        />
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="shrink-0 space-y-1 border-t border-border p-2">
          {showNotifications && (
            <Link
              href="/notifications"
              title="Notifications"
              className={cn("relative", getItemClassName(pathname.startsWith("/notifications")))}
            >
              <span className="flex size-8 shrink-0 items-center justify-center">
                <Bell className="size-4" />
              </span>
              {isExpanded && (
                <span className="min-w-0 flex-1 truncate overflow-hidden text-left whitespace-nowrap">
                  Notifications
                </span>
              )}
              {unreadCount > 0 && (
                <span
                  aria-label={`${unreadBadge} unread notifications`}
                  className="absolute top-1/2 right-3 min-w-4 -translate-y-1/2 rounded-full bg-critical px-1 text-center text-[10px] leading-4 font-semibold text-white"
                >
                  {unreadBadge}
                </span>
              )}
            </Link>
          )}
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
              <span className="min-w-0 flex-1 truncate overflow-hidden text-left whitespace-nowrap">
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
              isExpanded ? "justify-start gap-2.5 px-2.5" : "justify-center gap-0 px-0",
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
              <span className="min-w-0 flex-1 truncate overflow-hidden text-left whitespace-nowrap">
                <span className="block truncate text-sm leading-tight font-semibold text-foreground">
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
      <MobileWorkspaceNavigation
        ariaLabel={ariaLabel}
        brandName={brandName}
        brandSubtitle={brandSubtitle}
        brandLogoSrc={brandLogoSrc}
        visibleNavigation={visibleNavigation}
        pathname={pathname}
        showNotifications={showNotifications}
        unreadCount={unreadCount}
        unreadBadge={unreadBadge}
        accountName={displayName}
        accountSubtitle={displayRole}
        accountInitials={displayInitials}
        onSignOut={() => logoutMutation.mutate()}
        isSignOutPending={logoutMutation.isPending}
      />
    </>
  );
}

function MobileWorkspaceNavigation({
  ariaLabel,
  brandName,
  brandSubtitle,
  brandLogoSrc,
  visibleNavigation,
  pathname,
  showNotifications,
  unreadCount,
  unreadBadge,
  accountName,
  accountSubtitle,
  accountInitials,
  onSignOut,
  isSignOutPending,
}: {
  ariaLabel: string;
  brandName: string;
  brandSubtitle: string;
  brandLogoSrc?: string;
  visibleNavigation: NavigationItem[];
  pathname: string;
  showNotifications: boolean;
  unreadCount: number;
  unreadBadge: string;
  accountName: string;
  accountSubtitle: string;
  accountInitials: string;
  onSignOut: () => void;
  isSignOutPending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  return (
    <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card/95 px-3 shadow-sm backdrop-blur lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Open navigation menu"
            className="size-9 text-muted-foreground"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[min(19rem,calc(100vw-2rem))] gap-0 p-0">
          <SheetHeader className="border-b border-border px-4 py-3">
            {brandLogoSrc ? (
              <div className="relative h-9 w-[145px]">
                <Image
                  src={brandLogoSrc}
                  alt={`${brandName} ${brandSubtitle}`}
                  fill
                  sizes="145px"
                  className="object-contain object-left"
                />
              </div>
            ) : (
              <div className="text-left">
                <SheetTitle>{brandName}</SheetTitle>
                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {brandSubtitle}
                </p>
              </div>
            )}
            <SheetTitle className={brandLogoSrc ? "sr-only" : "hidden"}>{ariaLabel}</SheetTitle>
            <SheetDescription className="sr-only">
              Navigate around the {brandName} workspace.
            </SheetDescription>
          </SheetHeader>

          <nav aria-label={`${ariaLabel} mobile menu`} className="flex-1 overflow-y-auto p-2">
            {visibleNavigation.map((item) => {
              const active = isNavigationItemActive(item, pathname);
              const children = item.children ?? [];

              if (children.length === 0) {
                return (
                  <SheetClose asChild key={item.href}>
                    <NavigationLink
                      item={item}
                      active={active}
                      className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-slate-50 hover:text-foreground data-[active=true]:bg-blue-50 data-[active=true]:font-semibold data-[active=true]:text-primary dark:hover:bg-slate-800/60 dark:data-[active=true]:bg-blue-950/50 dark:data-[active=true]:text-blue-400"
                    />
                  </SheetClose>
                );
              }

              const isOpen = expandedItems[item.href] ?? active;
              const Icon = item.icon;
              return (
                <div key={item.href}>
                  <button
                    type="button"
                    title={item.label}
                    aria-expanded={isOpen}
                    className={cn(
                      "flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-slate-50 hover:text-foreground dark:hover:bg-slate-800/60",
                      active &&
                        "bg-blue-50 font-semibold text-primary dark:bg-blue-950/50 dark:text-blue-400",
                    )}
                    onClick={() =>
                      setExpandedItems((current) => ({ ...current, [item.href]: !isOpen }))
                    }
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                    <ChevronDown
                      className={cn("size-4 shrink-0 transition-transform", isOpen && "rotate-180")}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div className="mt-1 grid gap-1">
                      {children.map((child) => (
                        <SheetClose asChild key={child.href}>
                          <NavigationLink
                            item={child}
                            active={isNavigationItemActive(child, pathname)}
                            className="flex h-10 w-full items-center gap-3 rounded-lg py-2 pr-3 pl-11 text-sm font-medium text-muted-foreground transition-colors hover:bg-slate-50 hover:text-foreground dark:hover:bg-slate-800/60"
                          />
                        </SheetClose>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="space-y-1 border-t border-border p-2">
            {showNotifications && (
              <SheetClose asChild>
                <Link
                  href="/notifications"
                  title="Notifications"
                  className={cn(
                    "relative flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60",
                    pathname.startsWith("/notifications")
                      ? "bg-blue-50 font-semibold text-primary dark:bg-blue-950/50 dark:text-blue-400"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center">
                    <Bell className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-left">Notifications</span>
                  {unreadCount > 0 && (
                    <span
                      aria-label={`${unreadBadge} unread notifications`}
                      className="min-w-5 rounded-full bg-critical px-1 text-center text-[10px] leading-5 font-semibold text-white"
                    >
                      {unreadBadge}
                    </span>
                  )}
                </Link>
              </SheetClose>
            )}
            <Button
              type="button"
              variant="ghost"
              className="flex h-11 w-full items-center justify-start gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-slate-50 hover:text-foreground dark:hover:bg-slate-800/60"
              aria-label="Sign out"
              disabled={isSignOutPending}
              onClick={onSignOut}
            >
              <span className="flex size-8 shrink-0 items-center justify-center">
                <LogOut className="size-4" />
              </span>
              Sign out
            </Button>
            <SheetClose asChild>
              <Link
                href="/settings"
                title="Profile & Settings"
                className="flex h-12 items-center gap-2.5 rounded-lg px-2.5 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary text-xs font-semibold text-white">
                    {accountInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1 truncate text-left">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {accountName}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {accountSubtitle}
                  </span>
                </span>
              </Link>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>

      {brandLogoSrc ? (
        <div className="relative h-9 w-[145px]">
          <Image
            src={brandLogoSrc}
            alt={`${brandName} ${brandSubtitle}`}
            fill
            sizes="145px"
            className="object-contain object-center"
          />
        </div>
      ) : (
        <div className="min-w-0 text-center">
          <p className="truncate text-sm font-bold text-foreground">{brandName}</p>
          <p className="truncate text-[9px] font-semibold tracking-wide text-muted-foreground uppercase">
            {brandSubtitle}
          </p>
        </div>
      )}
      <Avatar className="size-8">
        <AvatarFallback className="bg-primary text-[10px] font-semibold text-white">
          {accountInitials}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}

function NavigationLink({
  item,
  active,
  className,
}: {
  item: NavigationItem;
  active: boolean;
  className: string;
}): React.JSX.Element {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={item.label}
      aria-current={active ? "page" : undefined}
      data-active={active}
      className={className}
    >
      <span className="flex size-8 shrink-0 items-center justify-center">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1 truncate overflow-hidden text-left whitespace-nowrap">
        {item.label}
      </span>
    </Link>
  );
}

function isNavigationItemActive(item: NavigationItem, pathname: string): boolean {
  return (
    pathname === item.href ||
    (item.href !== "/portal" && item.href !== "/overview" && pathname.startsWith(`${item.href}/`))
  );
}
