"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import { mailKeys } from "@/api/query-keys/mail.keys";
import { useMailMutations } from "@/hooks/mutations/mail/use-mail-mutations";
import { useMailboxesQuery } from "@/hooks/queries/mail/use-mailboxes-query";
import { useMailThreadQuery } from "@/hooks/queries/mail/use-mail-thread-query";
import { useMailThreadsQuery } from "@/hooks/queries/mail/use-mail-threads-query";
import { useMailDraftsQuery } from "@/hooks/queries/mail/use-mail-drafts-query";
import type { UserProfile } from "@/types/auth.types";
import { hasMailPermission } from "./utils/mail-permissions";
import type {
  Mailbox,
  ThreadDetailApiResponse,
  ThreadMessageApiDto,
  ThreadSummaryApiDto,
} from "@/dto/mail/mail.dto";
import type {
  MailListFilters,
  MailMailbox,
  MailMessage,
  MailPriority,
  MailResourceScope,
  MailThread,
  MailThreadStatus,
} from "./types";
import { MailInbox } from "./inbox";
import { MailThreadPanel } from "./thread";
import { GmailComposeWindow } from "./composer/components/gmail-compose-window";
import type { RealAttachmentItem } from "./composer/types";
import type {
  MailWorkspace,
  MailWorkspacePermissions,
  SelectedMailThreadPermissions,
} from "./hooks/use-mail-workspace";
import { selectVisibleThreads } from "./utils/thread-selectors";

const DEFAULT_FILTERS: MailListFilters = { queue: "unassigned" };

type LiveSendMailMessageInput = {
  senderAddress: string;
  bodyText: string;
};

export interface LiveMailWorkspaceProps {
  user: UserProfile | null;
  resourceScope: MailResourceScope;
  initialThreadId?: string;
}

export function LiveMailWorkspace({
  user,
  resourceScope,
  initialThreadId,
}: LiveMailWorkspaceProps): React.JSX.Element {
  const [routeThreadId, setRouteThreadId] = useState(initialThreadId);
  const [mobilePane, setMobilePane] = useState<"queue" | "list" | "thread">(
    initialThreadId ? "thread" : "list",
  );
  const [queueExpanded, setQueueExpanded] = useState(false);
  const [viewportMode, setViewportMode] = useState<"desktop" | "mid" | "mobile">("desktop");
  const [mutationStatus, setMutationStatus] = useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const workspace = useLiveMailWorkspace({ user, resourceScope, initialThreadId: routeThreadId });
  const scopedMailboxes = workspace.mailboxes;
  const { selectThread } = workspace;
  const { submitOutboundMessage } = useMailMutations();

  const handleSendNewOutbound = async (message: {
    senderAddress: string;
    recipientAddresses: string[];
    ccAddresses?: string[];
    bccAddresses?: string[];
    subject: string;
    bodyText: string;
    bodyHtml: string;
    attachments?: RealAttachmentItem[];
  }) => {
    await submitOutboundMessage.mutateAsync({
      senderAddress: message.senderAddress,
      recipientAddresses: message.recipientAddresses,
      subject: message.subject,
      bodyText: message.bodyText,
      bodyHtml: message.bodyHtml,
      attachments: message.attachments?.map((a) => ({
        filename: a.fileName,
        contentType: a.contentType || "application/octet-stream",
        contentBase64: a.contentBase64 || "",
      })),
    });
    setMutationStatus("Thư mới đã được gửi thành công");
    setIsComposeOpen(false);
    void workspace.refresh();
  };

  useEffect(() => {
    const updateViewport = () => setViewportMode(readViewportMode());
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const navigateToThread = useCallback(
    (threadId: string) => {
      setRouteThreadId(threadId);
      selectThread(threadId);
      if (typeof window !== "undefined" && window.location.pathname !== `/mail/${threadId}`) {
        window.history.pushState({}, "", `/mail/${encodeURIComponent(threadId)}`);
      }
      if (readViewportMode() === "mobile") setMobilePane("thread");
    },
    [selectThread],
  );

  const goBackToThreads = useCallback(() => {
    if (routeThreadId) {
      window.history.replaceState({}, "", "/mail");
      setRouteThreadId(undefined);
      selectThread(undefined);
    }
    setMobilePane("list");
  }, [routeThreadId, selectThread]);

  useEffect(() => {
    const onPopState = () => {
      const nextId = readThreadIdFromLocation();
      setRouteThreadId(nextId);
      selectThread(nextId);
      if (readViewportMode() === "mobile") setMobilePane(nextId ? "thread" : "list");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [selectThread]);

  const runMutation = useCallback(async function runMutation<T>(
    label: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    setMutationStatus(null);
    try {
      const result = await operation();
      setMutationStatus(label);
      return result;
    } catch (error) {
      setMutationStatus(
        error instanceof Error && error.message ? error.message : "Mail action failed",
      );
      throw error;
    }
  }, []);

  const selectedThreadId = workspace.selectedThread?.id ?? routeThreadId;
  const showQueueNavigation =
    viewportMode === "desktop" ||
    (viewportMode === "mid" && queueExpanded) ||
    (viewportMode === "mobile" && mobilePane === "queue");
  const showThreadList =
    viewportMode === "desktop" ||
    viewportMode === "mid" ||
    (viewportMode === "mobile" && mobilePane === "list");
  const showThreadDetail =
    viewportMode === "desktop" ||
    viewportMode === "mid" ||
    (viewportMode === "mobile" && mobilePane === "thread");
  const layoutClass =
    viewportMode === "desktop"
      ? "xl:grid-cols-[minmax(580px,0.85fr)_minmax(0,1.15fr)]"
      : viewportMode === "mid"
        ? "grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"
        : "grid-cols-1";

  return (
    <>
      <div
        data-mail-workspace
        data-mail-viewport={viewportMode}
        className="flex min-h-[40rem] flex-col gap-3 transition-colors motion-reduce:transition-none lg:h-[calc(100vh-4rem)] lg:min-h-0"
      >
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Aurora Operations
            </p>
            <h1 className="font-heading text-2xl font-semibold">Mail workspace</h1>
            <p className="text-sm text-muted-foreground">
              Shared mailbox work, clearly attributed to each human operator.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
              aria-label="Làm mới dữ liệu"
              title="Làm mới dữ liệu"
              onClick={() => void workspace.refresh()}
              disabled={workspace.isLoading}
            >
              <RefreshCw className={`size-4 ${workspace.isLoading ? "animate-spin text-primary" : ""}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
            {viewportMode === "mid" ? (
              <button
                type="button"
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium"
                aria-label={queueExpanded ? "Hide mail queues" : "Show mail queues"}
                onClick={() => setQueueExpanded((current) => !current)}
              >
                {queueExpanded ? "Hide queues" : "Show queues"}
              </button>
            ) : null}
          </div>
        </header>

        {viewportMode === "mobile" && mobilePane === "queue" ? (
          <button
            type="button"
            className="w-fit rounded-lg border border-border px-3 py-2 text-sm font-medium"
            onClick={goBackToThreads}
          >
            Back to threads
          </button>
        ) : null}
        {viewportMode === "mobile" && mobilePane === "list" ? (
          <button
            type="button"
            className="w-fit rounded-lg border border-border px-3 py-2 text-sm font-medium"
            aria-label="Open mail queues"
            onClick={() => setMobilePane("queue")}
          >
            Open queues
          </button>
        ) : null}
        {viewportMode === "mobile" && mobilePane === "thread" ? (
          <button
            type="button"
            className="w-fit rounded-lg border border-border px-3 py-2 text-sm font-medium"
            onClick={goBackToThreads}
          >
            Back to threads
          </button>
        ) : null}

        <div
          data-testid="mail-workspace-layout"
          data-mail-viewport={viewportMode}
          data-mail-layout={
            viewportMode === "desktop"
              ? "three-pane"
              : viewportMode === "mid"
                ? "two-pane"
                : "single-pane"
          }
          className={`grid min-h-0 min-w-0 flex-1 gap-3 ${layoutClass}`}
        >
          {showThreadList || showQueueNavigation ? (
            <div className="min-h-0 min-w-0">
              <MailInbox
                canClaim={workspace.permissions.canClaim}
                currentUserId={user?.userId ?? ""}
                error={workspace.error}
                filters={workspace.filters}
                isLoading={workspace.isLoading}
                mailboxes={scopedMailboxes}
                onClaim={(threadId) =>
                  void runMutation("Thread claimed", () => workspace.claimThread(threadId))
                }
                onFiltersChange={workspace.setFilters}
                onRetry={() => void workspace.refresh()}
                onThreadSelect={navigateToThread}
                onComposeClick={() => setIsComposeOpen(true)}
                queueCounts={workspace.queueCounts}
                selectedThreadId={selectedThreadId}
                showAllThreads={workspace.permissions.canReadAll}
                showQueueNavigation={showQueueNavigation}
                showThreadList={showThreadList}
                threads={workspace.visibleThreads}
              />
            </div>
          ) : null}
          {showThreadDetail ? (
            <div className="min-h-0 min-w-0">
              <MailThreadPanel
                initialThreadId={routeThreadId}
                thread={workspace.selectedThread}
                mailbox={scopedMailboxes.find(
                  (mailbox) => mailbox.id === workspace.selectedThread?.mailboxId,
                )}
                currentUserId={user?.userId}
                permissions={workspace.selectedThreadPermissions}
                assignees={[]}
                error={workspace.error}
                onClaim={
                  workspace.selectedThread
                    ? () =>
                        runMutation("Thread claimed", () =>
                          workspace.claimThread(workspace.selectedThread!.id).then(() => undefined),
                        )
                    : undefined
                }
                onPriorityChange={
                  workspace.selectedThreadPermissions.canSetPriority
                    ? (priority) =>
                        runMutation("Priority updated", () =>
                          workspace
                            .setPriority(workspace.selectedThread!.id, priority)
                            .then(() => undefined),
                        )
                    : undefined
                }
                onResolve={
                  workspace.selectedThreadPermissions.canResolve
                    ? () =>
                        runMutation("Thread resolved", () =>
                          workspace
                            .markResolved(workspace.selectedThread!.id)
                            .then(() => undefined),
                        )
                    : undefined
                }
                onReassign={
                  workspace.selectedThread
                    ? (targetUserId, reason) =>
                        runMutation("Thread reassigned", () =>
                          workspace
                            .reassignThread(workspace.selectedThread!.id, targetUserId, reason)
                            .then(() => undefined),
                        )
                    : undefined
                }
                onUnassign={
                  workspace.selectedThread
                    ? (reason) =>
                        runMutation("Thread released", () =>
                          workspace
                            .unassignThread(workspace.selectedThread!.id, reason)
                            .then(() => undefined),
                        )
                    : undefined
                }
                composerMailboxes={scopedMailboxes}
                canCreateDraft={workspace.selectedThreadPermissions.canCreateDraft}
                canSend={workspace.selectedThreadPermissions.canSend}
                allowMockAttachments={false}
                onSaveDraft={
                  workspace.selectedThread
                    ? (body) =>
                        runMutation("Draft saved", () =>
                          workspace
                            .saveDraft(workspace.selectedThread!.id, body)
                            .then(() => undefined),
                        )
                    : undefined
                }
                onSendMessage={
                  workspace.selectedThread
                    ? (message) =>
                        runMutation("Outbound message sent", () =>
                          workspace
                            .sendMessage(workspace.selectedThread!.id, message)
                            .then(() => undefined),
                        )
                    : undefined
                }
              />
            </div>
          ) : null}
        </div>
        <p role="status" aria-live="polite" className="min-h-5 text-sm text-muted-foreground">
          {mutationStatus}
        </p>
      </div>

      <GmailComposeWindow
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        mailboxes={scopedMailboxes}
        onSend={handleSendNewOutbound}
      />
    </>
  );
}

function useLiveMailWorkspace({
  user,
  resourceScope,
  initialThreadId,
}: LiveMailWorkspaceProps): MailWorkspace & { mailboxes: MailMailbox[] } {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<MailListFilters>(DEFAULT_FILTERS);
  const canRead = hasMailPermission(user, "mail:read");
  const permissions = useMemo<MailWorkspacePermissions>(
    () => ({
      canRead,
      canReadAll: hasMailPermission(user, "mail:thread:read_all"),
      canClaim: hasMailPermission(user, "mail:thread:claim"),
      canReassign: hasMailPermission(user, "mail:thread:reassign"),
      canUnassign: hasMailPermission(user, "mail:thread:unassign"),
      canCreateDraft: hasMailPermission(user, "mail:draft:create"),
      canSend: hasMailPermission(user, "mail:send"),
    }),
    [canRead, user],
  );
  const mailboxesQuery = useMailboxesQuery({ pageSize: 100 }, { enabled: canRead });
  const threadsQuery = useMailThreadsQuery({ pageSize: 100 }, { enabled: canRead });
  const draftsQuery = useMailDraftsQuery({ pageSize: 100 }, { enabled: canRead });
  const selectedId = initialThreadId ?? null;
  const detailQuery = useMailThreadQuery(selectedId, { enabled: canRead });
  const mutations = useMailMutations();

  const mailboxes = useMemo(() => {
    const allowed = new Set(resourceScope.accessibleMailboxIds);
    return (mailboxesQuery.data?.mailboxes ?? [])
      .filter((mailbox) => allowed.size === 0 || allowed.has(mailbox.mailboxId))
      .map(mapMailbox);
  }, [mailboxesQuery.data?.mailboxes, resourceScope.accessibleMailboxIds]);
  const effectiveScope = useMemo<MailResourceScope>(
    () => ({
      accessibleMailboxIds: mailboxes.map((mailbox) => mailbox.id),
      permissions: user?.permissions ?? [],
    }),
    [mailboxes, user?.permissions],
  );
  const draftThreadIds = useMemo(
    () =>
      new Set(
        (draftsQuery.data?.drafts ?? []).flatMap((draft) =>
          draft.threadId ? [draft.threadId] : [],
        ),
      ),
    [draftsQuery.data?.drafts],
  );
  const summaryThreads = useMemo(
    () =>
      (threadsQuery.data?.threads ?? []).map((thread) =>
        mapThreadSummary(thread, draftThreadIds.has(thread.threadId)),
      ),
    [draftThreadIds, threadsQuery.data?.threads],
  );
  const existingSummary = summaryThreads.find((thread) => thread.id === selectedId) ?? null;
  const selectedThread = detailQuery.data
    ? mapThreadDetail(detailQuery.data, existingSummary)
    : existingSummary;
  const visibleThreads = useMemo(
    () => selectVisibleThreads(summaryThreads, filters, user?.userId ?? "", effectiveScope),
    [effectiveScope, filters, summaryThreads, user?.userId],
  );
  const queueCounts = useMemo(
    () => ({
      unassigned: selectVisibleThreads(
        summaryThreads,
        { queue: "unassigned" },
        user?.userId ?? "",
        effectiveScope,
      ).length,
      mine: selectVisibleThreads(
        summaryThreads,
        { queue: "mine" },
        user?.userId ?? "",
        effectiveScope,
      ).length,
      all: permissions.canReadAll
        ? selectVisibleThreads(summaryThreads, { queue: "all" }, user?.userId ?? "", effectiveScope)
            .length
        : 0,
      drafts: selectVisibleThreads(
        summaryThreads,
        { queue: "drafts" },
        user?.userId ?? "",
        effectiveScope,
      ).length,
    }),
    [effectiveScope, permissions.canReadAll, summaryThreads, user?.userId],
  );
  const selectedThreadPermissions = useMemo<SelectedMailThreadPermissions>(
    () => ({
      canClaim: permissions.canClaim && selectedThread?.assigneeId === null,
      canReassign: permissions.canReassign && selectedThread !== null,
      canUnassign: permissions.canUnassign && selectedThread?.assigneeId !== null,
      canSetPriority: false,
      canResolve: false,
      canCreateDraft:
        permissions.canCreateDraft &&
        (selectedThread?.assigneeId === user?.userId || permissions.canReassign),
      canSend:
        permissions.canSend &&
        (selectedThread?.assigneeId === user?.userId || permissions.canReassign),
    }),
    [permissions, selectedThread, user?.userId],
  );

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: mailKeys.all });
  }, [queryClient]);
  const selectThread = useCallback(() => undefined, []);
  const require = (allowed: boolean, permission: string) => {
    if (!allowed) throw new Error(`Missing required permission: ${permission}.`);
  };
  const requireThread = useCallback(
    (threadId?: string) => {
      const thread = threadId
        ? selectedThread?.id === threadId
          ? selectedThread
          : summaryThreads.find((candidate) => candidate.id === threadId)
        : selectedThread;
      if (!thread) throw new Error("Mail thread is unavailable.");
      return thread;
    },
    [selectedThread, summaryThreads],
  );
  const claimThread = useCallback(
    async (threadId: string) => {
      require(permissions.canClaim, "mail:thread:claim");
      await mutations.claimThread.mutateAsync(threadId);
      return requireThread(threadId);
    },
    [mutations.claimThread, permissions.canClaim, requireThread],
  );
  const reassignThread = useCallback(
    async (threadId: string, targetUserId: string, reason: string) => {
      require(permissions.canReassign, "mail:thread:reassign");
      await mutations.reassignThread.mutateAsync({ threadId, payload: { targetUserId, reason } });
      return requireThread(threadId);
    },
    [mutations.reassignThread, permissions.canReassign, requireThread],
  );
  const unassignThread = useCallback(
    async (threadId: string, reason: string) => {
      require(permissions.canUnassign, "mail:thread:unassign");
      await mutations.unassignThread.mutateAsync({ threadId, payload: { reason } });
      return requireThread(threadId);
    },
    [mutations.unassignThread, permissions.canUnassign, requireThread],
  );
  const saveDraft = useCallback(
    async (threadId: string, body: string) => {
      const thread = requireThread();
      require(selectedThreadPermissions.canCreateDraft, "mail:draft:create");
      await mutations.createDraft.mutateAsync({
        mailboxId: thread.mailboxId,
        subject: `Re: ${thread.subject}`,
        body,
        threadId,
        to: thread.participants.map((participant) => participant.email),
        idempotencyKey: createIdempotencyKey(),
      });
      return thread;
    },
    [mutations.createDraft, requireThread, selectedThreadPermissions.canCreateDraft],
  );
  const sendMessage = useCallback(
    async (threadId: string, message: LiveSendMailMessageInput) => {
      const thread = requireThread();
      require(selectedThreadPermissions.canSend, "mail:send");
      await mutations.submitOutboundMessage.mutateAsync({
        senderAddress: message.senderAddress,
        recipientAddresses: thread.participants.map((participant) => participant.email),
        subject: thread.subject.startsWith("Re:") ? thread.subject : `Re: ${thread.subject}`,
        bodyText: message.bodyText,
        threadId,
        replyToMessageId: thread.messages.at(-1)?.id,
        idempotencyKey: createIdempotencyKey(),
      });
      return thread;
    },
    [mutations.submitOutboundMessage, requireThread, selectedThreadPermissions.canSend],
  );

  return {
    filters,
    setFilters,
    visibleThreads,
    queueCounts,
    selectedThread,
    selectThread,
    isLoading:
      mailboxesQuery.isLoading ||
      threadsQuery.isLoading ||
      draftsQuery.isLoading ||
      detailQuery.isLoading,
    error: mailboxesQuery.error ?? threadsQuery.error ?? draftsQuery.error ?? detailQuery.error,
    permissions,
    selectedThreadPermissions,
    refresh,
    claimThread,
    reassignThread,
    unassignThread,
    setPriority: async () => {
      throw new Error("Thread priority is not supported by the Staff Mail API.");
    },
    markResolved: async () => {
      throw new Error("Thread resolution is not supported by the Staff Mail API.");
    },
    saveDraft,
    sendMessage,
    mailboxes,
  };
}

function mapMailbox(mailbox: Mailbox): MailMailbox {
  return {
    id: mailbox.mailboxId,
    displayName: mailbox.fullAddress,
    senderAddress: mailbox.fullAddress,
  };
}

function mapThreadSummary(summary: ThreadSummaryApiDto, hasDraft = false): MailThread {
  const lastMessageAt = summary.lastMessageAt;
  return {
    id: summary.threadId,
    version: 1,
    mailboxId: summary.mailboxId,
    subject: summary.subject,
    participants: summary.participants.map(mapParticipant),
    assigneeId: summary.primaryAssigneeUserId ?? null,
    status: mapStatus(summary.status, summary.primaryAssigneeUserId),
    priority: mapPriority(summary.priority),
    unreadCount: summary.hasUnread ? 1 : 0,
    preview: summary.snippet,
    createdAt: lastMessageAt,
    updatedAt: lastMessageAt,
    lastMessageAt,
    messages: [],
    assignmentHistory: [],
    draft: hasDraft ? { body: "", updatedAt: lastMessageAt } : null,
    aiDraftSuggestion: null,
    fixtureScenario: "success",
  };
}

function mapThreadDetail(
  detail: ThreadDetailApiResponse,
  existingSummary?: MailThread | null,
): MailThread {
  const fallbackSnippet =
    detail.messages.at(-1)?.bodyPreview ||
    existingSummary?.preview ||
    detail.subject ||
    "";

  const summary = mapThreadSummary(
    {
      threadId: detail.threadId,
      mailboxId: detail.mailboxId,
      subject: detail.subject,
      participants: detail.participants,
      lastMessageAt: detail.updatedAt,
      messageCount: detail.messages.length > 0 ? detail.messages.length : 1,
      draftCount: detail.drafts.length,
      hasUnread: false,
      snippet: fallbackSnippet,
      primaryAssigneeUserId: detail.primaryAssigneeUserId,
      assignedAt: detail.assignedAt,
      status: detail.status,
      priority: detail.priority,
    },
    detail.drafts.length > 0,
  );

  let messages = detail.messages.map(mapMessage);
  if (messages.length === 0) {
    const sender =
      detail.participants.find(
        (p) =>
          !p.toLowerCase().includes("ops@") &&
          !p.toLowerCase().includes("operations@"),
      ) ??
      detail.participants[0] ??
      "Customer";

    messages = [
      {
        id: `synthetic-${detail.threadId}`,
        direction: "inbound",
        authorId: null,
        authorName: sender.split("@")[0] ?? sender,
        senderAddress: sender,
        bodyText: fallbackSnippet || detail.subject || "(Nội dung email trống)",
        attachments: [],
        sentAt: detail.createdAt,
        deliveryStatus: "delivered",
      },
    ];
  }

  return {
    ...summary,
    preview: fallbackSnippet,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
    lastMessageAt: detail.messages.at(-1)?.sentAt ?? detail.updatedAt,
    messages,
    assignmentHistory: (detail.assignmentHistory ?? []).map((event) => ({
      id: event.id,
      type:
        event.action.toLowerCase() === "reassign"
          ? "reassign"
          : event.action.toLowerCase() === "unassign"
            ? "unassign"
            : "claim",
      actorId: event.actorUserId,
      targetUserId: event.toUserId,
      reason: event.reason,
      occurredAt: event.createdAt,
    })),
    draft: detail.drafts[0]
      ? { body: detail.drafts[0].body, updatedAt: detail.drafts[0].createdAt }
      : null,
  };
}

function mapMessage(message: ThreadMessageApiDto): MailMessage {
  return {
    id: message.messageId,
    direction: message.direction.toLowerCase() === "outbound" ? "outbound" : "inbound",
    authorId: null,
    authorName: message.senderAddress.split("@")[0] ?? message.senderAddress,
    senderAddress: message.senderAddress,
    bodyText: message.bodyText || message.bodyPreview,
    attachments: [],
    sentAt: message.sentAt ?? message.receivedAt ?? new Date().toISOString(),
    deliveryStatus: "delivered",
  };
}

function mapParticipant(participant: string) {
  const [name, email] = participant.includes("<")
    ? participant.split("<")
    : [participant.split("@")[0], participant];
  return {
    name: name?.trim() ?? participant,
    email: email?.replace(">", "").trim() ?? participant,
  };
}

function mapStatus(
  status: string | null | undefined,
  assigneeId?: string | null,
): MailThreadStatus {
  const normalized = status?.toLowerCase().replaceAll(" ", "_");
  if (normalized === "resolved" || normalized === "closed") return "resolved";
  if (normalized === "waiting_customer") return "waiting_customer";
  return assigneeId ? "in_progress" : "unassigned";
}

function mapPriority(priority: string | null | undefined): MailPriority {
  const normalized = priority?.toLowerCase();
  return normalized === "low" || normalized === "high" || normalized === "urgent"
    ? normalized
    : "normal";
}

function createIdempotencyKey(): string {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

function readViewportMode(): "desktop" | "mid" | "mobile" {
  if (typeof window === "undefined") return "desktop";
  if (window.innerWidth >= 1280) return "desktop";
  if (window.innerWidth >= 1024) return "mid";
  return "mobile";
}

function readThreadIdFromLocation(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const match = window.location.pathname.match(/^\/mail\/([^/]+)$/);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}
