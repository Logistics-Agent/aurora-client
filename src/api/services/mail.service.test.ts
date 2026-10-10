import { afterEach, describe, expect, it, vi } from "vitest";

import { CONTROLLERS } from "@/configs/api";
import { api } from "@/lib/api";

import { mailService } from "./mail.service";

afterEach(() => vi.restoreAllMocks());

const timestamp = "2026-09-14T01:00:00.000Z";

const threadListResponse = {
  threads: [],
  nextPageToken: null,
  hasMore: false,
};

describe("mail API service", () => {
  it("uses canonical controller paths and parses thread lists", async () => {
    const get = vi.spyOn(api, "get").mockResolvedValue(threadListResponse as never);

    const result = await mailService.listThreads({ pageSize: 20 });

    expect(get).toHaveBeenCalledWith(CONTROLLERS.mail.threads, {
      params: { pageSize: 20 },
    });
    expect(result.threads).toEqual([]);
  });

  it("loads tenant mailboxes from the Staff API", async () => {
    const get = vi.spyOn(api, "get").mockResolvedValue({
      mailboxes: [],
      nextPageToken: null,
    } as never);

    await mailService.listMailboxes({ pageSize: 100 });

    expect(get).toHaveBeenCalledWith(CONTROLLERS.mail.mailboxes, {
      params: { pageSize: 100 },
    });
  });

  it("uses the real Staff draft and outbound contracts", async () => {
    const post = vi.spyOn(api, "post").mockImplementation(async (url) => {
      if (url === CONTROLLERS.mail.drafts) {
        return {
          draftId: "draft-01",
          draftRootId: "draft-root-01",
          revisionNumber: 1,
          isLatestRevision: true,
          source: "Manual",
          status: "Draft",
          mailboxId: "mailbox-01",
          assignedStaffId: null,
          subject: "Re: Shipment update",
          body: "Reply",
          contentHash: "hash",
          createdAt: timestamp,
          to: ["customer@example.com"],
          threadId: "thread-01",
          replyToMessageId: null,
        };
      }

      return {
        processedMessageId: "processed-01",
        stalwartQueueId: "queue-01",
        submittedAt: timestamp,
      };
    });

    await mailService.createDraft({
      mailboxId: "mailbox-01",
      subject: "Re: Shipment update",
      body: "Reply",
      idempotencyKey: "draft-request-01",
    });
    await mailService.submitOutboundMessage({
      senderAddress: "operations@guardm.space",
      recipientAddresses: ["customer@example.com"],
      subject: "Re: Shipment update",
      bodyText: "Reply",
      idempotencyKey: "send-request-01",
    });

    expect(post).toHaveBeenNthCalledWith(1, CONTROLLERS.mail.drafts, {
      mailboxId: "mailbox-01",
      subject: "Re: Shipment update",
      body: "Reply",
      idempotencyKey: "draft-request-01",
    });
    expect(post).toHaveBeenNthCalledWith(2, CONTROLLERS.mail.outboundMessages, {
      senderAddress: "operations@guardm.space",
      recipientAddresses: ["customer@example.com"],
      subject: "Re: Shipment update",
      bodyText: "Reply",
      idempotencyKey: "send-request-01",
    });
  });
});
