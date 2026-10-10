"use client";

import { useEffect } from "react";

import { EmptyState } from "@/components/common";
import { QueueNavigation } from "./components/queue-navigation";
import { ThreadFilters } from "./components/thread-filters";
import { ThreadList } from "./components/thread-list";
import type { MailInboxProps } from "./types";

export function MailInbox(): React.JSX.Element;
export function MailInbox(props: MailInboxProps): React.JSX.Element;
export function MailInbox(props?: MailInboxProps): React.JSX.Element {
  if (!props) {
    return (
      <section aria-label="Mail inbox">
        <EmptyState
          title="No mail selected"
          description="Mailbox queues and conversation previews will appear here."
        />
      </section>
    );
  }

  return <ConfiguredMailInbox {...props} />;
}

function ConfiguredMailInbox(props: MailInboxProps): React.JSX.Element {
  const {
    filters,
    onFiltersChange,
    showAllThreads,
    showQueueNavigation = true,
    showThreadList = true,
  } = props;
  const effectiveQueue = filters.queue === "all" && !showAllThreads ? "unassigned" : filters.queue;

  useEffect(() => {
    if (effectiveQueue !== filters.queue) {
      onFiltersChange({ ...filters, queue: effectiveQueue });
    }
  }, [effectiveQueue, filters, onFiltersChange]);

  const displayedThreads = filters.queue === "all" && !showAllThreads ? [] : props.threads;

  return (
    <section
      aria-label="Mail inbox"
      className={`grid h-full min-h-0 grid-cols-1 overflow-hidden rounded-xl border border-border bg-card ${showQueueNavigation ? "lg:grid-cols-[200px_minmax(0,1fr)]" : ""}`}
    >
      {showQueueNavigation ? (
        <div className="h-full min-h-0 overflow-y-auto border-r border-border/40">
          <QueueNavigation
            activeQueue={effectiveQueue}
            counts={props.queueCounts}
            onQueueChange={(queue) => onFiltersChange({ ...filters, queue })}
            showAllThreads={props.showAllThreads}
            onComposeClick={props.onComposeClick}
          />
        </div>
      ) : null}
      {showThreadList ? (
        <div
          id="mail-thread-panel"
          role="tabpanel"
          aria-labelledby={`mail-queue-${effectiveQueue}-tab`}
          className="flex flex-col min-h-0 min-w-0 h-full overflow-hidden border-t border-border lg:border-t-0"
        >
          <div className="shrink-0 border-b border-border/40">
            <ThreadFilters
              filters={props.filters}
              mailboxes={props.mailboxes}
              onFiltersChange={props.onFiltersChange}
              onRefresh={props.onRetry}
              isRefreshing={props.isLoading}
            />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <ThreadList
              canClaim={props.canClaim}
              currentUserId={props.currentUserId}
              error={props.error}
              isLoading={props.isLoading}
              mailboxes={props.mailboxes}
              onClaim={props.onClaim}
              onRetry={props.onRetry}
              onThreadSelect={props.onThreadSelect}
              selectedThreadId={props.selectedThreadId}
              threads={displayedThreads}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
