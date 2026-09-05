"use client";

import { useRef, useState } from "react";

import { EmptyState } from "@/components/common";
import { ReassignThreadDialog } from "../dialogs/reassign-thread-dialog";
import { ReturnToQueueDialog } from "../dialogs/return-to-queue-dialog";
import type { MailAssigneeOption } from "../dialogs/types";
import { AssignmentHistoryDrawer } from "../drawers/assignment-history-drawer";
import { ReplyComposer } from "../composer";
import type { MailAttachment, MailMailbox, MailPriority, MailThread } from "../types";
import { MessageTimeline } from "./components/message-timeline";
import { ThreadHeader, type ThreadHeaderPermissions } from "./components/thread-header";

export interface MailThreadPanelProps {
  initialThreadId?: string;
  thread?: MailThread | null;
  mailbox?: MailMailbox;
  currentUserId?: string;
  permissions?: ThreadHeaderPermissions;
  assignees?: readonly MailAssigneeOption[];
  error?: unknown;
  onClaim?: () => Promise<void> | void;
  onPriorityChange?: (priority: MailPriority) => Promise<void> | void;
  onResolve?: () => Promise<void> | void;
  onReassign?: (targetUserId: string, reason: string) => Promise<void> | void;
  onUnassign?: (reason: string) => Promise<void> | void;
  onAttachmentOpen?: (attachment: MailAttachment) => void;
  composerMailboxes?: readonly MailMailbox[];
  canCreateDraft?: boolean;
  canSend?: boolean;
  onSaveDraft?: (body: string) => Promise<void> | void;
  onSendMessage?: (
    message: { senderAddress: string; bodyText: string },
  ) => Promise<void> | void;
}

const noActions: ThreadHeaderPermissions = {
  canClaim: false,
  canSetPriority: false,
  canResolve: false,
  canReassign: false,
  canUnassign: false,
};

export function MailThreadPanel({
  initialThreadId,
  thread: suppliedThread,
  mailbox: suppliedMailbox,
  currentUserId,
  permissions = noActions,
  assignees = [],
  error,
  onClaim,
  onPriorityChange,
  onResolve,
  onReassign,
  onUnassign,
  onAttachmentOpen,
  composerMailboxes,
  canCreateDraft = false,
  canSend = false,
  onSaveDraft,
  onSendMessage,
}: MailThreadPanelProps): React.JSX.Element {
  const [isReassignOpen, setReassignOpen] = useState(false);
  const [isReleaseOpen, setReleaseOpen] = useState(false);
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [mutationError, setMutationError] = useState<unknown>(null);
  const reassignButtonRef = useRef<HTMLButtonElement>(null);
  const releaseButtonRef = useRef<HTMLButtonElement>(null);
  const historyButtonRef = useRef<HTMLButtonElement>(null);
  const thread = suppliedThread;
  const mailbox = suppliedMailbox;
  const availableComposerMailboxes = composerMailboxes ?? (mailbox ? [mailbox] : []);

  if (!thread) {
    return (
      <section aria-label="Mail thread">
        <EmptyState
          title="No conversation selected"
          description={
            initialThreadId
              ? "The requested conversation will appear here when mail data is available."
              : "Select a conversation to review its messages and next steps."
          }
        />
      </section>
    );
  }

  const currentError = mutationError ?? error;

  async function run(action: (() => Promise<void> | void) | undefined): Promise<boolean> {
    if (!action) return true;
    try {
      setMutationError(null);
      await action();
      return true;
    } catch (nextError) {
      setMutationError(nextError);
      return false;
    }
  }

  return (
    <section aria-label="Mail thread" className="grid min-w-0 gap-5 rounded-xl border border-border bg-card p-4">
      <ThreadHeader
        thread={thread}
        mailbox={mailbox}
        currentUserId={currentUserId}
        permissions={permissions}
        onClaim={() => void run(onClaim)}
        onPriorityChange={(priority) => void run(() => onPriorityChange?.(priority))}
        onResolve={() => void run(onResolve)}
        onReassign={() => setReassignOpen(true)}
        onUnassign={() => setReleaseOpen(true)}
        onHistory={() => setHistoryOpen(true)}
        reassignButtonRef={reassignButtonRef}
        unassignButtonRef={releaseButtonRef}
        historyButtonRef={historyButtonRef}
      />
      <ConflictOrForbiddenAlert error={currentError} />
      <MessageTimeline messages={thread.messages} onAttachmentOpen={onAttachmentOpen} />
      {availableComposerMailboxes.length > 0 && (onSaveDraft || onSendMessage) ? (
        <ReplyComposer
          key={thread.id}
          thread={thread}
          mailboxes={availableComposerMailboxes}
          canCreateDraft={canCreateDraft}
          canSend={canSend}
          canClaim={permissions.canClaim}
          onClaim={onClaim}
          onSave={(draft) => {
            if (!onSaveDraft) {
              throw new Error("Draft saving is unavailable for this thread.");
            }
            return onSaveDraft(draft.body);
          }}
          onSend={(draft) => {
            const senderMailbox = availableComposerMailboxes.find(
              (candidate) => candidate.id === draft.senderMailboxId,
            );
            if (!senderMailbox || !onSendMessage) {
              throw new Error("A shared sender mailbox is required to send this reply.");
            }
            return onSendMessage({ senderAddress: senderMailbox.senderAddress, bodyText: draft.body });
          }}
        />
      ) : null}
      <ReassignThreadDialog
        open={isReassignOpen}
        onOpenChange={setReassignOpen}
        assignees={assignees}
        onSubmit={async (targetUserId, reason) => {
          if (!(await run(() => onReassign?.(targetUserId, reason)))) {
            throw new Error("Reassignment failed.");
          }
        }}
        returnFocusRef={reassignButtonRef}
      />
      <ReturnToQueueDialog
        open={isReleaseOpen}
        onOpenChange={setReleaseOpen}
        onSubmit={async (reason) => {
          if (!(await run(() => onUnassign?.(reason)))) {
            throw new Error("Release failed.");
          }
        }}
        returnFocusRef={releaseButtonRef}
      />
      <AssignmentHistoryDrawer
        open={isHistoryOpen}
        onOpenChange={setHistoryOpen}
        events={thread.assignmentHistory}
        returnFocusRef={historyButtonRef}
      />
    </section>
  );
}

function ConflictOrForbiddenAlert({ error }: { error: unknown }): React.JSX.Element | null {
  if (!isMailOperationError(error)) return null;
  if (error.status === 409 && error.code === "THREAD_ALREADY_ASSIGNED") {
    return (
      <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        Assignment refreshed. This thread is now read-only.
      </p>
    );
  }
  if (error.status === 403 && error.code === "CROSS_STAFF_REPLY_FORBIDDEN") {
    return (
      <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        Replying is unavailable because this thread is owned by another staff member.
      </p>
    );
  }
  return null;
}

function isMailOperationError(
  error: unknown,
): error is { status: number; code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "code" in error &&
    typeof error.status === "number" &&
    typeof error.code === "string"
  );
}
