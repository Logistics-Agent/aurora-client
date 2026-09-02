"use client";

import { useRouter } from "next/navigation";
import { WorkspaceCard } from "@/components/common";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useNotificationsQuery } from "@/hooks/queries/notifications/use-notifications-query";
import { useNotificationMutations } from "@/hooks/mutations/notifications/use-notification-mutations";
import { safeNotificationPath } from "../utils/fcm-payload";
import { FcmPermissionControl } from "../components/fcm-permission-control";
import { NotificationEmptyState } from "../components/notification-empty-state";
import { NotificationList } from "../components/notification-list";

export function NotificationCenterPage() {
  const router = useRouter();
  const notificationsQuery = useNotificationsQuery(
    { page: 1, pageSize: 20, unreadOnly: false },
  );
  const { markRead, markAllRead } = useNotificationMutations();

  return (
    <>
      <PageHeader
        title="Notification Center"
        description="Persistent shipment and document events for your workspace."
        actions={
          <Button
            type="button"
            variant="outline"
            disabled={markAllRead.isPending}
            onClick={() => void markAllRead.mutateAsync()}
          >
            {markAllRead.isPending ? "Marking read…" : "Mark all read"}
          </Button>
        }
      />
      <WorkspaceCard>
        <div className="space-y-5">
          <FcmPermissionControl />
          {notificationsQuery.isPending && (
            <p className="text-sm text-muted-foreground">
              Loading notifications…
            </p>
          )}
          {notificationsQuery.isError && (
            <div className="space-y-2" role="alert">
              <p className="text-sm text-red-700">
                Unable to load notifications.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void notificationsQuery.refetch()}
              >
                Retry
              </Button>
            </div>
          )}
          {notificationsQuery.isSuccess &&
            notificationsQuery.data.notifications.length === 0 && (
              <NotificationEmptyState />
            )}
          {notificationsQuery.isSuccess &&
            notificationsQuery.data.notifications.length > 0 && (
              <NotificationList
                notifications={notificationsQuery.data.notifications}
                onMarkRead={(id) => void markRead.mutateAsync(id)}
                onOpen={(actionUrl) => {
                  const path = safeNotificationPath(actionUrl ?? undefined);
                  if (path) router.push(path);
                }}
              />
            )}
        </div>
      </WorkspaceCard>
    </>
  );
}
