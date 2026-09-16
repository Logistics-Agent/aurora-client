"use client";

import { EmptyState, LoadingState } from "@/components/common";
import { useCurrentUserQuery } from "@/hooks/queries/auth/use-current-user-query";
import type { UserProfile } from "@/types/auth.types";
import { hasMailPermission } from "../utils/mail-permissions";
import { MailAccessState } from "../components/mail-access-state";
import { MailQuarantinePanel } from "./components/mail-quarantine-panel";

export function MailQuarantinePage(): React.JSX.Element {
  const { data: currentUser, isLoading, isError } = useCurrentUserQuery();

  if (isLoading) {
    return <LoadingState label="Loading Mail quarantine access" />;
  }

  if (isError || !currentUser) {
    return (
      <section aria-label="Mail quarantine access">
        <EmptyState
          title="Unable to load Mail quarantine access"
          description="Refresh the page after your authenticated operations session is available."
        />
      </section>
    );
  }

  const user: UserProfile = {
    userId: currentUser.userId,
    tenantId: currentUser.tenantId,
    name: currentUser.name || currentUser.email || "Staff Member",
    email: currentUser.email,
    role: currentUser.role || "STAFF",
    permissions: currentUser.permissions ? [...currentUser.permissions] : [],
    isAuthenticated: true,
  };

  if (!hasMailPermission(user, "mail:quarantine:read")) {
    return (
      <section aria-label="Mail quarantine access">
        <EmptyState
          title="Quarantine access denied"
          description="Your account does not have permission to review quarantined messages."
        />
      </section>
    );
  }

  return (
    <MailAccessState user={user} isLoading={false}>
      <div className="grid gap-4">
        <header className="border-b border-border pb-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Aurora Operations
          </p>
          <h1 className="font-heading text-2xl font-semibold">Mail quarantine</h1>
          <p className="text-sm text-muted-foreground">
            Review and release messages held by the mail security pipeline.
          </p>
        </header>
        <section
          aria-label="Mail quarantine"
          className="grid gap-3 rounded-xl border border-border bg-card p-4"
        >
          <div>
            <h2 className="font-heading text-lg font-semibold">Quarantine</h2>
            <p className="text-sm text-muted-foreground">
              Review quarantined messages available to this tenant.
            </p>
          </div>
          <MailQuarantinePanel
            enabled
            canRelease={hasMailPermission(user, "mail:quarantine:release")}
          />
        </section>
      </div>
    </MailAccessState>
  );
}
