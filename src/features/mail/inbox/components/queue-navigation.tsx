"use client";

import { useRef } from "react";

import type { MailQueueScope } from "../../types";
import type { MailQueueCounts } from "../types";

export interface QueueNavigationProps {
  activeQueue: MailQueueScope;
  counts: MailQueueCounts;
  onQueueChange: (queue: MailQueueScope) => void;
  showAllThreads: boolean;
}

const queueItems: readonly {
  queue: MailQueueScope;
  label: string;
}[] = [
  { queue: "unassigned", label: "Unassigned" },
  { queue: "mine", label: "My Work" },
  { queue: "all", label: "All Threads" },
  { queue: "drafts", label: "Drafts" },
];

export function QueueNavigation({
  activeQueue,
  counts,
  onQueueChange,
  showAllThreads,
}: QueueNavigationProps): React.JSX.Element {
  const tabs = queueItems.filter((item) => item.queue !== "all" || showAllThreads);
  const tabRefs = useRef<Partial<Record<MailQueueScope, HTMLButtonElement | null>>>({});
  const selectedQueue = tabs.some((item) => item.queue === activeQueue)
    ? activeQueue
    : tabs[0].queue;

  function activateQueue(queue: MailQueueScope): void {
    onQueueChange(queue);
    tabRefs.current[queue]?.focus();
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    queue: MailQueueScope,
  ): void {
    const currentIndex = tabs.findIndex((item) => item.queue === queue);
    const nextIndex =
      event.key === "ArrowUp"
        ? (currentIndex - 1 + tabs.length) % tabs.length
        : event.key === "ArrowDown"
          ? (currentIndex + 1) % tabs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : undefined;

    if (nextIndex === undefined) return;
    event.preventDefault();
    activateQueue(tabs[nextIndex].queue);
  }

  return (
    <nav aria-label="Mail queues" className="border-b border-border p-3 lg:border-r lg:border-b-0">
      <div role="tablist" aria-orientation="vertical" className="flex gap-1 overflow-x-auto lg:flex-col">
        {tabs.map((item) => {
            const isActive = selectedQueue === item.queue;
            const label = `${item.label} ${counts[item.queue]}`;

            return (
              <button
                key={item.queue}
                type="button"
                role="tab"
                id={`mail-queue-${item.queue}-tab`}
                ref={(element) => {
                  tabRefs.current[item.queue] = element;
                }}
                aria-label={label}
                aria-selected={isActive}
                aria-controls="mail-thread-panel"
                tabIndex={isActive ? 0 : -1}
                className={`flex min-w-max items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm font-medium outline-none transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
                onClick={() => activateQueue(item.queue)}
                onKeyDown={(event) => handleKeyDown(event, item.queue)}
              >
                <span>{item.label}</span>
                <span aria-hidden="true" className="text-xs tabular-nums">
                  {counts[item.queue]}
                </span>
              </button>
            );
          })}
      </div>
    </nav>
  );
}
