"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useUnreadNotificationCountQuery } from "@/hooks/queries/notifications/use-unread-notification-count-query";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { NotificationPanel } from "@/features/notifications/notification-panel";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: unreadCount } = useUnreadNotificationCountQuery();
  const count = typeof unreadCount === "number" ? unreadCount : 0;
  const label =
    count > 0 ? "Notifications, " + count + " unread" : "Notifications";
  const badge = count > 99 ? "99+" : String(count);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="size-5" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-critical px-1 text-center text-[10px] font-semibold leading-4 text-white">
              {badge}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <NotificationPanel open={open} />
    </Sheet>
  );
}
