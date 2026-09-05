"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { UserProfile } from "@/types/auth.types";
import { MailInbox } from "../inbox";
import { useMailWorkspace } from "../hooks/use-mail-workspace";
import type { MailMockRepository } from "../mock/mail-repository";
import { mailMailboxFixtures, mailPersonaFixtures } from "../mock/fixtures";
import type { MailListFilters, MailResourceScope } from "../types";
import { MailThreadPanel } from "../thread";
import { MailAccessState } from "./mail-access-state";

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
  const workspace = useMailWorkspace({
    user,
    resourceScope,
    initialThreadId: routeThreadId,
    repository,
  });
  const { selectThread } = workspace;
  const scopedMailboxes = useMemo(
    () => mailMailboxFixtures.filter((mailbox) => resourceScope.accessibleMailboxIds.includes(mailbox.id)),
    [resourceScope.accessibleMailboxIds],
  );
  const assignees = useMemo(
    () => mailPersonaFixtures.map(({ userId, name }) => ({ userId, name })),
    [],
  );

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
      label: string,
      operation: () => Promise<T>,
    ): Promise<T> {
      setMutationStatus(null);
      try {
        const result = await operation();
        setMutationStatus(`${label}.`);
        return result;
      } catch (error) {
        setMutationStatus(`${label} failed.`);
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
            <p
              role="status"
              aria-live="polite"
              aria-label="Mail data source"
              className="text-xs font-medium text-amber-700 dark:text-amber-300"
            >
              UI-only demo data from a mock repository; not connected to live mail.
            </p>
          </div>
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
          <button
            type="button"
            className="w-fit rounded-lg border border-border px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            aria-label="Open mail queues"
            onClick={() => setMobilePane("queue")}
          >
            Open queues
          </button>
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
                  void runMutation("Thread claimed", () => workspace.claimThread(threadId));
                }}
                onFiltersChange={inboxFiltersChange}
                onRetry={() => void workspace.refresh()}
                onThreadSelect={navigateToThread}
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
                onClaim={workspace.selectedThread ? () => runMutation("Thread claimed", () => workspace.claimThread(workspace.selectedThread!.id).then(() => undefined)) : undefined}
                onPriorityChange={workspace.selectedThread ? (priority) => runMutation("Priority updated", () => workspace.setPriority(workspace.selectedThread!.id, priority).then(() => undefined)) : undefined}
                onResolve={workspace.selectedThread ? () => runMutation("Thread resolved", () => workspace.markResolved(workspace.selectedThread!.id).then(() => undefined)) : undefined}
                onReassign={workspace.selectedThread ? (targetUserId, reason) => runMutation("Thread reassigned", () => workspace.reassignThread(workspace.selectedThread!.id, targetUserId, reason).then(() => undefined)) : undefined}
                onUnassign={workspace.selectedThread ? (reason) => runMutation("Thread released", () => workspace.unassignThread(workspace.selectedThread!.id, reason).then(() => undefined)) : undefined}
                composerMailboxes={scopedMailboxes}
                canCreateDraft={workspace.selectedThreadPermissions.canCreateDraft}
                canSend={workspace.selectedThreadPermissions.canSend}
                onSaveDraft={workspace.selectedThread ? (body) => runMutation("Draft saved", () => workspace.saveDraft(workspace.selectedThread!.id, body).then(() => undefined)) : undefined}
                onSendMessage={workspace.selectedThread ? (message) => runMutation("Outbound message sent", () => workspace.sendMessage(workspace.selectedThread!.id, message).then(() => undefined)) : undefined}
              />
            </div>
          ) : null}
        </div>
        <p role="status" aria-live="polite" className="min-h-5 text-sm text-muted-foreground">
          {mutationStatus}
        </p>
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
