"use client";

import type { ReactNode } from "react";

import { EmptyState, LoadingState } from "@/components/common";
import type { UserProfile } from "@/types/auth.types";
import { hasMailPermission } from "../utils/mail-permissions";

export interface MailAccessStateProps {
  user: UserProfile | null;
  isLoading: boolean;
  children: ReactNode;
}

export function MailAccessState({
  user,
  isLoading,
  children,
}: MailAccessStateProps): React.JSX.Element {
  if (!user || !user.isAuthenticated) {
    return (
      <section aria-label="Mail access">
        <EmptyState
          title="Sign in to access Mail"
          description="Your authenticated operations account is required to view shared mail."
        />
      </section>
    );
  }

  if (isLoading) {
    return <LoadingState label="Loading Mail workspace" />;
  }

  if (!user.tenantId) {
    return (
      <section aria-label="Mail access">
        <EmptyState
          title="Tenant context required"
          description="Mail is available to tenant Staff and Manager accounts only."
        />
      </section>
    );
  }

  if (user.role !== "STAFF" && user.role !== "MANAGER") {
    return (
      <section aria-label="Mail access">
        <EmptyState
          title="Mail access unavailable"
          description="This Mail workspace is limited to Staff and Manager accounts."
        />
      </section>
    );
  }

  if (!hasMailPermission(user, "mail:read")) {
    return (
      <section aria-label="Mail access">
        <EmptyState
          title="Mail access denied"
          description="Your account does not have the direct mail:read permission."
        />
      </section>
    );
  }

  return <>{children}</>;
}
