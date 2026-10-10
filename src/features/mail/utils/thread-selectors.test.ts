import { describe, expect, it } from "vitest";

import { createMailThreadFixture } from "../mock/factories";
import type { MailListFilters, MailResourceScope } from "../types";
import {
  selectVisibleMailboxes,
  selectVisibleThreads,
} from "./thread-selectors";

const mailboxScope: MailResourceScope = {
  accessibleMailboxIds: ["mailbox-operations", "mailbox-support"],
  permissions: ["mail:thread:read_all"],
};

const allFilters: MailListFilters = { queue: "all" };

const threads = [
  createMailThreadFixture({
    id: "thread-unassigned-01",
    mailboxId: "mailbox-operations",
    subject: "Booking confirmation for Aurora",
    assigneeId: null,
    status: "unassigned",
    priority: "urgent",
  }),
  createMailThreadFixture({
    id: "thread-mine-02",
    mailboxId: "mailbox-operations",
    subject: "Container departure update",
    assigneeId: "staff-01",
    status: "in_progress",
    priority: "high",
    draft: { body: "Draft reply", updatedAt: "2026-09-04T09:00:00.000Z" },
  }),
  createMailThreadFixture({
    id: "thread-other-03",
    mailboxId: "mailbox-support",
    subject: "Damaged pallet claim",
    assigneeId: "staff-02",
    status: "waiting_customer",
    priority: "normal",
  }),
  createMailThreadFixture({
    id: "thread-out-of-scope-04",
    mailboxId: "mailbox-finance",
    subject: "Invoice question",
    assigneeId: "staff-01",
    status: "resolved",
    priority: "low",
  }),
];

describe("mail thread selectors", () => {
  it("limits mailboxes and all threads to the caller resource scope", () => {
    expect(
      selectVisibleMailboxes(
        ["mailbox-operations", "mailbox-support", "mailbox-finance"],
        mailboxScope,
      ),
    ).toEqual(["mailbox-operations", "mailbox-support"]);

    expect(
      selectVisibleThreads(threads, allFilters, "staff-01", mailboxScope).map(
        (thread) => thread.id,
      ),
    ).toEqual([
      "thread-unassigned-01",
      "thread-mine-02",
      "thread-other-03",
    ]);
  });

  it("uses resource scope only to filter records, not to authorize the all queue", () => {
    const mailboxOnlyScope: MailResourceScope = {
      accessibleMailboxIds: ["mailbox-operations", "mailbox-support"],
      permissions: [],
    };

    expect(
      selectVisibleThreads(threads, allFilters, "staff-01", mailboxOnlyScope).map(
        (thread) => thread.id,
      ),
    ).toEqual([
      "thread-unassigned-01",
      "thread-mine-02",
      "thread-other-03",
    ]);
  });

  it("selects unassigned, mine, and drafts queues by their literal thread IDs", () => {
    expect(
      selectVisibleThreads(
        threads,
        { queue: "unassigned" },
        "staff-01",
        mailboxScope,
      ).map((thread) => thread.id),
    ).toEqual(["thread-unassigned-01"]);

    expect(
      selectVisibleThreads(
        threads,
        { queue: "mine" },
        "staff-01",
        mailboxScope,
      ).map((thread) => thread.id),
    ).toEqual(["thread-mine-02"]);

    expect(
      selectVisibleThreads(
        threads,
        { queue: "drafts" },
        "staff-01",
        mailboxScope,
      ).map((thread) => thread.id),
    ).toEqual(["thread-mine-02"]);
  });

  it("combines status, priority, and case-insensitive search without mutating input", () => {
    const originalIds = threads.map((thread) => thread.id);

    expect(
      selectVisibleThreads(
        threads,
        {
          queue: "all",
          status: "in_progress",
          priority: "high",
          search: "CONTAINER",
        },
        "staff-01",
        mailboxScope,
      ).map((thread) => thread.id),
    ).toEqual(["thread-mine-02"]);

    expect(threads.map((thread) => thread.id)).toEqual(originalIds);
  });
});
