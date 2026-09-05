"use client";

import { MailboxIdentity, StatusBadge } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";

import type { MailMailbox, MailThread } from "../../types";

export interface ThreadCardProps {
  canClaim: boolean;
  currentUserId: string;
  isSelected: boolean;
  mailbox?: MailMailbox;
  onClaim: (threadId: string) => void;
  onSelect: (threadId: string) => void;
  thread: MailThread;
}

const statusDetails = {
  unassigned: { label: "Unassigned", intent: "neutral" },
  in_progress: { label: "In progress", intent: "info" },
  waiting_customer: { label: "Waiting for customer", intent: "warning" },
  resolved: { label: "Resolved", intent: "success" },
} as const;

export function ThreadCard({
  canClaim,
  currentUserId,
  isSelected,
  mailbox,
  onClaim,
  onSelect,
  thread,
}: ThreadCardProps): React.JSX.Element {
  const unreadLabel = `${thread.unreadCount} unread`;
  const canQuickClaim = canClaim && thread.assigneeId === null;
  const customer = thread.participants[0];
  const customerLabel = customer
    ? `Customer: ${customer.name} <${customer.email}>`
    : "Customer: Unavailable";
  const assigneeLabel =
    thread.assigneeId === null
      ? "Assignee: Unassigned"
      : thread.assigneeId === currentUserId
        ? "Assignee: You"
        : `Assignee: ${thread.assigneeId}`;
  const relativeLastMessage = formatRelativeTime(thread.lastMessageAt);
  const exactLastMessage = formatExactUtcTimestamp(thread.lastMessageAt);

  return (
    <li className={`border-b border-border ${isSelected ? "bg-muted" : "hover:bg-muted/60"}`}>
      <button
        type="button"
        aria-label={`Select ${thread.subject}`}
        aria-pressed={isSelected}
        className="block w-full cursor-pointer p-3 text-left outline-none transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        onClick={() => onSelect(thread.id)}
      >
        <span className="flex items-start justify-between gap-3">
          <span className={`min-w-0 truncate text-sm ${thread.unreadCount > 0 ? "font-semibold" : "font-medium"}`}>
          {thread.subject}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">v{thread.version}</span>
        </span>
        <span className="mt-1 block line-clamp-2 text-sm text-muted-foreground">{thread.preview}</span>
        <span className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge {...statusDetails[thread.status]} />
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Flag aria-hidden="true" className="size-3" />
            {capitalize(thread.priority)}
          </span>
          {thread.unreadCount > 0 ? <span className="text-xs font-medium">{unreadLabel}</span> : null}
          {thread.draft ? <span className="text-xs text-muted-foreground">Draft</span> : null}
        </span>
        <span className="mt-2 block text-xs text-muted-foreground">{customerLabel}</span>
        <time
          dateTime={thread.lastMessageAt}
          title={`Last message at ${exactLastMessage}`}
          className="mt-1 block text-xs text-muted-foreground"
        >
          Last message: {relativeLastMessage}
        </time>
        <span className="mt-1 block text-xs text-muted-foreground">{assigneeLabel}</span>
      </button>
      {mailbox ? (
        <div className="px-3 pb-2">
          <MailboxIdentity address={mailbox.senderAddress} label={mailbox.displayName} />
        </div>
      ) : null}
      {canQuickClaim ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mx-3 mb-3"
          aria-label={`Claim ${thread.subject}`}
          onClick={() => onClaim(thread.id)}
        >
          Claim
        </Button>
      ) : null}
    </li>
  );
}

function capitalize(value: string): string {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}

function formatRelativeTime(timestamp: string, now = new Date()): string {
  const elapsedMilliseconds = Math.max(0, now.getTime() - new Date(timestamp).getTime());
  const elapsedMinutes = Math.floor(elapsedMilliseconds / 60_000);

  if (elapsedMinutes < 1) return "Just now";
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}h ago`;

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `${elapsedDays}d ago`;
}

function formatExactUtcTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getUTCMonth()];
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${day} ${month} ${date.getUTCFullYear()}, ${hours}:${minutes} UTC`;
}
