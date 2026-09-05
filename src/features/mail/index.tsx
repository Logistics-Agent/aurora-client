"use client";

import type { UserProfile } from "@/types/auth.types";
import { MailWorkspace, type MailWorkspaceProps } from "./components/mail-workspace";
import { createMailMockRepository, type MailMockRepository } from "./mock/mail-repository";
import { mailPersonaFixtures, mailThreadFixtures } from "./mock/fixtures";
import type { MailResourceScope } from "./types";

export interface MailPageProps {
  initialThreadId?: string;
  user?: UserProfile | null;
  resourceScope?: MailResourceScope;
  repository?: MailMockRepository;
}

const defaultPersona = mailPersonaFixtures[0];
const defaultUser: UserProfile = {
  userId: defaultPersona.userId,
  tenantId: "tenant-01",
  name: defaultPersona.name,
  email: defaultPersona.email,
  role: defaultPersona.role,
  permissions: [...defaultPersona.permissions],
  isAuthenticated: true,
};
const defaultRepository = createMailMockRepository(mailThreadFixtures);

export function MailPage({
  initialThreadId,
  user = defaultUser,
  resourceScope = defaultPersona.resourceScope,
  repository = defaultRepository,
}: MailPageProps): React.JSX.Element {
  const props: MailWorkspaceProps = { user, resourceScope, initialThreadId, repository };
  return <MailWorkspace {...props} />;
}

export { MailWorkspace } from "./components/mail-workspace";
export { MailAccessState } from "./components/mail-access-state";
