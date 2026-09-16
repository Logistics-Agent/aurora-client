import type { RefObject } from "react";

import { Check, History } from "lucide-react";

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
  onResolve,
  onReassign,
  onUnassign,
  onHistory,
  reassignButtonRef,
  unassignButtonRef,
  historyButtonRef,
}: ThreadHeaderProps): React.JSX.Element {
  const readOnly =
    Boolean(thread.assigneeId) && thread.assigneeId !== currentUserId && !permissions.canReassign;

  return (
    <header className="grid shrink-0 gap-3 border-b border-border pb-3">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="font-heading truncate text-xl font-semibold">{thread.subject}</h1>
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            v{thread.version}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge
          label={thread.status.replaceAll("_", " ")}
          intent={statusIntent[thread.status]}
          className="h-6 px-2.5 text-sm"
        />
        {thread.draft ? (
          <StatusBadge label="Draft" intent="neutral" className="h-6 px-2.5 text-sm" />
        ) : null}
      </div>

      <div className="grid gap-3 rounded-lg border border-border bg-muted/20 p-3 text-sm sm:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]">
        <div className="grid gap-3">
          <div className="grid gap-1">
            <span className="text-xs text-muted-foreground">From</span>
            {mailbox ? (
              <MailboxIdentity address={mailbox.senderAddress} label="Shared sender" />
            ) : null}
          </div>
          <div className="grid gap-1">
            <span className="text-xs text-muted-foreground">To</span>
            <div className="grid gap-0.5">
              {thread.participants.map((participant) => (
                <span key={participant.email} className="break-all">
                  {participant.email}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div
          role="separator"
          aria-orientation="vertical"
          className="hidden w-px bg-border sm:block"
        />
        <div className="grid gap-3">
          <div className="grid gap-1">
            <span className="text-xs text-muted-foreground">Assignee</span>
            <span className="font-medium">{thread.assigneeId ?? "Unassigned"}</span>
            {readOnly ? <span className="text-xs text-muted-foreground">Read-only</span> : null}
          </div>
          <div className="grid gap-1">
            <span className="text-xs text-muted-foreground">Message ID</span>
            <span className="text-xs break-all text-muted-foreground">{thread.id}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {permissions.canClaim ? <Button onClick={onClaim}>Take thread</Button> : null}
        <Button variant="outline" disabled={!permissions.canResolve} onClick={onResolve}>
          <Check />
          Mark resolved
        </Button>
        {permissions.canReassign ? (
          <Button ref={reassignButtonRef} variant="outline" onClick={onReassign}>
            Reassign thread
          </Button>
        ) : null}
        {permissions.canUnassign ? (
          <Button ref={unassignButtonRef} variant="outline" onClick={onUnassign}>
            Release to unassigned
          </Button>
        ) : null}
        <Button ref={historyButtonRef} variant="outline" onClick={onHistory}>
          <History />
          View assignment history
        </Button>
      </div>
    </header>
  );
}
