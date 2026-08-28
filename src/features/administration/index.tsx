import { AiExecutionDetailPage as AiExecutionDetailComposition } from "./ai-execution-detail";
import { AiOperationsPage as AiOperationsComposition } from "./ai-operations";
import { AuditLogPage as AuditLogComposition } from "./audit-log";
import { RolesPage as RolesComposition } from "./roles";
import { TenantSettingsPage as TenantSettingsComposition } from "./tenant-settings";
import { UsersPage as UsersComposition } from "./users";

export function UsersPage() {
  return <UsersComposition />;
}

export function RolesPage() {
  return <RolesComposition />;
}

export function TenantSettingsPage() {
  return <TenantSettingsComposition />;
}

export function AuditLogPage() {
  return <AuditLogComposition />;
}

export function AiOperationsPage() {
  return <AiOperationsComposition />;
}

export function AiExecutionDetailPage({
  executionId,
}: {
  executionId: string;
}) {
  return <AiExecutionDetailComposition executionId={executionId} />;
}
