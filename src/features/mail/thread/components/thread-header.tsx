import type { RefObject } from "react";

import { MailboxIdentity } from "@/components/common/mail";
import { StatusBadge } from "@/components/common";
import { Button } from "@/components/ui/button";
import type { MailMailbox, MailPriority, MailThread } from "../../types";

export interface ThreadHeaderPermissions {
  canClaim: boolean;
  canSetPriority: boolean;
  canResolve: boolean;
  canReassign: boolean;
  canUnassign: boolean;
}

export interface ThreadHeaderProps {
  thread: MailThread;
  mailbox?: MailMailbox;
  currentUserId?: string;
  permissions: ThreadHeaderPermissions;
  onClaim?: () => void;
  onPriorityChange?: (priority: MailPriority) => void;
  onResolve?: () => void;
  onReassign?: () => void;
  onUnassign?: () => void;
  onHistory?: () => void;
  reassignButtonRef?: RefObject<HTMLButtonElement | null>;
  unassignButtonRef?: RefObject<HTMLButtonElement | null>;
  historyButtonRef?: RefObject<HTMLButtonElement | null>;
}

const statusIntent = {
  unassigned: "neutral",
  in_progress: "info",
  waiting_customer: "warning",
  resolved: "success",
} as const;

export function ThreadHeader({
  thread,
  mailbox,
  currentUserId,
  permissions,
  onClaim,
  onPriorityChange,
  onResolve,
  onReassign,
  onUnassign,
  onHistory,
  reassignButtonRef,
  unassignButtonRef,
  historyButtonRef,
}: ThreadHeaderProps): React.JSX.Element {
  const readOnly =
    Boolean(thread.assigneeId) &&
    thread.assigneeId !== currentUserId &&
    !permissions.canReassign;

  return (
    <header className="grid gap-4 border-b border-border pb-4">
      <div className="grid gap-1">
        <h1 className="font-heading text-xl font-semibold">{thread.subject}</h1>
        <p className="text-sm text-muted-foreground">Version {thread.version}</p>
      </div>
      <div className="grid gap-2 text-sm">
        {mailbox ? (
          <div>
            <p>Shared sender: {mailbox.senderAddress}</p>
            <MailboxIdentity address={mailbox.senderAddress} label="Shared sender" />
          </div>
        ) : null}
        <div>
          {thread.participants.map((participant) => (
            <p key={participant.email}>Recipient: {participant.name} &lt;{participant.email}&gt;</p>
          ))}
        </div>
        <p>Assignee: {thread.assigneeId ?? "Unassigned"}</p>
        {readOnly ? <p>Read-only: assigned to {thread.assigneeId}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge label={thread.status.replaceAll("_", " ")} intent={statusIntent[thread.status]} />
        <label className="flex items-center gap-2" htmlFor={`thread-${thread.id}-priority`}>
          <span>Priority</span>
          <select
            id={`thread-${thread.id}-priority`}
            value={thread.priority}
            disabled={!permissions.canSetPriority}
            onChange={(event) => onPriorityChange?.(event.target.value as MailPriority)}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        {permissions.canClaim ? <Button onClick={onClaim}>Take thread</Button> : null}
        <Button variant="outline" disabled={!permissions.canResolve} onClick={onResolve}>
          Mark resolved
        </Button>
        {permissions.canReassign ? (
          <Button ref={reassignButtonRef} variant="outline" onClick={onReassign}>Reassign thread</Button>
        ) : null}
        {permissions.canUnassign ? (
          <Button ref={unassignButtonRef} variant="outline" onClick={onUnassign}>Release to unassigned</Button>
        ) : null}
        <Button ref={historyButtonRef} variant="ghost" onClick={onHistory}>View assignment history</Button>
      </div>
    </header>
  );
}
