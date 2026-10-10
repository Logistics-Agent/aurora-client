// UI-only fixture until backend integration phase.
import type { MailMailbox, MailPersonaFixture, MailThread } from "../types";
import { createMailPersonaFixture, createMailThreadFixture } from "./factories";

export const mailPersonaFixtures: readonly MailPersonaFixture[] = [
  createMailPersonaFixture(),
  createMailPersonaFixture({
    userId: "manager-restricted-01",
    name: "Morgan Restricted Manager",
    email: "morgan.restricted@example.test",
    role: "MANAGER",
    permissions: ["mail:read", "mail:thread:claim"],
    resourceScope: {
      accessibleMailboxIds: ["mailbox-operations", "mailbox-support"],
      permissions: ["mail:read", "mail:thread:claim"],
    },
  }),
  createMailPersonaFixture({
    userId: "manager-full-01",
    name: "Riley Mail Manager",
    email: "riley.manager@example.test",
    role: "MANAGER",
    permissions: [
      "mail:read",
      "mail:thread:read_all",
      "mail:thread:claim",
      "mail:thread:reassign",
      "mail:thread:unassign",
      "mail:draft:create",
      "mail:send",
    ],
    resourceScope: {
      accessibleMailboxIds: ["mailbox-operations", "mailbox-support"],
      permissions: [
        "mail:read",
        "mail:thread:read_all",
        "mail:thread:claim",
        "mail:thread:reassign",
        "mail:thread:unassign",
        "mail:draft:create",
        "mail:send",
      ],
    },
  }),
];

export const mailMailboxFixtures: readonly MailMailbox[] = [
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

export const mailThreadFixtures: readonly MailThread[] = [
  createMailThreadFixture({
    id: "thread-success-01",
    subject: "Booking confirmation",
    fixtureScenario: "success",
  }),
  createMailThreadFixture({
    id: "thread-conflict-02",
    subject: "Claim conflict",
    assigneeId: "staff-02",
    status: "in_progress",
    fixtureScenario: "THREAD_ALREADY_ASSIGNED",
  }),
  createMailThreadFixture({
    id: "thread-forbidden-03",
    subject: "Restricted cross-staff reply",
    assigneeId: "staff-02",
    status: "in_progress",
    fixtureScenario: "CROSS_STAFF_REPLY_FORBIDDEN",
  }),
  createMailThreadFixture({
    id: "thread-delivery-failure-04",
    subject: "Outbound delivery failure",
    assigneeId: "staff-01",
    status: "in_progress",
    fixtureScenario: "OUTBOUND_DELIVERY_FAILED",
    messages: [
      {
        id: "message-delivery-failure-04",
        direction: "outbound",
        authorId: "staff-01",
        authorName: "Avery Staff",
        senderAddress: "operations@example.test",
        bodyText: "We are checking the shipment status.",
        attachments: [],
        sentAt: "2026-09-04T09:30:00.000Z",
        deliveryStatus: "failed",
      },
    ],
  }),
];
