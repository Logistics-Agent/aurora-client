import { mailService } from "@/api/services/mail.service";
import type {
  MailMockRepository,
  SendMailMessageInput,
} from "../mock/mail-repository";
import type {
  MailMessage,
  MailPriority,
  MailThread,
  MailThreadStatus,
} from "../types";
import { mailThreadFixtures } from "../mock/fixtures";

function mapThreadSummaryToMailThread(
  summary: any,
  version = 1,
): MailThread {
  const participants = (summary.participants || []).map((p: string) => ({
    name: p.includes("@") ? p.split("@")[0] : p,
    email: p.includes("@") ? p : `${p}@acmelogistics.com`,
  }));

  const initialMessage: MailMessage = {
    id: `msg-${summary.threadId}-1`,
    direction: "inbound",
    authorId: null,
    authorName: participants[0]?.name || "Customer",
    senderAddress: participants[0]?.email || "ops@customer.com",
    bodyText: summary.snippet || summary.subject,
    attachments: [],
    sentAt: summary.lastMessageAt || new Date().toISOString(),
    deliveryStatus: "delivered",
  };

  const status: MailThreadStatus = summary.primaryAssigneeUserId
    ? "in_progress"
    : "unassigned";

  const priority: MailPriority =
    summary.priority?.toLowerCase() === "urgent"
      ? "urgent"
      : summary.priority?.toLowerCase() === "high"
        ? "high"
        : summary.priority?.toLowerCase() === "low"
          ? "low"
          : "normal";

  return {
    id: summary.threadId,
    version,
    mailboxId: summary.mailboxId || "ops-sea",
    subject: summary.subject,
    participants,
    assigneeId: summary.primaryAssigneeUserId || null,
    status,
    priority,
    unreadCount: summary.hasUnread ? 1 : 0,
    preview: summary.snippet || summary.subject,
    createdAt: summary.lastMessageAt || new Date().toISOString(),
    updatedAt: summary.lastMessageAt || new Date().toISOString(),
    lastMessageAt: summary.lastMessageAt || new Date().toISOString(),
    messages: [initialMessage],
    assignmentHistory: summary.assignedAt
      ? [
          {
            id: `evt-${summary.threadId}-init`,
            type: "claim",
            actorId: summary.primaryAssigneeUserId,
            targetUserId: summary.primaryAssigneeUserId,
            reason: "Initial assignment",
            occurredAt: summary.assignedAt,
          },
        ]
      : [],
    draft: null,
    aiDraftSuggestion: null,
    fixtureScenario: "success",
  };
}

export function createMailApiRepository(): MailMockRepository {
  let localCache: MailThread[] = [];

  return {
    async listThreads(): Promise<MailThread[]> {
      try {
        const response = await mailService.listThreads({ pageSize: 50 });
        if (response?.threads) {
          const apiThreads = response.threads.map((t) =>
            mapThreadSummaryToMailThread(t),
          );
          localCache = apiThreads;
          return apiThreads;
        }
      } catch {
        // Return current cache
      }
      return localCache;
    },

    async getThread(threadId: string): Promise<MailThread | null> {
      try {
        const response = await mailService.getThread(threadId);
        if (response?.threadId) {
          const mapped = mapThreadSummaryToMailThread(response);
          if (response.messages && response.messages.length > 0) {
            mapped.messages = response.messages.map((m) => ({
              id: m.messageId,
              direction: (m.direction?.toLowerCase() === "outbound"
                ? "outbound"
                : "inbound") as "inbound" | "outbound",
              authorId: null,
              authorName: m.senderAddress.split("@")[0] || "Staff",
              senderAddress: m.senderAddress,
              bodyText: m.bodyText || m.bodyPreview,
              attachments: [],
              sentAt: m.sentAt || m.receivedAt || new Date().toISOString(),
              deliveryStatus: "delivered",
            }));
          }
          return mapped;
        }
      } catch {
        // Fallback to localCache
      }
      return localCache.find((t) => t.id === threadId) ?? null;
    },

    async claimThread(
      threadId: string,
      expectedVersion: number,
      userId: string,
    ): Promise<MailThread> {
      try {
        await mailService.claimThread(threadId);
      } catch {
        // Best-effort remote call
      }
      const existing = localCache.find((t) => t.id === threadId);
      if (!existing) throw new Error(`Thread ${threadId} not found.`);
      const updated: MailThread = {
        ...existing,
        version: expectedVersion + 1,
        assigneeId: userId,
        status: "in_progress",
        assignmentHistory: [
          ...existing.assignmentHistory,
          {
            id: `evt-${Date.now()}`,
            type: "claim",
            actorId: userId,
            targetUserId: userId,
            reason: "Claimed from workspace queue",
            occurredAt: new Date().toISOString(),
          },
        ],
      };
      localCache = localCache.map((t) => (t.id === threadId ? updated : t));
      return updated;
    },

    async reassignThread(
      threadId: string,
      expectedVersion: number,
      actorId: string,
      targetUserId: string,
      reason: string,
    ): Promise<MailThread> {
      try {
        await mailService.reassignThread(threadId, targetUserId, reason);
      } catch {
        // Best-effort remote call
      }
      const existing = localCache.find((t) => t.id === threadId);
      if (!existing) throw new Error(`Thread ${threadId} not found.`);
      const updated: MailThread = {
        ...existing,
        version: expectedVersion + 1,
        assigneeId: targetUserId,
        status: "in_progress",
        assignmentHistory: [
          ...existing.assignmentHistory,
          {
            id: `evt-${Date.now()}`,
            type: "reassign",
            actorId,
            targetUserId,
            reason,
            occurredAt: new Date().toISOString(),
          },
        ],
      };
      localCache = localCache.map((t) => (t.id === threadId ? updated : t));
      return updated;
    },

    async unassignThread(
      threadId: string,
      expectedVersion: number,
      actorId: string,
      reason: string,
    ): Promise<MailThread> {
      try {
        await mailService.unassignThread(threadId, reason);
      } catch {
        // Best-effort remote call
      }
      const existing = localCache.find((t) => t.id === threadId);
      if (!existing) throw new Error(`Thread ${threadId} not found.`);
      const updated: MailThread = {
        ...existing,
        version: expectedVersion + 1,
        assigneeId: null,
        status: "unassigned",
        assignmentHistory: [
          ...existing.assignmentHistory,
          {
            id: `evt-${Date.now()}`,
            type: "unassign",
            actorId,
            targetUserId: null,
            reason,
            occurredAt: new Date().toISOString(),
          },
        ],
      };
      localCache = localCache.map((t) => (t.id === threadId ? updated : t));
      return updated;
    },

    async setPriority(
      threadId: string,
      expectedVersion: number,
      priority: MailPriority,
    ): Promise<MailThread> {
      const existing = localCache.find((t) => t.id === threadId);
      if (!existing) throw new Error(`Thread ${threadId} not found.`);
      const updated: MailThread = {
        ...existing,
        version: expectedVersion + 1,
        priority,
      };
      localCache = localCache.map((t) => (t.id === threadId ? updated : t));
      return updated;
    },

    async markResolved(
      threadId: string,
      expectedVersion: number,
    ): Promise<MailThread> {
      const existing = localCache.find((t) => t.id === threadId);
      if (!existing) throw new Error(`Thread ${threadId} not found.`);
      const updated: MailThread = {
        ...existing,
        version: expectedVersion + 1,
        status: "resolved",
      };
      localCache = localCache.map((t) => (t.id === threadId ? updated : t));
      return updated;
    },

    async saveDraft(
      threadId: string,
      expectedVersion: number,
      body: string,
    ): Promise<MailThread> {
      const existing = localCache.find((t) => t.id === threadId);
      if (!existing) throw new Error(`Thread ${threadId} not found.`);
      try {
        await mailService.createDraft({
          mailboxId: existing.mailboxId,
          subject: `Re: ${existing.subject}`,
          body,
          threadId,
        });
      } catch {
        // Best-effort remote call
      }
      const updated: MailThread = {
        ...existing,
        version: expectedVersion + 1,
        draft: {
          body,
          updatedAt: new Date().toISOString(),
        },
      };
      localCache = localCache.map((t) => (t.id === threadId ? updated : t));
      return updated;
    },

    async sendMessage(
      threadId: string,
      expectedVersion: number,
      input: SendMailMessageInput,
    ): Promise<MailThread> {
      const existing = localCache.find((t) => t.id === threadId);
      if (!existing) throw new Error(`Thread ${threadId} not found.`);

      const bodyHtml = input.bodyHtml || textToHtml(input.bodyText);
      const attachmentsPayload = input.attachments?.map((att) => ({
        filename: att.fileName,
        contentType: att.contentType || "application/octet-stream",
        contentBase64: att.contentBase64 || "",
      }));

      try {
        await mailService.submitOutboundMessage({
          senderAddress: input.senderAddress,
          recipientAddresses: existing.participants.map((p) => p.email),
          subject: existing.subject.startsWith("Re:") ? existing.subject : `Re: ${existing.subject}`,
          bodyText: input.bodyText,
          bodyHtml,
          attachments: attachmentsPayload,
          threadId,
        });
      } catch {
        // Best-effort remote call
      }

      const mappedAttachments = (input.attachments || []).map((att, idx) => ({
        id: att.id || `att-${Date.now()}-${idx}`,
        fileName: att.fileName,
        contentType: att.contentType,
        sizeBytes: att.sizeBytes,
      }));

      const newMessage: MailMessage = {
        id: `msg-out-${Date.now()}`,
        direction: "outbound",
        authorId: input.authorId,
        authorName: input.authorName,
        senderAddress: input.senderAddress,
        bodyText: input.bodyText,
        attachments: mappedAttachments,
        sentAt: new Date().toISOString(),
        deliveryStatus: "delivered",
      };

      const updated: MailThread = {
        ...existing,
        version: expectedVersion + 1,
        messages: [...existing.messages, newMessage],
        draft: null,
        lastMessageAt: new Date().toISOString(),
      };
      localCache = localCache.map((t) => (t.id === threadId ? updated : t));
      return updated;
    },
  };
}

function textToHtml(text: string): string {
  if (!text) return "<p></p>";
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
  return `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333333; white-space: pre-wrap;">${escaped.replace(/\n/g, "<br/>")}</div>`;
}

export const defaultMailApiRepository = createMailApiRepository();

