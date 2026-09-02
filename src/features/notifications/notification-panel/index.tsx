"use client";

import { useRouter } from "next/navigation";
import { Bell, X } from "lucide-react";
import { useNotificationsQuery } from "@/hooks/queries/notifications/use-notifications-query";
import { useNotificationMutations } from "@/hooks/mutations/notifications/use-notification-mutations";
import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { NotificationRecord } from "@/dto/notifications/notification.dto";
import { safeNotificationPath } from "../utils/fcm-payload";
import { NotificationList } from "../components/notification-list";

function NotificationPanelBody({
  notifications,
  isPending,
  isError,
  onRetry,
  onMarkRead,
  onOpen,
}: {
  notifications: NotificationRecord[];
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  onMarkRead: (id: string) => void;
  onOpen: (actionUrl: string | null) => void;
}) {
  if (isPending) {
    return <p className="p-6 text-sm text-muted-foreground">Loading notifications…</p>;
  }

  if (isError) {
    return (
      <div className="space-y-3 p-6" role="alert">
        <p className="text-sm text-red-700">Unable to load notifications.</p>
        <Button type="button" size="sm" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center bg-slate-50 px-8 text-center">
        <p className="font-semibold text-slate-700">No notifications yet!</p>
        <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
          Shipment and document updates will appear here.
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          Enable browser notifications to stay informed.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <NotificationList
        notifications={notifications}
        onMarkRead={onMarkRead}
        onOpen={onOpen}
      />
    </div>
  );
}

export function NotificationPanel({ open }: { open: boolean }) {
  const router = useRouter();
  const notificationsQuery = useNotificationsQuery(
    { page: 1, pageSize: 20, unreadOnly: false },
    { enabled: open },
  );
  const { markRead } = useNotificationMutations();
  const notifications = notificationsQuery.data?.notifications ?? [];

  function openNotification(actionUrl: string | null) {
    const path = safeNotificationPath(actionUrl ?? undefined);
    if (path) router.push(path);
  }

  return (
    <SheetContent
      side="left"
      showCloseButton={false}
      aria-describedby="notification-panel-description"
      className="w-full gap-0 p-0 sm:max-w-[28rem]"
    >
      <SheetHeader className="border-b border-border px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bell className="size-4" />
            <SheetTitle>Notifications</SheetTitle>
          </div>
          <SheetClose asChild>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Close notifications">
              <X />
            </Button>
          </SheetClose>
        </div>
        <SheetDescription id="notification-panel-description" className="sr-only">
          Shipment, tracking and document notifications for your workspace.
        </SheetDescription>
      </SheetHeader>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <NotificationPanelBody
          notifications={notifications}
          isPending={notificationsQuery.isPending}
          isError={notificationsQuery.isError}
          onRetry={() => void notificationsQuery.refetch()}
          onMarkRead={(id) => void markRead.mutateAsync(id)}
          onOpen={openNotification}
        />
      </div>
    </SheetContent>
  );
}
