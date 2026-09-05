import { useMemo, useState } from "react";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createMailThreadFixture } from "../mock/factories";
import type {
  MailListFilters,
  MailMailbox,
  MailQueueScope,
  MailResourceScope,
  MailThread,
} from "../types";
import { selectVisibleMailboxes, selectVisibleThreads } from "../utils/thread-selectors";
import { MailInbox } from "./index";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const currentUserId = "staff-01";
const resourceScope: MailResourceScope = {
  accessibleMailboxIds: ["mailbox-operations", "mailbox-support"],
  permissions: [],
};
const mailboxes: readonly MailMailbox[] = [
  {
    id: "mailbox-operations",
    displayName: "Operations",
    senderAddress: "operations@example.test",
  },
  {
    id: "mailbox-support",
    displayName: "Customer Support",
    senderAddress: "support@example.test",
  },
  {
    id: "mailbox-finance",
    displayName: "Finance",
    senderAddress: "finance@example.test",
  },
];
const threads: readonly MailThread[] = [
  createMailThreadFixture({
    id: "thread-unassigned",
    subject: "Urgent booking confirmation",
    mailboxId: "mailbox-operations",
    priority: "urgent",
    unreadCount: 2,
    lastMessageAt: "2026-09-04T08:00:00.000Z",
  }),
  createMailThreadFixture({
    id: "thread-mine",
    subject: "My resolved shipment update",
    mailboxId: "mailbox-support",
    assigneeId: currentUserId,
    status: "resolved",
    priority: "high",
    unreadCount: 0,
  }),
  createMailThreadFixture({
    id: "thread-draft",
    subject: "Draft waiting for customer",
    mailboxId: "mailbox-operations",
    assigneeId: currentUserId,
    status: "waiting_customer",
    draft: { body: "A proposed response", updatedAt: "2026-09-04T10:00:00.000Z" },
  }),
  createMailThreadFixture({
    id: "thread-private",
    subject: "Finance must never render",
    mailboxId: "mailbox-finance",
  }),
];

function QueueInbox({
  canClaim = true,
  showAllThreads = false,
  isLoading = false,
  error = null,
  initialFilters = { queue: "unassigned" } as MailListFilters,
  onClaim,
  onRetry,
  onThreadSelect,
}: {
  canClaim?: boolean;
  showAllThreads?: boolean;
  isLoading?: boolean;
  error?: unknown;
  initialFilters?: MailListFilters;
  onClaim?: (threadId: string) => void;
  onRetry?: () => void;
  onThreadSelect?: (threadId: string) => void;
}) {
  const [filters, setFilters] = useState<MailListFilters>(initialFilters);
  const [selectedThreadId, setSelectedThreadId] = useState("thread-unassigned");
  const scopedMailboxes = useMemo(
    () => selectVisibleMailboxes(mailboxes, resourceScope),
    [],
  );
  const visibleThreads = useMemo(
    () => selectVisibleThreads(threads, filters, currentUserId, resourceScope),
    [filters],
  );
  const queueCounts = useMemo(
    () =>
      (Object.keys({
        unassigned: true,
        mine: true,
        all: true,
        drafts: true,
      }) as MailQueueScope[]).reduce<Record<MailQueueScope, number>>(
        (counts, queue) => ({
          ...counts,
          [queue]: selectVisibleThreads(
            threads,
            { queue },
            currentUserId,
            resourceScope,
          ).length,
        }),
        { unassigned: 0, mine: 0, all: 0, drafts: 0 },
      ),
    [],
  );

  return (
    <MailInbox
      currentUserId={currentUserId}
      canClaim={canClaim}
      error={error}
      filters={filters}
      isLoading={isLoading}
      mailboxes={scopedMailboxes}
      onClaim={onClaim ?? (() => undefined)}
      onFiltersChange={setFilters}
      onRetry={onRetry ?? (() => undefined)}
      onThreadSelect={(threadId) => {
        setSelectedThreadId(threadId);
        onThreadSelect?.(threadId);
      }}
      queueCounts={queueCounts}
      selectedThreadId={selectedThreadId}
      showAllThreads={showAllThreads}
      threads={visibleThreads}
    />
  );
}

describe("MailInbox", () => {
  it("renders scoped queue counts and hides All Threads without the direct capability", () => {
    render(<QueueInbox />);

    expect(screen.getByRole("tab", { name: "Unassigned 1" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "My Work 2" })).toBeVisible();
    expect(screen.getByRole("tab", { name: "Drafts 1" })).toBeVisible();
    expect(screen.queryByRole("tab", { name: "All Threads 3" })).not.toBeInTheDocument();
    expect(screen.queryByText("Finance must never render")).not.toBeInTheDocument();
  });

  it("shows and changes to All Threads when its direct capability is present", async () => {
    const user = userEvent.setup();
    render(<QueueInbox showAllThreads />);

    await user.click(screen.getByRole("tab", { name: "All Threads 3" }));

    expect(screen.getByText("Urgent booking confirmation")).toBeVisible();
    expect(screen.getByText("My resolved shipment update")).toBeVisible();
    expect(screen.getByText("Draft waiting for customer")).toBeVisible();
  });

  it("falls back to Unassigned when the All Threads capability is removed", async () => {
    const { rerender } = render(
      <QueueInbox showAllThreads initialFilters={{ queue: "all" }} />,
    );
    expect(screen.getByRole("tab", { name: "All Threads 3" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    rerender(<QueueInbox showAllThreads={false} initialFilters={{ queue: "all" }} />);

    await waitFor(() =>
      expect(screen.getByRole("tab", { name: "Unassigned 1" })).toHaveAttribute(
        "aria-selected",
        "true",
      ),
    );
    expect(screen.queryByRole("tab", { name: "All Threads 3" })).not.toBeInTheDocument();
    expect(document.getElementById("mail-thread-panel")).toHaveAttribute(
      "aria-labelledby",
      "mail-queue-unassigned-tab",
    );
    expect(document.getElementById("mail-queue-unassigned-tab")).toBeInTheDocument();
  });

  it("emits complete mailbox, status, priority, and search filters through visible results", async () => {
    const user = userEvent.setup();
    render(<QueueInbox showAllThreads />);

    await user.click(screen.getByRole("tab", { name: "All Threads 3" }));
    await user.selectOptions(screen.getByLabelText("Mailbox"), "mailbox-support");
    expect(screen.getByText("My resolved shipment update")).toBeVisible();
    expect(screen.queryByText("Urgent booking confirmation")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Status"), "resolved");
    await user.selectOptions(screen.getByLabelText("Priority"), "high");
    await user.type(screen.getByRole("searchbox", { name: "Search threads" }), "shipment");

    expect(screen.getByText("My resolved shipment update")).toBeVisible();
    expect(screen.queryByText("Draft waiting for customer")).not.toBeInTheDocument();
  });

  it("presents operational metadata for the customer, timestamp, ownership, mailbox, status, priority, and version", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-04T10:30:00.000Z"));
    render(<QueueInbox />);

    const selection = screen.getByRole("button", {
      name: "Select Urgent booking confirmation",
    });
    const thread = selection.closest("li");
    expect(selection).toHaveAttribute("aria-pressed", "true");
    expect(thread).not.toBeNull();
    expect(within(thread!).getByText("2 unread")).toBeVisible();
    expect(within(thread!).getByText("Urgent")).toBeVisible();
    expect(within(thread!).getByText("Unassigned")).toBeVisible();
    expect(within(thread!).getByText("v1")).toBeVisible();
    expect(within(thread!).getByText("Customer: Jordan Lee <jordan.lee@example.test>")).toBeVisible();
    expect(within(thread!).getByText("Last message: 2h ago")).toBeVisible();
    expect(within(thread!).getByText("Assignee: Unassigned")).toBeVisible();
    expect(within(thread!).getByText("operations@example.test")).toBeVisible();
  });

  it("uses arrow keys to move and activate queue tabs", async () => {
    const user = userEvent.setup();
    render(<QueueInbox />);
    const unassigned = screen.getByRole("tab", { name: "Unassigned 1" });
    const myWork = screen.getByRole("tab", { name: "My Work 2" });
    const drafts = screen.getByRole("tab", { name: "Drafts 1" });

    unassigned.focus();
    await user.keyboard("{ArrowDown}");
    expect(myWork).toHaveFocus();
    expect(myWork).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("My resolved shipment update")).toBeVisible();

    await user.keyboard("{End}");
    expect(drafts).toHaveFocus();
    expect(drafts).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{Home}");
    expect(unassigned).toHaveFocus();
    expect(unassigned).toHaveAttribute("aria-selected", "true");
  });

  it("selects rows with Enter and Space through their selection buttons", async () => {
    const user = userEvent.setup();
    const selectedThreadIds: string[] = [];
    render(<QueueInbox showAllThreads onThreadSelect={(threadId) => selectedThreadIds.push(threadId)} />);

    await user.click(screen.getByRole("tab", { name: "All Threads 3" }));
    const mine = screen.getByRole("button", { name: "Select My resolved shipment update" });
    mine.focus();
    await user.keyboard("{Enter}");
    expect(selectedThreadIds).toEqual(["thread-mine"]);
    expect(mine).toHaveAttribute("aria-pressed", "true");

    const draft = screen.getByRole("button", { name: "Select Draft waiting for customer" });
    draft.focus();
    await user.keyboard(" ");
    expect(selectedThreadIds).toEqual(["thread-mine", "thread-draft"]);
    expect(draft).toHaveAttribute("aria-pressed", "true");
  });

  it("claims an unassigned thread through its keyboard-operable quick action", async () => {
    const user = userEvent.setup();
    let claimedThreadId: string | undefined;
    render(<QueueInbox onClaim={(threadId) => (claimedThreadId = threadId)} />);

    const claim = screen.getByRole("button", { name: "Claim Urgent booking confirmation" });
    claim.focus();
    await user.keyboard("{Enter}");

    expect(claimedThreadId).toBe("thread-unassigned");
  });

  it("hides quick claim without the direct claim capability and explains an empty filtered queue", () => {
    const { rerender } = render(<QueueInbox canClaim={false} />);
    expect(
      screen.queryByRole("button", { name: "Claim Urgent booking confirmation" }),
    ).not.toBeInTheDocument();

    rerender(
      <QueueInbox
        key="empty-queue"
        initialFilters={{ queue: "unassigned", status: "resolved" }}
      />,
    );
    expect(screen.getByText("No threads in this queue")).toBeVisible();
  });

  it("renders pane-scoped loading, empty, and retryable error states", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<QueueInbox isLoading />);
    expect(screen.getByText("Loading mail threads")).toBeVisible();
    const selectedQueue = screen.getByRole("tab", { name: "Unassigned 1" });
    const panel = document.getElementById("mail-thread-panel");
    expect(selectedQueue).toHaveAttribute("aria-controls", "mail-thread-panel");
    expect(panel).toHaveAttribute("role", "tabpanel");

    rerender(<QueueInbox error={new Error("Mailbox unavailable")} />);
    expect(screen.getByText("Mail threads unavailable")).toBeVisible();
    let retried = false;
    rerender(<QueueInbox error={new Error("Mailbox unavailable")} onRetry={() => (retried = true)} />);
    await user.click(screen.getByRole("button", { name: "Retry mail threads" }));
    expect(retried).toBe(true);
  });
});
