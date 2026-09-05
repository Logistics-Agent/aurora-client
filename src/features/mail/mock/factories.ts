// UI-only fixture until backend integration phase.
import type {
  MailMessage,
  MailPersonaFixture,
  MailThread,
} from "../types";

export function createMailMessageFixture(
  overrides: Partial<MailMessage> = {},
): MailMessage {
  return {
    id: "message-fixture-01",
    direction: "inbound",
    authorId: null,
    authorName: "Jordan Lee",
    senderAddress: "jordan.lee@example.test",
    bodyText: "Please confirm the booking details.",
    attachments: [],
    sentAt: "2026-09-04T08:00:00.000Z",
    deliveryStatus: "delivered",
    ...overrides,
  };
}

export function createMailThreadFixture(
  overrides: Partial<MailThread> = {},
): MailThread {
  return {
    id: "thread-fixture-01",
    version: 1,
    mailboxId: "mailbox-operations",
    subject: "Fixture mail thread",
    participants: [{ name: "Jordan Lee", email: "jordan.lee@example.test" }],
    assigneeId: null,
    status: "unassigned",
    priority: "normal",
    unreadCount: 1,
    preview: "Please confirm the booking details.",
    createdAt: "2026-09-04T08:00:00.000Z",
    updatedAt: "2026-09-04T08:00:00.000Z",
    lastMessageAt: "2026-09-04T08:00:00.000Z",
    messages: [createMailMessageFixture()],
    assignmentHistory: [],
    draft: null,
    aiDraftSuggestion: null,
    fixtureScenario: "success",
    ...overrides,
  };
}

export function createMailPersonaFixture(
  overrides: Partial<MailPersonaFixture> = {},
): MailPersonaFixture {
  return {
    userId: "staff-01",
    name: "Avery Staff",
    email: "avery.staff@example.test",
    role: "STAFF",
    permissions: ["mail:read", "mail:thread:claim", "mail:draft:create", "mail:send"],
    resourceScope: {
      accessibleMailboxIds: ["mailbox-operations"],
      permissions: ["mail:read", "mail:thread:claim", "mail:draft:create", "mail:send"],
    },
    ...overrides,
  };
}
