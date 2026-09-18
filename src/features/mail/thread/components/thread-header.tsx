import type { RefObject } from "react";
import { useMemo } from "react";
import { Check, Clock, History } from "lucide-react";

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

  const customerEmails = useMemo(() => {
    const fromMessages = thread.messages
      .filter((m) => !mailbox || m.senderAddress.toLowerCase() !== mailbox.senderAddress.toLowerCase())
      .map((m) => m.senderAddress);

    const fromParticipants = thread.participants
      .filter((p) => !mailbox || p.email.toLowerCase() !== mailbox.senderAddress.toLowerCase())
      .map((p) => p.email);

    const merged = Array.from(new Set([...fromMessages, ...fromParticipants]));
    return merged.length > 0 ? merged : (thread.participants[0]?.email ? [thread.participants[0].email] : []);
  }, [thread.messages, thread.participants, mailbox]);

  const firstMessage = thread.messages[0];
  const isInbound = firstMessage ? firstMessage.direction === "inbound" : true;

  const formattedDateTime = useMemo(() => {
    const raw = thread.lastMessageAt || thread.updatedAt || thread.createdAt;
    if (!raw) return "";
    try {
      return new Date(raw).toLocaleString("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return raw;
    }
  }, [thread.lastMessageAt, thread.updatedAt, thread.createdAt]);

  return (
    <header className="grid shrink-0 gap-2.5 border-b border-border pb-2.5">
      {/* Top row: Subject, version, Status Badge, and Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h1 className="font-heading truncate text-lg font-semibold text-foreground">
            {thread.subject}
          </h1>
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            v{thread.version}
          </span>
          <StatusBadge
            label={thread.status.replaceAll("_", " ")}
            intent={statusIntent[thread.status]}
            className="h-6 px-2.5 text-sm"
          />
          {thread.draft ? (
            <StatusBadge label="Draft" intent="neutral" className="h-6 px-2.5 text-sm" />
          ) : null}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {permissions.canClaim ? (
            <Button size="sm" className="h-7.5 gap-1 text-xs" onClick={onClaim}>
              Take thread
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="outline"
            className="h-7.5 gap-1 text-xs"
            disabled={!permissions.canResolve}
            onClick={onResolve}
          >
            <Check className="size-3.5" />
            Mark resolved
          </Button>
          {permissions.canReassign ? (
            <Button
              ref={reassignButtonRef}
              size="sm"
              variant="outline"
              className="h-7.5 text-xs"
              onClick={onReassign}
            >
              Reassign thread
            </Button>
          ) : null}
          {permissions.canUnassign ? (
            <Button
              ref={unassignButtonRef}
              size="sm"
              variant="outline"
              className="h-7.5 text-xs"
              onClick={onUnassign}
            >
              Release to unassigned
            </Button>
          ) : null}
          <Button
            ref={historyButtonRef}
            size="sm"
            variant="outline"
            className="h-7.5 gap-1.5 text-xs"
            onClick={onHistory}
          >
            <History className="size-3.5" />
            View assignment history
          </Button>
        </div>
      </div>

      {/* Compact metadata info bar */}
      <div className="grid gap-2 rounded-lg border border-border/70 bg-muted/20 p-2.5 text-xs sm:grid-cols-[minmax(0,1fr)_1px_minmax(0,auto)]">
        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4">
          {isInbound ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground font-medium">From</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {customerEmails.map((email) => (
                    <span key={email} className="font-semibold text-foreground break-all">
                      {email}
                    </span>
                  ))}
                </div>
              </div>

              {mailbox ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground font-medium">To</span>
                  <MailboxIdentity address={mailbox.senderAddress} label="Shared mailbox" />
                </div>
              ) : null}
            </>
          ) : (
            <>
              {mailbox ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground font-medium">From</span>
                  <MailboxIdentity address={mailbox.senderAddress} label="Shared sender" />
                </div>
              ) : null}

              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground font-medium">To</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {customerEmails.map((email) => (
                    <span key={email} className="font-semibold text-foreground break-all">
                      {email}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div
          role="separator"
          aria-orientation="vertical"
          className="hidden w-px bg-border sm:block"
        />

        <div className="flex flex-wrap items-center justify-end gap-y-1 gap-x-3 text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span>Assignee:</span>
            <span className="font-medium text-foreground">
              {thread.assigneeId ?? "Unassigned"}
            </span>
            {readOnly ? <span className="text-xs text-muted-foreground">Read-only</span> : null}
          </div>

          {formattedDateTime ? (
            <div className="flex items-center gap-1 border-l border-border/60 pl-3">
              <Clock className="size-3 text-muted-foreground" />
              <span>{formattedDateTime}</span>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
