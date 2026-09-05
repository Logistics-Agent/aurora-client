import { afterEach, describe, expect, it, vi } from "vitest";

import { createMailThreadFixture } from "./factories";
import { createMailMockRepository } from "./mail-repository";

describe("MailMockRepository", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("crosses a deterministic zero-delay boundary before returning fixture data", async () => {
    vi.useFakeTimers();
    const repository = createMailMockRepository([]);

    const pendingThreads = repository.listThreads();

    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(0);
    await expect(pendingThreads).resolves.toEqual([]);
  });

  it("returns immutable claim transitions with a version increment and assignment event", async () => {
    const seed = createMailThreadFixture({
      id: "thread-claim-01",
      version: 4,
      assigneeId: null,
      status: "unassigned",
    });
    const repository = createMailMockRepository([seed]);

    const claimed = await repository.claimThread("thread-claim-01", 4, "staff-01");

    expect(claimed).toMatchObject({
      id: "thread-claim-01",
      assigneeId: "staff-01",
      status: "in_progress",
      version: 5,
    });
    expect(claimed.assignmentHistory).toHaveLength(1);
    expect(claimed.assignmentHistory[0]).toMatchObject({
      type: "claim",
      actorId: "staff-01",
      targetUserId: "staff-01",
      reason: null,
    });
    expect(seed).toMatchObject({ assigneeId: null, status: "unassigned", version: 4 });
    expect(seed.assignmentHistory).toEqual([]);
    expect(claimed).not.toBe(seed);
  });

  it("isolates nested list snapshots from later repository reads", async () => {
    const repository = createMailMockRepository([
      createMailThreadFixture({
        id: "thread-snapshot-01",
        messages: [
          {
            id: "message-snapshot-01",
            direction: "inbound",
            authorId: null,
            authorName: "Jordan Lee",
            senderAddress: "jordan.lee@example.test",
            bodyText: "Original body",
            attachments: [
              {
                id: "attachment-01",
                fileName: "original.pdf",
                contentType: "application/pdf",
                sizeBytes: 42,
              },
            ],
            sentAt: "2026-09-04T08:00:00.000Z",
            deliveryStatus: "delivered",
          },
        ],
      }),
    ]);

    await repository.claimThread("thread-snapshot-01", 1, "staff-01");
    const snapshot = (await repository.listThreads())[0];
    snapshot.messages[0].bodyText = "Tampered body";
    snapshot.messages[0].attachments[0].fileName = "tampered.pdf";
    snapshot.assignmentHistory[0].actorId = "tampered-user";

    await expect(repository.getThread("thread-snapshot-01")).resolves.toMatchObject({
      messages: [
        {
          bodyText: "Original body",
          attachments: [{ fileName: "original.pdf" }],
        },
      ],
      assignmentHistory: [{ actorId: "staff-01" }],
    });
  });

  it("rejects a claim when the expected version or ownership is stale", async () => {
    const repository = createMailMockRepository([
      createMailThreadFixture({ id: "thread-conflict-01", version: 2 }),
    ]);

    await repository.claimThread("thread-conflict-01", 2, "staff-01");

    await expect(
      repository.claimThread("thread-conflict-01", 2, "staff-02"),
    ).rejects.toEqual({ status: 409, code: "THREAD_ALREADY_ASSIGNED" });
  });

  it("requires a reason and appends a reassign history event", async () => {
    const repository = createMailMockRepository([
      createMailThreadFixture({
        id: "thread-reassign-01",
        version: 7,
        assigneeId: "staff-01",
        status: "in_progress",
      }),
    ]);

    await expect(
      repository.reassignThread("thread-reassign-01", 7, "manager-01", "staff-02", "   "),
    ).rejects.toThrow("Reassignment reason is required.");

    const reassigned = await repository.reassignThread(
      "thread-reassign-01",
      7,
      "manager-01",
      "staff-02",
      "Coverage handoff",
    );

    expect(reassigned).toMatchObject({ assigneeId: "staff-02", version: 8 });
    expect(reassigned.assignmentHistory).toHaveLength(1);
    expect(reassigned.assignmentHistory[0]).toMatchObject({
      type: "reassign",
      actorId: "manager-01",
      targetUserId: "staff-02",
      reason: "Coverage handoff",
    });
  });

  it("retains the saved draft when the explicit delivery-failure scenario rejects send", async () => {
    const repository = createMailMockRepository([
      createMailThreadFixture({
        id: "thread-send-failure-01",
        version: 3,
        assigneeId: "staff-01",
        status: "in_progress",
        fixtureScenario: "OUTBOUND_DELIVERY_FAILED",
      }),
    ]);
    const saved = await repository.saveDraft("thread-send-failure-01", 3, "Please retry.");

    await expect(
      repository.sendMessage("thread-send-failure-01", saved.version, {
        authorId: "staff-01",
        authorName: "Avery Staff",
        senderAddress: "operations@example.test",
        bodyText: "Please retry.",
      }),
    ).rejects.toEqual({ status: 502, code: "OUTBOUND_DELIVERY_FAILED" });

    await expect(repository.getThread("thread-send-failure-01")).resolves.toMatchObject({
      version: 4,
      draft: { body: "Please retry." },
    });
  });

  it("appends an attributed outbound message and clears the sent draft", async () => {
    const repository = createMailMockRepository([
      createMailThreadFixture({
        id: "thread-send-success-01",
        version: 1,
        assigneeId: "staff-01",
        status: "in_progress",
        draft: { body: "Confirming the shared mailbox reply.", updatedAt: "2026-09-04T08:00:00.000Z" },
      }),
    ]);

    const sent = await repository.sendMessage("thread-send-success-01", 1, {
      authorId: "staff-01",
      authorName: "Avery Staff",
      senderAddress: "operations@example.test",
      bodyText: "Confirming the shared mailbox reply.",
    });

    expect(sent).toMatchObject({ version: 2, draft: null });
    expect(sent.messages.at(-1)).toMatchObject({
      direction: "outbound",
      authorId: "staff-01",
      authorName: "Avery Staff",
      senderAddress: "operations@example.test",
      bodyText: "Confirming the shared mailbox reply.",
      deliveryStatus: "delivered",
    });
  });
});
