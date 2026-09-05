"use client";

import { EmptyState, ErrorState, LoadingState } from "@/components/common";
import { Button } from "@/components/ui/button";
import type { MailMailbox, MailThread } from "../../types";
import { ThreadCard } from "./thread-card";

export interface ThreadListProps {
  canClaim: boolean;
  currentUserId: string;
  error: unknown;
  isLoading: boolean;
  mailboxes: readonly MailMailbox[];
  onClaim: (threadId: string) => void;
  onRetry: () => void;
  onThreadSelect: (threadId: string) => void;
  selectedThreadId?: string;
  threads: readonly MailThread[];
}

export function ThreadList({
  canClaim,
  currentUserId,
  error,
  isLoading,
  mailboxes,
  onClaim,
  onRetry,
  onThreadSelect,
  selectedThreadId,
  threads,
}: ThreadListProps): React.JSX.Element {
  if (isLoading) return <LoadingState label="Loading mail threads" />;

  if (error) {
    return (
      <div className="space-y-3">
        <ErrorState
          title="Mail threads unavailable"
          description="Try loading this mailbox again."
        />
        <Button type="button" variant="outline" onClick={onRetry} aria-label="Retry mail threads">
          Retry
        </Button>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <EmptyState
        title="No threads in this queue"
        description="Try another queue or adjust the filters."
      />
    );
  }

  return (
    <ul aria-label="Mail threads" className="min-h-0 overflow-y-auto">
      {threads.map((thread) => (
        <ThreadCard
          key={thread.id}
          canClaim={canClaim}
          currentUserId={currentUserId}
          isSelected={selectedThreadId === thread.id}
          mailbox={mailboxes.find((mailbox) => mailbox.id === thread.mailboxId)}
          onClaim={onClaim}
          onSelect={onThreadSelect}
          thread={thread}
        />
      ))}
    </ul>
  );
}
