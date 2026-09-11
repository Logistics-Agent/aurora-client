"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PenSquare } from "lucide-react";

import type { UserProfile } from "@/types/auth.types";
import { MailInbox } from "../inbox";
import { useMailWorkspace } from "../hooks/use-mail-workspace";
import type { MailMockRepository } from "../mock/mail-repository";
import { mailService } from "@/api/services/mail.service";
import type { MailAssigneeOption } from "../dialogs/types";
import type { MailListFilters, MailMailbox, MailResourceScope } from "../types";
import { MailThreadPanel } from "../thread";
import { MailAccessState } from "./mail-access-state";
import { GmailComposeWindow, type RealAttachmentItem } from "../composer";


export interface MailWorkspaceProps {
  user: UserProfile | null;
  resourceScope: MailResourceScope;
  initialThreadId?: string;
  repository: MailMockRepository;
}

type ViewportMode = "desktop" | "mid" | "mobile";
type MobilePane = "queue" | "list" | "thread";

export function MailWorkspace({
  user,
  resourceScope,
  initialThreadId,
  repository,
}: MailWorkspaceProps): React.JSX.Element {
  const [routeThreadId, setRouteThreadId] = useState(initialThreadId);
  const [mobilePane, setMobilePane] = useState<MobilePane>(
    initialThreadId ? "thread" : "list",
  );
  const [queueExpanded, setQueueExpanded] = useState(false);
  const [viewportMode, setViewportMode] = useState<ViewportMode>(readViewportMode);
  const [mutationStatus, setMutationStatus] = useState<string | null>(null);
  const [remoteAssignees, setRemoteAssignees] = useState<MailAssigneeOption[]>([]);
  const [domainMailboxes, setDomainMailboxes] = useState<MailMailbox[]>([]);
  const [isComposeOpen, setComposeOpen] = useState(false);

  const workspace = useMailWorkspace({
    user,
    resourceScope,
    initialThreadId: routeThreadId,
    repository,
  });
  const { selectThread } = workspace;


  useEffect(() => {
    let isMounted = true;
    async function loadDomainAssignees() {
      try {
        const response = await mailService.listMailboxes();
        if (isMounted && response?.mailboxes && response.mailboxes.length > 0) {
          const list: MailAssigneeOption[] = response.mailboxes.map((mb) => ({
            userId: mb.userId || mb.mailboxId,
            name: `${mb.fullAddress} (${mb.localPart || "Domain Mailbox"})`,
          }));

          const mailboxesList: MailMailbox[] = response.mailboxes.map((mb) => ({
            id: mb.mailboxId,
            displayName: mb.localPart ? (mb.localPart.charAt(0).toUpperCase() + mb.localPart.slice(1)) : mb.fullAddress.split("@")[0],
            senderAddress: mb.fullAddress,
          }));

          if (user?.userId && !list.some((m) => m.userId === user.userId)) {
            list.unshift({
              userId: user.userId,
              name: `${user.name || user.email || "Current User"} (You)`,
            });
          }
          setRemoteAssignees(list);
          setDomainMailboxes(mailboxesList);
        }
      } catch {
        // Silent fallback to domain defaults
      }
    }
    loadDomainAssignees();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const scopedMailboxes = useMemo<readonly MailMailbox[]>(() => {
    const baseList = domainMailboxes.length > 0 ? domainMailboxes : [
      { id: "01a08e7e-b561-791e-ac90-a534ac284e2c", displayName: "Operations", senderAddress: "ops@e-verland.site" },
      { id: "01a08e7e-b561-791e-ac90-a534ac284e2d", displayName: "Customer Support", senderAddress: "support@e-verland.site" },
    ];
    const allowed = new Set(resourceScope?.accessibleMailboxIds ?? []);
    if (allowed.size === 0 || allowed.has("*")) {
      return baseList;
    }
    return baseList.filter((mailbox) => allowed.has(mailbox.id));
  }, [domainMailboxes, resourceScope?.accessibleMailboxIds]);

  const assignees = useMemo<readonly MailAssigneeOption[]>(() => {
    if (remoteAssignees.length > 0) return remoteAssignees;
    const defaults: MailAssigneeOption[] = [];
    if (user?.userId) {
      defaults.push({
        userId: user.userId,
        name: `${user.name || user.email || "Staff Member"} (You)`,
      });
    }
    defaults.push(
      { userId: "01a08e7e-b561-791e-ac90-a534ac284e2c", name: "ops@e-verland.site (Operations Staff)" },
      { userId: "01a08e7e-b561-791e-ac90-a534ac284e2d", name: "support@e-verland.site (Support Manager)" },
    );
    return defaults;
  }, [remoteAssignees, user]);

  useEffect(() => {
    const updateViewport = () => setViewportMode(readViewportMode());
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const nextId = readThreadIdFromLocation();
      setRouteThreadId(nextId);
      selectThread(nextId);
      if (viewportMode === "mobile") setMobilePane(nextId ? "thread" : "list");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [selectThread, viewportMode]);

  const navigateToThread = useCallback(
    (threadId: string) => {
      setRouteThreadId(threadId);
      selectThread(threadId);
      if (window.location.pathname !== `/mail/${threadId}`) {
        window.history.pushState({}, "", `/mail/${threadId}`);
      }
      if (viewportMode === "mobile") setMobilePane("thread");
    },
    [selectThread, viewportMode],
  );

  const runMutation = useCallback(
    async function runMutation<T>(
      actionLabel: string,
      operation: () => Promise<T>,
      successMessage?: string,
    ): Promise<T> {
      try {
        const result = await operation();
        const msg = successMessage || `${actionLabel} thành công`;
        setMutationStatus(msg);
        setTimeout(() => {
          setMutationStatus((prev) => (prev === msg ? null : prev));
        }, 4000);
        return result;
      } catch (error: any) {
        const detail = error?.response?.data?.detail || error?.response?.data?.errors?.[0] || error?.message || "Vui lòng thử lại.";
        const failMsg = `${actionLabel} thất bại: ${detail}`;
        setMutationStatus(failMsg);
        setTimeout(() => {
          setMutationStatus((prev) => (prev === failMsg ? null : prev));
        }, 6000);
        throw error;
      }
    },
    [],
  );

  const selectedThreadId = workspace.selectedThread?.id ?? routeThreadId;
  const showQueueNavigation = viewportMode === "desktop"
    || (viewportMode === "mid" && queueExpanded)
    || (viewportMode === "mobile" && mobilePane === "queue");
  const showThreadList = viewportMode !== "mobile" || mobilePane === "list";
  const showThreadDetail = viewportMode !== "mobile" || mobilePane === "thread";
  const layoutClass = viewportMode === "desktop"
    ? "xl:grid-cols-[minmax(580px,0.85fr)_minmax(0,1.15fr)]"
    : viewportMode === "mid"
      ? "grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"
      : "grid-cols-1";
  const layoutName = viewportMode === "desktop" ? "three-pane" : viewportMode === "mid" ? "two-pane" : "single-pane";
  const inboxFiltersChange = useCallback(
    (filters: MailListFilters) => {
      workspace.setFilters(filters);
      if (viewportMode === "mobile" && mobilePane === "queue") setMobilePane("list");
    },
    [mobilePane, viewportMode, workspace],
  );
  const goBackToThreads = useCallback(() => {
    if (routeThreadId) {
      window.history.replaceState({}, "", "/mail");
      setRouteThreadId(undefined);
      selectThread(undefined);
    }
    setMobilePane("list");
  }, [routeThreadId, selectThread]);

  const handleSendNewOutboundMessage = useCallback(
    async (message: {
      senderAddress: string;
      recipientAddresses: string[];
      ccAddresses?: string[];
      bccAddresses?: string[];
      subject: string;
      bodyText: string;
      bodyHtml: string;
      attachments?: RealAttachmentItem[];
    }) => {
      await runMutation(
        "Gửi thư mới",
        async () => {
          const attachmentsPayload = message.attachments?.map((att) => ({
            filename: att.fileName,
            contentType: att.contentType || "application/octet-stream",
            contentBase64: att.contentBase64 || "",
          }));

          await mailService.submitOutboundMessage({
            senderAddress: message.senderAddress,
            recipientAddresses: message.recipientAddresses,
            subject: message.subject,
            bodyText: message.bodyText,
            bodyHtml: message.bodyHtml,
            attachments: attachmentsPayload,
          });

          await workspace.refresh();
        },
        "Thư đã được gửi đi thành công",
      );
    },
    [runMutation, workspace],
  );

  return (
    <MailAccessState user={user} isLoading={workspace.isLoading}>

      <div
        data-mail-workspace
        data-mail-viewport={viewportMode}
        className="grid min-h-[40rem] gap-3 transition-colors motion-reduce:transition-none"
      >
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Aurora Operations</p>
            <h1 className="font-heading text-2xl font-semibold">Mail workspace</h1>
            <p className="text-sm text-muted-foreground">Shared mailbox work, clearly attributed to each human operator.</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Compose New Email Button */}
            <button
              type="button"
              onClick={() => setComposeOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm hover:shadow transition-all"
            >
              <PenSquare className="size-3.5" />
              <span>Soạn thư mới</span>
            </button>

            {viewportMode === "mid" ? (
              <button
                type="button"
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
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
            className="w-fit rounded-lg border border-border px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            onClick={goBackToThreads}
          >
            Back to threads
          </button>
        ) : null}
        {viewportMode === "mobile" && mobilePane === "list" ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="w-fit rounded-lg border border-border px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              aria-label="Open mail queues"
              onClick={() => setMobilePane("queue")}
            >
              Open queues
            </button>
            <button
              type="button"
              onClick={() => setComposeOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs shadow-sm"
            >
              <PenSquare className="size-3.5" />
              <span>Soạn thư</span>
            </button>
          </div>
        ) : null}
        {viewportMode === "mobile" && mobilePane === "thread" ? (
          <button
            type="button"
            className="w-fit rounded-lg border border-border px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            onClick={goBackToThreads}
          >
            Back to threads
          </button>
        ) : null}

        <div
          data-testid="mail-workspace-layout"
          data-mail-viewport={viewportMode}
          data-mail-layout={layoutName}
          className={`grid min-w-0 gap-3 ${layoutClass}`}
        >
          {showThreadList || showQueueNavigation ? (
            <div className="min-w-0">
              <MailInbox
                canClaim={workspace.permissions.canClaim}
                currentUserId={user?.userId ?? ""}
                error={workspace.error}
                filters={workspace.filters}
                isLoading={workspace.isLoading}
                mailboxes={scopedMailboxes}
                onClaim={(threadId) => {
                  void runMutation("Nhận xử lý luồng thư", () => workspace.claimThread(threadId));
                }}
                onFiltersChange={inboxFiltersChange}
                onRetry={() => void workspace.refresh()}
                onThreadSelect={navigateToThread}
                onCompose={() => setComposeOpen(true)}
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
            <div className="min-w-0">
              <MailThreadPanel
                initialThreadId={routeThreadId}
                thread={workspace.selectedThread}
                mailbox={scopedMailboxes.find((mailbox) => mailbox.id === workspace.selectedThread?.mailboxId)}
                currentUserId={user?.userId}
                permissions={workspace.selectedThreadPermissions}
                assignees={assignees}
                error={workspace.error}
                onClaim={workspace.selectedThread ? () => runMutation("Nhận xử lý luồng thư", () => workspace.claimThread(workspace.selectedThread!.id).then(() => undefined)) : undefined}
                onPriorityChange={workspace.selectedThread ? (priority) => runMutation(`Cập nhật độ ưu tiên`, () => workspace.setPriority(workspace.selectedThread!.id, priority).then(() => undefined), `Đã chuyển độ ưu tiên sang ${priority.toUpperCase()}`) : undefined}
                onResolve={workspace.selectedThread ? () => runMutation("Đánh dấu hoàn tất luồng thư", () => workspace.markResolved(workspace.selectedThread!.id).then(() => undefined)) : undefined}
                onReassign={workspace.selectedThread ? (targetUserId, reason) => runMutation("Chuyển giao luồng thư", () => workspace.reassignThread(workspace.selectedThread!.id, targetUserId, reason).then(() => undefined)) : undefined}
                onUnassign={workspace.selectedThread ? (reason) => runMutation("Trả luồng thư về hàng đợi chung", () => workspace.unassignThread(workspace.selectedThread!.id, reason).then(() => undefined)) : undefined}
                composerMailboxes={scopedMailboxes}
                canCreateDraft={workspace.selectedThreadPermissions.canCreateDraft}
                canSend={workspace.selectedThreadPermissions.canSend}
                onSaveDraft={workspace.selectedThread ? (body) => runMutation("Lưu bản nháp", () => workspace.saveDraft(workspace.selectedThread!.id, body).then(() => undefined)) : undefined}
                onSendMessage={workspace.selectedThread ? (message) => runMutation("Gửi thư phản hồi", () => workspace.sendMessage(workspace.selectedThread!.id, message).then(() => undefined), "Thư phản hồi đã được gửi đi thành công") : undefined}
              />
            </div>
          ) : null}
        </div>

        {/* Gmail-style Compose New Email Window */}
        <GmailComposeWindow
          isOpen={isComposeOpen}
          onClose={() => setComposeOpen(false)}
          mailboxes={scopedMailboxes}
          onSend={handleSendNewOutboundMessage}
        />

        {mutationStatus && (
          <div
            role="status"
            aria-live="polite"
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-xl border backdrop-blur-md text-xs font-semibold transition-all ${
              mutationStatus.includes("failed")
                ? "bg-rose-50/95 text-rose-900 border-rose-200"
                : "bg-slate-900/95 text-white border-slate-700"
            }`}
          >
            <span
              className={`size-2 rounded-full ${
                mutationStatus.includes("failed") ? "bg-rose-500 animate-pulse" : "bg-emerald-400"
              }`}
            />
            <span>{mutationStatus}</span>
            <button
              type="button"
              onClick={() => setMutationStatus(null)}
              className="ml-2 opacity-60 hover:opacity-100 text-xs"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </MailAccessState>


  );
}

function readViewportMode(): ViewportMode {
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
