"use client";

import { useState } from "react";
import { Paperclip } from "lucide-react";

import { Button } from "@/components/ui/button";
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
    const result = validateMailDraft(draft, mailboxes.map((mailbox) => mailbox.id));
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
    <section aria-label="Reply composer" className="grid gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">Reply</h2>
          <p className="text-sm text-muted-foreground">
            To: {thread.participants.map((participant) => `${participant.name} <${participant.email}>`).join(", ")}
          </p>
          <p className="text-sm text-muted-foreground">Subject: Re: {thread.subject}</p>
        </div>
        {requiresClaim ? (
          <Button type="button" size="sm" disabled={!canClaim || !onClaim || isBusy} onClick={() => void claimThread()}>
            Take thread to reply
          </Button>
        ) : null}
      </div>

      {requiresClaim ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Take this thread before writing a reply. Focusing or typing never claims it automatically.
        </p>
      ) : null}
      {!requiresClaim && !canEdit ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          You do not have permission to compose replies for this thread.
        </p>
      ) : null}

      <div className="grid gap-1.5">
        <label htmlFor="reply-sender-mailbox" className="text-sm font-medium">From shared mailbox</label>
        <select
          id="reply-sender-mailbox"
          value={senderMailboxId}
          disabled={!canEdit || isBusy || mailboxes.length === 0}
          onChange={(event) => setSenderMailboxId(event.target.value)}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50"
        >
          {mailboxes.map((mailbox) => (
            <option key={mailbox.id} value={mailbox.id}>
              {mailbox.displayName} — {mailbox.senderAddress}
            </option>
          ))}
        </select>
      </div>

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
        <label htmlFor="reply-body" className="text-sm font-medium">Reply message</label>
        <Textarea
          id="reply-body"
          value={body}
          disabled={!canEdit || isBusy}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Write a customer-ready reply…"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canEdit || isBusy}
          onClick={() => setAttachmentIds((current) => [...current, `mock-attachment-${current.length + 1}`])}
        >
          <Paperclip aria-hidden="true" />
          Add mock attachment
        </Button>
        {attachmentIds.length > 0 ? (
          <span className="text-xs text-muted-foreground">
            {attachmentIds.length} mock attachment{attachmentIds.length === 1 ? "" : "s"} ready
          </span>
        ) : null}
      </div>

      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      {status ? <p role="status" aria-live="polite" className="text-sm text-muted-foreground">{status}</p> : null}

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" disabled={!canEdit || isBusy} onClick={() => void saveDraft()}>
          {isSaving ? "Saving draft…" : "Save draft"}
        </Button>
        <Button type="button" disabled={!canSubmit || isBusy} onClick={() => void sendOutbound()}>
          {isSending ? "Sending…" : "Send outbound"}
        </Button>
      </div>
    </section>
  );
}

function defaultMailboxId(thread: MailThread, mailboxes: readonly MailMailbox[]): string {
  return mailboxes.find((mailbox) => mailbox.id === thread.mailboxId)?.id ?? mailboxes[0]?.id ?? "";
}
