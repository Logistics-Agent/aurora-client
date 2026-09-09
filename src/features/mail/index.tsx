"use client";

import { useCurrentUserQuery } from "@/hooks/queries/auth/use-current-user-query";
import type { UserProfile } from "@/types/auth.types";
import { MailWorkspace, type MailWorkspaceProps } from "./components/mail-workspace";
import { defaultMailApiRepository } from "./services/mail-api-repository";
import type { MailMockRepository } from "./mock/mail-repository";
import type { MailResourceScope } from "./types";

export interface MailPageProps {
  initialThreadId?: string;
  user?: UserProfile | null;
  resourceScope?: MailResourceScope;
  repository?: MailMockRepository;
}

const defaultRepository = defaultMailApiRepository;

const defaultResourceScope: MailResourceScope = {
  accessibleMailboxIds: ["mailbox-operations", "mailbox-support"],
  permissions: [
    "mail:read",
    "mail:thread:claim",
    "mail:thread:reassign",
    "mail:thread:unassign",
    "mail:draft:create",
    "mail:send",
  ],
};

export function MailPage({
  initialThreadId,
  user: explicitUser,
  resourceScope: explicitResourceScope,
  repository = defaultRepository,
}: MailPageProps): React.JSX.Element {
  const { data: currentUser } = useCurrentUserQuery();

  const user: UserProfile = explicitUser ?? (currentUser
    ? {
        userId: currentUser.userId,
        tenantId: currentUser.tenantId || "default-tenant",
        name: currentUser.name || currentUser.email || "Staff Member",
        email: currentUser.email,
        role: currentUser.role || "STAFF",
        permissions: currentUser.permissions ? [...currentUser.permissions] : [...defaultResourceScope.permissions],
        isAuthenticated: true,
      }
    : {
        userId: "anonymous",
        tenantId: "default-tenant",
        name: "Anonymous Staff",
        email: "staff@aurora.internal",
        role: "STAFF",
        permissions: [...defaultResourceScope.permissions],
        isAuthenticated: true,
      });

  const resourceScope: MailResourceScope =
    explicitResourceScope &&
    typeof explicitResourceScope === "object" &&
    Array.isArray(explicitResourceScope.accessibleMailboxIds)
      ? explicitResourceScope
      : {
          accessibleMailboxIds: defaultResourceScope.accessibleMailboxIds,
          permissions: user.permissions ?? defaultResourceScope.permissions,
        };

  const props: MailWorkspaceProps = { user, resourceScope, initialThreadId, repository };
  return <MailWorkspace {...props} />;
}

export { MailWorkspace } from "./components/mail-workspace";
export { MailAccessState } from "./components/mail-access-state";
