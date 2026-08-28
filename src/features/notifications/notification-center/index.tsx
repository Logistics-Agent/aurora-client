"use client";

import { useState } from "react";
import { StatusBadge, WorkspaceCard } from "@/components/common";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { markNotificationRead, notificationMocks } from "../mock";

export function NotificationCenterPage() {
  const [notifications, setNotifications] = useState(notificationMocks);

  return (
    <>
      <PageHeader
        title="Notification Center"
        description="Persistent critical events grouped by time."
      />
      <WorkspaceCard>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              className="rounded-lg border border-border p-4"
              key={notification.id}
            >
              <div className="flex justify-between gap-3">
                <p className="font-semibold">{notification.title}</p>
                <StatusBadge
                  label={notification.read ? "Read" : "Unread"}
                  intent={notification.read ? "neutral" : "critical"}
                />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {notification.body} · {notification.time}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                disabled={notification.read}
                onClick={() =>
                  setNotifications((current) =>
                    current.map((item) =>
                      item.id === notification.id
                        ? markNotificationRead(item)
                        : item,
                    ),
                  )
                }
              >
                {notification.read ? "Read" : "Mark read"}
              </Button>
            </div>
          ))}
        </div>
      </WorkspaceCard>
    </>
  );
}
