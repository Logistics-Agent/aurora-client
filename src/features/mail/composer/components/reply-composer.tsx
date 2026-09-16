"use client";

import { useState } from "react";
import { Paperclip, Reply as ReplyIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { MailMailbox, MailThread } from "../../types";
import type { MailDraftFormValues } from "../types";
import { validateMailDraft } from "../utils/validate-mail-draft";
import { AiDraftSuggestion } from "./ai-draft-suggestion";

export interface ReplyComposerProps {
  thread: MailThread;
  mailboxes: readonly MailMailbox[];
  canCreateDraft: boolean;
  canSend: boolean;
  canClaim: boolean;
  onClaim?: () => Promise<void> | void;
  onClose?: () => void;
  allowMockAttachments?: boolean;
  onSave: (draft: MailDraftFormValues) => Promise<void> | void;
  onSend: (draft: MailDraftFormValues) => Promise<void> | void;
}

export function ReplyComposer({
  thread,
  mailboxes,
  canCreateDraft,
  canSend,
  canClaim,
  onClaim,
  onClose,
  allowMockAttachments = true,
  onSave,
  onSend,
}: ReplyComposerProps): React.JSX.Element {
  const [senderMailboxId, setSenderMailboxId] = useState(() => defaultMailboxId(thread, mailboxes));
  const [body, setBody] = useState(thread.draft?.body ?? "");
  const [attachmentIds, setAttachmentIds] = useState<readonly string[]>([]);
  const [isSaving, setSaving] = useState(false);
  const [isSending, setSending] = useState(false);
  const [isClaiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const requiresClaim = thread.assigneeId === null;
  const canEdit = canCreateDraft && !requiresClaim;
  const canSubmit = canEdit && canSend;
  const isBusy = isSaving || isSending || isClaiming;
  const draft: MailDraftFormValues = { senderMailboxId, body, attachmentIds };

  function validate(): boolean {
    const result = validateMailDraft(
      draft,
      mailboxes.map((mailbox) => mailbox.id),
    );
    if (!result.valid) {
      setError(result.error);
      setStatus(null);
      return false;
    }
    return true;
  }

  async function saveDraft(): Promise<void> {
    if (!canEdit || !validate()) return;
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      await onSave(draft);
      setStatus("Draft saved.");
    } catch {
      setError("Unable to save your draft. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function sendOutbound(): Promise<void> {
    if (!canSubmit || !validate()) return;
    setSending(true);
    setError(null);
    setStatus(null);
    try {
      await onSend(draft);
      setBody("");
      setAttachmentIds([]);
      setStatus("Outbound message sent.");
    } catch {
      setError("Delivery failed. Your draft is still available to retry.");
    } finally {
      setSending(false);
    }
  }

  async function claimThread(): Promise<void> {
    if (!canClaim || !onClaim || isBusy) return;
    setClaiming(true);
    setError(null);
    setStatus(null);
    try {
      await onClaim();
      setStatus("Thread claimed. You can now compose a reply.");
    } catch {
      setError("Unable to claim this thread. Refresh and try again.");
    } finally {
      setClaiming(false);
    }
  }

  return (
    <section
      aria-label="Reply composer"
      className="fixed inset-x-2 bottom-2 z-50 flex h-[min(560px,calc(100vh-1rem))] min-h-0 animate-in flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl duration-200 ease-out fade-in-0 slide-in-from-bottom-4 motion-reduce:animate-none sm:inset-x-auto sm:right-4 sm:bottom-0 sm:h-[min(560px,calc(100vh-1rem))] sm:w-[min(620px,calc(100vw-1rem))] sm:rounded-b-none"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2.5">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <ReplyIcon aria-hidden="true" className="size-4" />
          Reply
        </h2>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Close reply composer"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2.5">
        <div className="grid gap-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-1">
              <span className="text-xs font-medium text-muted-foreground">To</span>
              <div className="flex min-h-8 flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent px-2 py-1">
                {thread.participants.map((participant) => (
                  <span
                    key={participant.email}
                    className="inline-flex max-w-full items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium"
                  >
                    <span className="truncate">{participant.email}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-1">
              <label htmlFor="reply-subject" className="text-xs font-medium text-muted-foreground">
                Subject
              </label>
              <Input
                id="reply-subject"
                value={`Re: ${thread.subject}`}
                readOnly
                className="text-sm"
              />
            </div>
          </div>

          <div className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">From shared mailbox</span>
            <Select
              value={senderMailboxId}
              disabled={!canEdit || isBusy || mailboxes.length === 0}
              onValueChange={setSenderMailboxId}
            >
              <SelectTrigger aria-label="From shared mailbox" size="sm" className="w-full text-sm">
                <SelectValue placeholder="Select a shared mailbox" />
              </SelectTrigger>
              <SelectContent position="popper" align="start" className="duration-150 ease-out">
                {mailboxes.map((mailbox) => (
                  <SelectItem key={mailbox.id} value={mailbox.id}>
                    {mailbox.displayName} — {mailbox.senderAddress}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {requiresClaim ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
              Take this thread before writing a reply.
            </p>
          ) : null}
          {!requiresClaim && !canEdit ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
              You do not have permission to compose replies for this thread.
            </p>
          ) : null}

          {requiresClaim ? (
            <Button
              type="button"
              size="sm"
              disabled={!canClaim || !onClaim || isBusy}
              onClick={() => void claimThread()}
            >
              Take thread to reply
            </Button>
          ) : null}

          {thread.aiDraftSuggestion ? (
            <AiDraftSuggestion
              suggestion={thread.aiDraftSuggestion}
              disabled={!canEdit || isBusy}
              onInsert={(text) => {
                setBody(text);
                setError(null);
                setStatus(null);
              }}
            />
          ) : null}

          <div className="grid gap-1.5">
            <label htmlFor="reply-body" className="text-sm font-medium">
              Reply message
            </label>
            <Textarea
              id="reply-body"
              value={body}
              disabled={!canEdit || isBusy}
              onChange={(event) => setBody(event.target.value)}
              className="max-h-40 min-h-28 resize-y overflow-y-auto text-sm"
              placeholder="Write a customer-ready reply…"
            />
          </div>

          {allowMockAttachments ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canEdit || isBusy}
                onClick={() =>
                  setAttachmentIds((current) => [
                    ...current,
                    `mock-attachment-${current.length + 1}`,
                  ])
                }
              >
                <Paperclip aria-hidden="true" />
                Add mock attachment
              </Button>
              {attachmentIds.length > 0 ? (
                <span className="text-xs text-muted-foreground">
                  {attachmentIds.length} mock attachment{attachmentIds.length === 1 ? "" : "s"}{" "}
                  ready
                </span>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {status ? (
            <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
              {status}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-border px-3 py-2.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canEdit || isBusy}
          onClick={() => void saveDraft()}
        >
          {isSaving ? "Saving draft…" : "Save draft"}
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!canSubmit || isBusy}
          onClick={() => void sendOutbound()}
        >
          {isSending ? "Sending…" : "Send outbound"}
        </Button>
      </div>
    </section>
  );
}

function defaultMailboxId(thread: MailThread, mailboxes: readonly MailMailbox[]): string {
  return mailboxes.find((mailbox) => mailbox.id === thread.mailboxId)?.id ?? mailboxes[0]?.id ?? "";
}
