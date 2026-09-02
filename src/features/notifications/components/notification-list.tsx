"use client";

import { Button } from "@/components/ui/button";
import type { NotificationRecord } from "@/dto/notifications/notification.dto";

export type NotificationListProps = {
  notifications: NotificationRecord[];
  onMarkRead: (id: string) => void;
  onOpen: (actionUrl: string | null) => void;
};

export function NotificationList({
  notifications,
  onMarkRead,
  onOpen,
}: NotificationListProps) {
  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <article
          className={
            notification.isRead
              ? "rounded-lg border border-border bg-card p-4"
              : "rounded-lg border border-primary/30 bg-blue-50/40 p-4"
          }
          key={notification.id}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{notification.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {notification.body}
              </p>
            </div>
            <span
              className={
                notification.isRead
                  ? "rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
                  : "rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700"
              }
            >
              {notification.isRead ? "Read" : "Unread"}
            </span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {notification.shipmentNumber
              ? notification.shipmentNumber + " · "
              : ""}
            {new Date(notification.createdAt).toLocaleString()}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {!notification.isRead && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onMarkRead(notification.id)}
              >
                Mark read
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (!notification.isRead) onMarkRead(notification.id);
                onOpen(notification.actionUrl);
              }}
              aria-label={"Open " + notification.title}
            >
              Open
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
