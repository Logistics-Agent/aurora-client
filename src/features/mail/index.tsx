"use client";

import { useCurrentUserQuery } from "@/hooks/queries/auth/use-current-user-query";
import { EmptyState, LoadingState } from "@/components/common";
import type { UserProfile } from "@/types/auth.types";
import { MailWorkspace, type MailWorkspaceProps } from "./components/mail-workspace";
import type { MailMockRepository } from "./mock/mail-repository";
import type { MailResourceScope } from "./types";

export interface MailPageProps {
  initialThreadId?: string;
  user?: UserProfile | null;
  resourceScope?: MailResourceScope;
  repository?: MailMockRepository;
}

const defaultResourceScope: MailResourceScope = {
  accessibleMailboxIds: [],
  permissions: [],
};

export function MailPage({
  initialThreadId,
  user: explicitUser,
  resourceScope: explicitResourceScope,
  repository,
}: MailPageProps): React.JSX.Element {
  const { data: currentUser, isLoading, isError } = useCurrentUserQuery();

  if (!explicitUser && isLoading) {
    return <LoadingState label="Loading Mail access" />;
  }

  if (!explicitUser && (isError || !currentUser)) {
    return (
      <section aria-label="Mail access">
        <EmptyState
          title="Unable to load Mail access"
          description="Refresh the page after your authenticated operations session is available."
        />
      </section>
    );
  }

  const user: UserProfile | null = explicitUser ?? {
    userId: currentUser!.userId,
    tenantId: currentUser!.tenantId,
    name: currentUser!.name || currentUser!.email || "Staff Member",
    email: currentUser!.email,
    role: currentUser!.role || "STAFF",
    permissions: currentUser!.permissions ? [...currentUser!.permissions] : [],
    isAuthenticated: true,
  };

  const resourceScope: MailResourceScope =
    explicitResourceScope &&
    typeof explicitResourceScope === "object" &&
    Array.isArray(explicitResourceScope.accessibleMailboxIds)
      ? explicitResourceScope
      : {
          accessibleMailboxIds: defaultResourceScope.accessibleMailboxIds,
          permissions: user?.permissions ?? defaultResourceScope.permissions,
        };

  const props: MailWorkspaceProps = { user, resourceScope, initialThreadId, repository };
  return <MailWorkspace {...props} />;
}

export { MailWorkspace } from "./components/mail-workspace";
export { MailAccessState } from "./components/mail-access-state";
export { MailQuarantinePage } from "./quarantine";
