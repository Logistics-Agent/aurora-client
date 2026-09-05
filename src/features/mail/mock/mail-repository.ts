// UI-only fixture until backend integration phase.
import type {
  AssignmentEvent,
  MailFixtureScenario,
  MailMessage,
  MailPriority,
  MailThread,
} from "../types";

export interface SendMailMessageInput {
  authorId: string;
  authorName: string;
  senderAddress: string;
  bodyText: string;
}

export interface MailMockRepository {
  listThreads(): Promise<MailThread[]>;
  getThread(threadId: string): Promise<MailThread | null>;
  claimThread(
    threadId: string,
    expectedVersion: number,
    userId: string,
  ): Promise<MailThread>;
  reassignThread(
    threadId: string,
    expectedVersion: number,
    actorId: string,
    targetUserId: string,
    reason: string,
  ): Promise<MailThread>;
  unassignThread(
    threadId: string,
    expectedVersion: number,
    actorId: string,
    reason: string,
  ): Promise<MailThread>;
  setPriority(
    threadId: string,
    expectedVersion: number,
    priority: MailPriority,
  ): Promise<MailThread>;
  markResolved(threadId: string, expectedVersion: number): Promise<MailThread>;
  saveDraft(
    threadId: string,
    expectedVersion: number,
    body: string,
  ): Promise<MailThread>;
  sendMessage(
    threadId: string,
    expectedVersion: number,
    input: SendMailMessageInput,
  ): Promise<MailThread>;
}

export type MailRepositoryError =
  | { status: 403; code: "CROSS_STAFF_REPLY_FORBIDDEN" }
  | { status: 409; code: "THREAD_ALREADY_ASSIGNED" }
  | { status: 409; code: "THREAD_VERSION_CONFLICT" }
  | { status: 502; code: "OUTBOUND_DELIVERY_FAILED" };

const TRANSITION_TIME = "2026-09-04T10:00:00.000Z";

export function createMailMockRepository(
  seed: readonly MailThread[],
): MailMockRepository {
  const threads = new Map(seed.map((thread) => [thread.id, copyThread(thread)]));
  let sequence = 0;

  async function boundary(): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }

  function nextTimestamp(): string {
    sequence += 1;
    return sequence === 1
      ? TRANSITION_TIME
      : `2026-09-04T10:00:${String(sequence - 1).padStart(2, "0")}.000Z`;
  }

  function readThread(threadId: string): MailThread {
    const thread = threads.get(threadId);
    if (!thread) throw new Error(`Mail thread ${threadId} was not found.`);
    return thread;
  }

  function requireVersion(thread: MailThread, expectedVersion: number): void {
    if (thread.version !== expectedVersion) {
      throw { status: 409, code: "THREAD_VERSION_CONFLICT" } satisfies MailRepositoryError;
    }
  }

  function replace(thread: MailThread, changes: Partial<MailThread>): MailThread {
    const updated = copyThread({
      ...thread,
      ...changes,
      version: thread.version + 1,
      updatedAt: nextTimestamp(),
    });
    threads.set(updated.id, updated);
    return copyThread(updated);
  }

  function event(
    threadId: string,
    type: AssignmentEvent["type"],
    actorId: string,
    targetUserId: string | null,
    reason: string | null,
  ): AssignmentEvent {
    return {
      id: `${threadId}-assignment-${sequence + 1}`,
      type,
      actorId,
      targetUserId,
      reason,
      occurredAt: nextTimestamp(),
    };
  }

  return {
    async listThreads() {
      await boundary();
      return Array.from(threads.values(), copyThread);
    },

    async getThread(threadId) {
      await boundary();
      const thread = threads.get(threadId);
      return thread ? copyThread(thread) : null;
    },

    async claimThread(threadId, expectedVersion, userId) {
      await boundary();
      const thread = readThread(threadId);
      if (
        thread.version !== expectedVersion ||
        thread.assigneeId !== null ||
        isScenarioEnabled(thread, "THREAD_ALREADY_ASSIGNED")
      ) {
        throw {
          status: 409,
          code: "THREAD_ALREADY_ASSIGNED",
        } satisfies MailRepositoryError;
      }

      return replace(thread, {
        assigneeId: userId,
        status: "in_progress",
        assignmentHistory: [
          ...thread.assignmentHistory,
          event(thread.id, "claim", userId, userId, null),
        ],
      });
    },

    async reassignThread(threadId, expectedVersion, actorId, targetUserId, reason) {
      await boundary();
      const normalizedReason = reason.trim();
      if (!normalizedReason) throw new Error("Reassignment reason is required.");
      const thread = readThread(threadId);
      requireVersion(thread, expectedVersion);

      return replace(thread, {
        assigneeId: targetUserId,
        status: "in_progress",
        assignmentHistory: [
          ...thread.assignmentHistory,
          event(thread.id, "reassign", actorId, targetUserId, normalizedReason),
        ],
      });
    },

    async unassignThread(threadId, expectedVersion, actorId, reason) {
      await boundary();
      const thread = readThread(threadId);
      requireVersion(thread, expectedVersion);

      return replace(thread, {
        assigneeId: null,
        status: "unassigned",
        assignmentHistory: [
          ...thread.assignmentHistory,
          event(thread.id, "unassign", actorId, null, reason.trim() || null),
        ],
      });
    },

    async setPriority(threadId, expectedVersion, priority) {
      await boundary();
      const thread = readThread(threadId);
      requireVersion(thread, expectedVersion);
      return replace(thread, { priority });
    },

    async markResolved(threadId, expectedVersion) {
      await boundary();
      const thread = readThread(threadId);
      requireVersion(thread, expectedVersion);
      return replace(thread, { status: "resolved" });
    },

    async saveDraft(threadId, expectedVersion, body) {
      await boundary();
      const thread = readThread(threadId);
      requireVersion(thread, expectedVersion);
      return replace(thread, { draft: { body, updatedAt: TRANSITION_TIME } });
    },

    async sendMessage(threadId, expectedVersion, input) {
      await boundary();
      const thread = readThread(threadId);
      requireVersion(thread, expectedVersion);
      if (isScenarioEnabled(thread, "CROSS_STAFF_REPLY_FORBIDDEN")) {
        throw {
          status: 403,
          code: "CROSS_STAFF_REPLY_FORBIDDEN",
        } satisfies MailRepositoryError;
      }
      if (isScenarioEnabled(thread, "OUTBOUND_DELIVERY_FAILED")) {
        throw {
          status: 502,
          code: "OUTBOUND_DELIVERY_FAILED",
        } satisfies MailRepositoryError;
      }

      const sentAt = nextTimestamp();
      const message: MailMessage = {
        id: `${thread.id}-message-${sequence}`,
        direction: "outbound",
        authorId: input.authorId,
        authorName: input.authorName,
        senderAddress: input.senderAddress,
        bodyText: input.bodyText,
        attachments: [],
        sentAt,
        deliveryStatus: "delivered",
      };

      return replace(thread, {
        messages: [...thread.messages, message],
        draft: null,
        preview: input.bodyText,
        lastMessageAt: sentAt,
      });
    },
  };
}

function isScenarioEnabled(
  thread: MailThread,
  scenario: MailFixtureScenario,
): boolean {
  return thread.fixtureScenario === scenario;
}

function copyThread(thread: MailThread): MailThread {
  return {
    ...thread,
    participants: thread.participants.map((participant) => ({ ...participant })),
    messages: thread.messages.map((message) => ({
      ...message,
      attachments: message.attachments.map((attachment) => ({ ...attachment })),
    })),
    assignmentHistory: thread.assignmentHistory.map((item) => ({ ...item })),
    draft: thread.draft ? { ...thread.draft } : null,
    aiDraftSuggestion: thread.aiDraftSuggestion
      ? {
          ...thread.aiDraftSuggestion,
          evidenceLabels: [...thread.aiDraftSuggestion.evidenceLabels],
          commercialParameters: { ...thread.aiDraftSuggestion.commercialParameters },
        }
      : null,
  };
}
