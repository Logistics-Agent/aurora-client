import { describe, expect, it } from "vitest";

import {
  parseMailboxListResponseDto,
  parseOutboundMessageResponseDto,
  parseProcessedMessageListResponseDto,
  parseQuarantineListResponseDto,
  parseThreadDetailResponseDto,
  parseThreadListResponseDto,
} from "./mail.dto";

const timestamp = "2026-09-14T01:00:00.000Z";
const mailbox = {
  mailboxId: "mailbox-01",
  domainId: "domain-01",
  domainName: "guardm.space",
  localPart: "operations",
  fullAddress: "operations@guardm.space",
  status: "Active",
  createdAt: timestamp,
};

describe("mail DTO parsers", () => {
  it("parses tenant mailboxes and pagination", () => {
    const result = parseMailboxListResponseDto({
      mailboxes: [mailbox],
      nextPageToken: null,
    });

    expect(result.mailboxes[0]?.fullAddress).toBe("operations@guardm.space");
  });

  it("parses thread details without fabricating messages or assignment data", () => {
    const result = parseThreadDetailResponseDto({
      threadId: "thread-01",
      mailboxId: "mailbox-01",
      subject: "Shipment update",
      participants: ["customer@example.com"],
      messages: [
        {
          messageId: "message-01",
          direction: "Inbound",
          senderAddress: "customer@example.com",
          recipientAddresses: ["operations@guardm.space"],
          subject: "Shipment update",
          bodyText: "Please confirm ETA.",
          bodyPreview: "Please confirm ETA.",
          replyToMessageId: "",
          receivedAt: timestamp,
          sentAt: timestamp,
        },
      ],
      drafts: [],
      createdAt: timestamp,
      updatedAt: timestamp,
      primaryAssigneeUserId: null,
      assignedAt: null,
      status: "InProgress",
      priority: "High",
      assignmentHistory: [],
    });

    expect(result.messages).toHaveLength(1);
    expect(result.primaryAssigneeUserId).toBeNull();
  });

  it("parses processed message security metadata", () => {
    const result = parseProcessedMessageListResponseDto({
      messages: [
        {
          processedMessageId: "processed-01",
          messageId: "message-01",
          direction: "Inbound",
          senderAddress: "customer@example.com",
          recipientAddresses: ["operations@guardm.space"],
          subject: "Shipment update",
          receivedAt: timestamp,
          processedAt: timestamp,
          emailCategory: "Operational",
          pipelineStatus: "Completed",
          spamScore: 0.01,
          phishingScore: 0.02,
          isQuarantined: false,
          r2RawEmlPath: "tenants/tenant-01/mail/message-01.eml",
          securityChecks: [
            {
              stage: "ClamAv",
              result: "Passed",
              detailJson: "{}",
              durationMs: 12,
            },
          ],
        },
      ],
      nextPageToken: null,
    });

    expect(result.messages[0]?.securityChecks[0]?.stage).toBe("ClamAv");
  });

  it("parses quarantine records and preserves nullable review metadata", () => {
    const result = parseQuarantineListResponseDto({
      records: [
        {
          quarantineId: "quarantine-01",
          processedMessageId: "processed-01",
          messageId: "message-01",
          quarantineReason: "Phishing risk",
          quarantinedAt: timestamp,
          status: "Pending",
          reviewedBy: null,
          reviewedAt: null,
        },
      ],
      nextPageToken: null,
    });

    expect(result.records[0]?.reviewedAt).toBeNull();
  });

  it("rejects malformed external mail data", () => {
    expect(() => parseThreadListResponseDto({ threads: [{ threadId: 1 }] })).toThrow();
  });

  it("accepts a Brevo outbound response without a Stalwart queue id", () => {
    const result = parseOutboundMessageResponseDto({
      processedMessageId: "01a0b916-d981-7a5b-878a-bb2c6a3325dc",
      stalwartQueueId: "",
      submittedAt: timestamp,
    });

    expect(result.stalwartQueueId).toBe("");
  });
});
