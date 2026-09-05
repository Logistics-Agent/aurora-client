"use client";

import type { ReactNode } from "react";

import { EmptyState, LoadingState } from "@/components/common";
import { hasPermission, type UserProfile } from "@/types/auth.types";

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

  if (!hasPermission(user, "mail:read")) {
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
