"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useUnreadNotificationCountQuery } from "@/hooks/queries/notifications/use-unread-notification-count-query";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { NotificationPanel } from "@/features/notifications/notification-panel";
import { cn } from "@/lib/utils";

type NotificationBellProps = {
  className?: string;
  showLabel?: boolean;
};

const UNREAD_COUNT_POLL_INTERVAL_MS = 30_000;

export function NotificationBell({ className, showLabel = false }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const { data: unreadCount } = useUnreadNotificationCountQuery({
    refetchInterval: UNREAD_COUNT_POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });
  const count = typeof unreadCount === "number" ? unreadCount : 0;
  const label = count > 0 ? "Notifications, " + count + " unread" : "Notifications";
  const badge = count > 99 ? "99+" : String(count);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={showLabel ? "default" : "icon"}
          aria-label={label}
          className={cn(
            "relative text-muted-foreground hover:text-foreground",
            showLabel &&
              "flex h-10 w-full items-center justify-center gap-0 rounded-lg px-2 text-sm font-medium group-hover/sidebar:!justify-start",
            className,
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center">
            <Bell className="size-5" />
          </span>
          {showLabel && (
            <span className="min-w-0 flex-1 truncate overflow-hidden text-left text-sm whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
              Notifications
            </span>
          )}
          {count > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 rounded-full bg-critical px-1 text-center text-[10px] leading-4 font-semibold text-white">
              {badge}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <NotificationPanel open={open} />
    </Sheet>
  );
}
