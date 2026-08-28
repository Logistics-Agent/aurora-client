"use client";

import { Bell, Check } from "lucide-react";
import { StatusBadge, WorkspaceCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CustomerPageHeading } from "../components/customer-page-heading";
import { useCustomerPortalStore } from "../stores/use-customer-portal-store";

const groups = ["Today", "Yesterday"] as const;

export function NotificationsPage() {
  const notifications = useCustomerPortalStore((state) => state.notifications);
  const preferences = useCustomerPortalStore((state) => state.preferences);
  const markNotificationRead = useCustomerPortalStore(
    (state) => state.markNotificationRead,
  );
  const togglePreference = useCustomerPortalStore(
    (state) => state.togglePreference,
  );

  return (
    <>
      <CustomerPageHeading
        title="Notifications"
        description="Customer-visible shipment, document and billing updates."
      />
      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-5">
          {groups.map((group) => (
            <section
              key={group}
              aria-labelledby={`notifications-${group.toLowerCase()}`}
            >
              <h2
                id={`notifications-${group.toLowerCase()}`}
                className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {group}
              </h2>
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                {notifications
                  .filter((notification) => notification.group === group)
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-3 border-b border-border p-4 last:border-b-0"
                    >
                      <span className="rounded-lg bg-secondary p-2 text-primary">
                        <Bell className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{notification.title}</p>
                          {!notification.read && (
                            <StatusBadge label="New" intent="info" />
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {notification.category} · {notification.detail}
                        </p>
                      </div>
                      {!notification.read ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markNotificationRead(notification.id)}
                          aria-label={`Mark ${notification.title} as read`}
                        >
                          <Check className="size-4" />
                        </Button>
                      ) : null}
                    </div>
                  ))}
              </div>
            </section>
          ))}
        </div>
        <WorkspaceCard title="Preferences">
          <div className="space-y-5">
            {preferences.map((preference) => (
              <div key={preference.event}>
                <p className="text-sm font-medium">{preference.event}</p>
                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                  <span>In-app</span>
                  <Switch
                    checked={preference.inApp}
                    onCheckedChange={() =>
                      togglePreference(preference.event, "inApp")
                    }
                    aria-label={`In-app notifications for ${preference.event}`}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                  <span>Email</span>
                  <Switch
                    checked={preference.email}
                    onCheckedChange={() =>
                      togglePreference(preference.event, "email")
                    }
                    aria-label={`Email notifications for ${preference.event}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </WorkspaceCard>
      </div>
    </>
  );
}
