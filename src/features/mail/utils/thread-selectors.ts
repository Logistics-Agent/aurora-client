import type {
  MailListFilters,
  MailMailbox,
  MailResourceScope,
  MailThread,
} from "../types";

export function selectVisibleMailboxes(
  mailboxes: readonly string[],
  resourceScope: MailResourceScope,
): string[];
export function selectVisibleMailboxes<T extends MailMailbox>(
  mailboxes: readonly T[],
  resourceScope: MailResourceScope,
): T[];
export function selectVisibleMailboxes(
  mailboxes: readonly (string | MailMailbox)[],
  resourceScope: MailResourceScope,
): (string | MailMailbox)[] {
  const allowedMailboxIds = new Set(resourceScope.accessibleMailboxIds);

  return mailboxes.filter((mailbox) =>
    allowedMailboxIds.has(typeof mailbox === "string" ? mailbox : mailbox.id),
  );
}

export function selectVisibleThreads(
  threads: readonly MailThread[],
  filters: MailListFilters,
  userId: string,
  resourceScope: MailResourceScope,
): MailThread[] {
  const allowedMailboxIds = new Set(resourceScope.accessibleMailboxIds);
  const search = filters.search?.trim().toLocaleLowerCase();

  return threads.filter((thread) => {
    if (!allowedMailboxIds.has(thread.mailboxId)) return false;
    if (filters.mailboxId && thread.mailboxId !== filters.mailboxId) return false;
    if (filters.status && thread.status !== filters.status) return false;
    if (filters.priority && thread.priority !== filters.priority) return false;
    if (!matchesQueue(thread, filters.queue, userId)) return false;
    if (search && !matchesSearch(thread, search)) return false;

    return true;
  });
}

function matchesQueue(
  thread: MailThread,
  queue: MailListFilters["queue"],
  userId: string,
): boolean {
  switch (queue) {
    case "all":
      return true;
    case "unassigned":
      return thread.assigneeId === null;
    case "mine":
      return thread.assigneeId === userId;
    case "drafts":
      return thread.draft !== null;
  }
}

function matchesSearch(thread: MailThread, search: string): boolean {
  const searchableText = [
    thread.subject,
    thread.preview,
    ...thread.participants.flatMap((participant) => [
      participant.name,
      participant.email,
    ]),
  ]
    .join(" ")
    .toLocaleLowerCase();

  return searchableText.includes(search);
}
