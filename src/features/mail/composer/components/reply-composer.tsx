"use client";

import { useRef, useState } from "react";
import { Paperclip, X, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { MailMailbox, MailThread } from "../../types";
import type { MailDraftFormValues, RealAttachmentItem } from "../types";
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
  const [attachments, setAttachments] = useState<readonly RealAttachmentItem[]>([]);
  const [isSaving, setSaving] = useState(false);
  const [isSending, setSending] = useState(false);
  const [isClaiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requiresClaim = thread.assigneeId === null;
  const canEdit = canCreateDraft && !requiresClaim;
  const canSubmit = canEdit && canSend;
  const isBusy = isSaving || isSending || isClaiming;
  const draft: MailDraftFormValues = {
    senderMailboxId,
    body,
    attachmentIds: attachments.map((a) => a.id),
    attachments,
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: RealAttachmentItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const base64 = await readFileAsBase64(file);
        newItems.push({
          id: `att-${Date.now()}-${i}-${file.name}`,
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          contentBase64: base64,
        });
      } catch {
        setError(`Failed to read file ${file.name}`);
      }
    }

    setAttachments((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

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
      setAttachments([]);
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
    <section aria-label="Reply composer" className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-800">Reply</span>
          <span className="text-slate-300">·</span>
          <label htmlFor="reply-sender-mailbox" className="text-xs text-slate-500 font-medium">Send as:</label>
          <select
            id="reply-sender-mailbox"
            value={senderMailboxId}
            disabled={!canEdit || isBusy || mailboxes.length === 0}
            onChange={(event) => setSenderMailboxId(event.target.value)}
            className="h-7 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60"
          >
            {mailboxes.map((mailbox) => (
              <option key={mailbox.id} value={mailbox.id}>
                {mailbox.displayName} ({mailbox.senderAddress})
              </option>
            ))}
          </select>
        </div>

        {requiresClaim && (
          <Button
            type="button"
            size="sm"
            disabled={!canClaim || !onClaim || isBusy}
            onClick={() => void claimThread()}
            className="bg-primary hover:bg-primary/90 text-xs font-semibold h-7 shadow-3xs"
          >
            Take thread to reply
          </Button>
        )}
      </div>

      {requiresClaim && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900 flex items-center justify-between gap-2">
          <span>Take this thread before writing a reply so actions are attributed to you.</span>
        </div>
      )}
      {!requiresClaim && !canEdit && (
        <p className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900">
          You do not have permission to compose replies for this thread.
        </p>
      )}

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

      {/* AI Negotiation Quick Assist */}
      {canEdit && (
        <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-sky-50/50 to-primary/5 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <span className="text-base">✨</span>
              <span>AI Negotiation Assistant:</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">Bấm để điền mẫu phản hồi đàm phán</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() => {
                setBody(
                  `Kính gửi Quý đối tác / Hãng tàu,\n\nCảm ơn Quý công ty đã gửi bảng báo giá cước vận chuyển.\n\nSau khi rà soát mức giá thị trường và kế hoạch sản lượng tuyến này, chúng tôi xin đề xuất mức giá đàm phán (counter-offer): $17,950 / FEU (All-in).\n\nNếu Quý công ty đồng ý với mức giá trên, chúng tôi sẽ tiến hành xác nhận đặt chỗ (booking) ngay lập tức.\n\nRất mong sớm nhận được phản hồi từ Quý công ty.\n\nTrân trọng,\nĐội ngũ Operations`,
                );
                setStatus("Đã áp dụng mẫu Đàm phán giảm giá cước.");
              }}
              className="h-7 text-xs bg-white hover:bg-primary/10 border-primary/30 text-primary font-medium shadow-3xs"
            >
              📉 Đàm phán giảm giá
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() => {
                setBody(
                  `Kính gửi Quý đối tác / Hãng tàu,\n\nChúng tôi đồng ý với mức giá cước và các điều kiện đã báo cho lô hàng này.\n\nXin vui lòng phát hành Xác nhận đặt chỗ (Booking Confirmation) và thông báo giúp chúng tôi thời hạn hạ bãi (Cut-off time), địa điểm cấp vỏ container cùng lịch trình tàu dự kiến.\n\nTrân trọng cảm ơn,\nĐội ngũ Operations`,
                );
                setStatus("Đã áp dụng mẫu Chấp nhận giá & Xác nhận Booking.");
              }}
              className="h-7 text-xs bg-white hover:bg-emerald-50 border-emerald-300 text-emerald-700 font-medium shadow-3xs"
            >
              ✅ Chấp nhận giá & Booking
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() => {
                setBody(
                  `Kính gửi Quý đối tác / Hãng tàu,\n\nChúng tôi đã nhận được thông tin giá cước. Để hoàn thiện phương án vận chuyển, xin Quý công ty làm rõ thêm các nội dung sau:\n1. Số ngày miễn phí lưu bãi / lưu container (Free Demurrage & Detention) tại cảng đến.\n2. Lịch trình tàu chuyển tải (nếu có) và thời gian vận chuyển ước tính (Transit time).\n3. Các phụ phí phát sinh (nếu có) ngoài giá All-in.\n\nTrân trọng cảm ơn,\nĐội ngũ Operations`,
                );
                setStatus("Đã áp dụng mẫu Hỏi thêm Free-time & Lịch tàu.");
              }}
              className="h-7 text-xs bg-white hover:bg-sky-50 border-sky-300 text-sky-700 font-medium shadow-3xs"
            >
              ⏱️ Hỏi thêm Free-time & Lịch tàu
            </Button>
          </div>
        </div>
      )}

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

      {/* Real File Upload & Attachment List */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        onChange={handleFileSelect}
        className="hidden"
        id="reply-file-input"
      />

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canEdit || isBusy}
            onClick={() => fileInputRef.current?.click()}
            className="h-7 text-xs font-semibold gap-1.5 border-slate-200 hover:bg-slate-50 shadow-3xs"
          >
            <Paperclip className="size-3.5 text-slate-500" />
            Thêm tệp đính kèm (Attachment)
          </Button>
          {attachments.length > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {attachments.length} tệp đã chọn
            </span>
          )}
        </div>

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs shadow-3xs group"
              >
                <FileText className="size-3.5 text-primary shrink-0" />
                <span className="font-medium text-slate-800 max-w-[200px] truncate" title={att.fileName}>
                  {att.fileName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({formatFileSize(att.sizeBytes)})
                </span>
                <button
                  type="button"
                  disabled={!canEdit || isBusy}
                  onClick={() => handleRemoveAttachment(att.id)}
                  className="text-slate-400 hover:text-rose-600 font-bold ml-1 transition-colors"
                  aria-label={`Remove ${att.fileName}`}
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const base64 = res.includes(",") ? res.split(",")[1] : res;
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

