"use client";

import { useRef, useState } from "react";
import {
  FileText,
  Paperclip,
  Reply as ReplyIcon,
  Send,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MailMailbox, MailThread } from "../../types";
import type { MailDraftFormValues, RealAttachmentItem } from "../types";
import { validateMailDraft } from "../utils/validate-mail-draft";
import { AiDraftSuggestion } from "./ai-draft-suggestion";
import { RichTextEditor } from "./rich-text-editor";

export interface ReplyComposerProps {
  thread: MailThread;
  mailboxes: readonly MailMailbox[];
  canCreateDraft: boolean;
  canSend: boolean;
  canClaim: boolean;
  inline?: boolean;
  onClaim?: () => Promise<void> | void;
  onClose?: () => void;
  allowMockAttachments?: boolean;
  onSave: (draft: MailDraftFormValues) => Promise<void> | void;
  onSend: (draft: MailDraftFormValues) => Promise<void> | void;
}

const LOGISTICS_TEMPLATES = [
  {
    label: "Báo giá vận chuyển (Freight Quote)",
    text: `<p>Kính gửi Quý khách,</p><p>Chúng tôi xin gửi thông tin báo giá cước vận chuyển cho lô hàng của Quý khách:</p><ul><li><strong>Tuyến vận chuyển:</strong> Cảng đi - Cảng đến</li><li><strong>Loại container/hàng:</strong> 20GP / 40HC / LCL</li><li><strong>Đơn giá cước:</strong> USD ... / cont</li><li><strong>Phụ phí địa phương (Local charges):</strong> Theo biểu phí chuẩn</li><li><strong>Thời gian vận chuyển dự kiến (Transit time):</strong> ... ngày</li></ul><p>Báo giá có hiệu lực trong vòng 14 ngày. Trân trọng cảm ơn Quý khách!</p>`,
  },
  {
    label: "Cập nhật tiến độ giao hàng (Shipment Update)",
    text: `<p>Kính gửi Quý khách,</p><p>Aurora Operations xin cập nhật tiến độ vận chuyển đơn hàng:</p><ul><li><strong>Mã vận đơn (B/L No):</strong> ...</li><li><strong>Tên tàu / Chuyến:</strong> ...</li><li><strong>Trạng thái hiện tại:</strong> Đang trên hải trình / Đã cập cảng</li><li><strong>Dự kiến giao hàng (ETA):</strong> ...</li></ul><p>Nếu cần hỗ trợ thêm, Quý khách vui lòng phản hồi email này.</p>`,
  },
  {
    label: "Thông quan & Kiểm hóa hải quan (Customs Clearance)",
    text: `<p>Kính gửi Quý khách,</p><p>Lô hàng của Quý khách đã hoàn tất thủ tục mở tờ khai hải quan:</p><ul><li><strong>Số tờ khai:</strong> ...</li><li><strong>Phân luồng:</strong> Luồng Xanh / Luồng Vàng / Luồng Đỏ</li><li><strong>Tình trạng kiểm hóa:</strong> Đã thông quan</li></ul><p>Bộ phận điều xe đang tiến hành nhận hàng và giao đến kho của Quý khách theo kế hoạch.</p>`,
  },
];

export function ReplyComposer({
  thread,
  mailboxes,
  canCreateDraft,
  canSend,
  canClaim,
  inline = false,
  onClaim,
  onClose,
  allowMockAttachments = true,
  onSave,
  onSend,
}: ReplyComposerProps): React.JSX.Element {
  const [senderMailboxId, setSenderMailboxId] = useState(() => defaultMailboxId(thread, mailboxes));
  const [body, setBody] = useState(thread.draft?.body ?? "");
  const [bodyHtml, setBodyHtml] = useState(thread.draft?.body ?? "");
  const [attachmentIds, setAttachmentIds] = useState<readonly string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; size: number }>>([]);
  const [attachments, setAttachments] = useState<RealAttachmentItem[]>([]);
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
  const computedHtml = bodyHtml || (body ? `<p>${body.replace(/\n/g, "<br/>")}</p>` : "");
  const draft: MailDraftFormValues = {
    senderMailboxId,
    body,
    bodyHtml: computedHtml,
    attachmentIds,
    attachments,
  };

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
      setBodyHtml("");
      setAttachmentIds([]);
      setAttachedFiles([]);
      setAttachments([]);
      setStatus("Outbound message sent.");
      onClose?.();
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const newAttachmentIds: string[] = [];
    const newAttachedFiles: Array<{ name: string; size: number }> = [];
    const newRealAttachments: RealAttachmentItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = `attachment-${Date.now()}-${i}-${file.name}`;
      newAttachmentIds.push(id);
      newAttachedFiles.push({ name: file.name, size: file.size });
      try {
        const base64 = await readFileAsBase64(file);
        newRealAttachments.push({
          id,
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          contentBase64: base64,
        });
      } catch {
        setError(`Lỗi khi đọc tệp đính kèm ${file.name}`);
      }
    }

    setAttachmentIds((current) => [...current, ...newAttachmentIds]);
    setAttachedFiles((current) => [...current, ...newAttachedFiles]);
    setAttachments((current) => [...current, ...newRealAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachmentIds((current) => current.filter((_, i) => i !== index));
    setAttachedFiles((current) => current.filter((_, i) => i !== index));
    setAttachments((current) => current.filter((_, i) => i !== index));
  };

  const containerClasses = inline
    ? "flex min-h-[380px] max-h-[500px] flex-col rounded-xl border border-primary/30 bg-card shadow-sm mt-2 overflow-hidden animate-in fade-in-0 duration-200"
    : "fixed inset-x-2 bottom-2 z-50 flex h-[min(560px,calc(100vh-1rem))] min-h-0 animate-in flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl duration-200 ease-out fade-in-0 slide-in-from-bottom-4 motion-reduce:animate-none sm:inset-x-auto sm:right-4 sm:bottom-0 sm:h-[min(560px,calc(100vh-1rem))] sm:w-[min(620px,calc(100vw-1rem))] sm:rounded-b-none";

  return (
    <section
      aria-label="Reply composer"
      className={containerClasses}
    >
      {/* Header bar */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-muted/40 px-3.5 py-2">
        <div className="flex items-center gap-2">
          <ReplyIcon aria-hidden="true" className="size-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            {inline ? "Trả lời trực tiếp (Inline Reply)" : "Reply"} —{" "}
            <span className="text-muted-foreground font-normal">Re: {thread.subject}</span>
          </h2>
        </div>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Close reply composer"
            onClick={onClose}
            className="hover:bg-muted"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3.5 space-y-3">
        {/* Recipient & Subject Header */}
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Người nhận (To):</span>
            <div className="flex min-h-8 flex-wrap items-center gap-1 rounded-lg border border-input bg-muted/20 px-2 py-1">
              {thread.participants.map((participant) => (
                <span
                  key={participant.email}
                  className="inline-flex max-w-full items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                >
                  <span className="truncate">{participant.email}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Gửi từ hòm thư chung (From):</span>
            <Select
              value={senderMailboxId}
              disabled={!canEdit || isBusy || mailboxes.length === 0}
              onValueChange={setSenderMailboxId}
            >
              <SelectTrigger aria-label="From shared mailbox" size="sm" className="w-full text-xs">
                <SelectValue placeholder="Chọn mailbox gửi" />
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
        </div>

        {/* Claim check alerts */}
        {requiresClaim ? (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900">
            <span>Take this thread before writing a reply.</span>
            <Button
              type="button"
              size="sm"
              disabled={!canClaim || !onClaim || isBusy}
              onClick={() => void claimThread()}
            >
              Take thread to reply
            </Button>
          </div>
        ) : null}

        {!requiresClaim && !canEdit ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
            You do not have permission to compose replies for this thread.
          </p>
        ) : null}

        {/* Quick Logistics Templates & AI Suggestions */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            disabled={!canEdit || isBusy}
            onValueChange={(val) => {
              const tmpl = LOGISTICS_TEMPLATES.find((t) => t.label === val);
              if (tmpl) {
                setBodyHtml((prev) => `${prev}${tmpl.text}`);
                setBody((prev) => `${prev}\n\n${tmpl.label}`);
              }
            }}
          >
            <SelectTrigger aria-label="Mẫu thư logistics" size="sm" className="w-auto text-xs gap-1.5 h-7">
              <FileText className="size-3.5 text-muted-foreground" />
              <span>Chèn mẫu thư Logistics</span>
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              {LOGISTICS_TEMPLATES.map((tmpl) => (
                <SelectItem key={tmpl.label} value={tmpl.label} className="text-xs">
                  {tmpl.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {thread.aiDraftSuggestion ? (
            <AiDraftSuggestion
              suggestion={thread.aiDraftSuggestion}
              disabled={!canEdit || isBusy}
              onInsert={(text) => {
                setBody(text);
                setBodyHtml(`<p>${text.replace(/\n/g, "<br/>")}</p>`);
                setError(null);
                setStatus(null);
              }}
            />
          ) : null}
        </div>

        {/* Rich Text Editor with Bold, Italic, Underline, Fonts, Colors, Lists, Links */}
        <div className="grid gap-1.5">
          <label htmlFor="reply-body" className="text-xs font-medium text-muted-foreground">
            Reply message
          </label>
          <RichTextEditor
            initialHtml={bodyHtml}
            placeholder="Soạn nội dung phản hồi khách hàng (hỗ trợ in đậm, gạch chân, đổi màu, mẫu thư...)..."
            disabled={!canEdit || isBusy}
            onAttach={() => fileInputRef.current?.click()}
            onChange={(html, plainText) => {
              setBodyHtml(html);
              setBody(plainText);
            }}
            className="min-h-[160px]"
          />
          {/* Accessible textarea for form values & test compatibility */}
          <textarea
            id="reply-body"
            className="sr-only"
            value={body}
            disabled={!canEdit || isBusy}
            onChange={(e) => {
              setBody(e.target.value);
              setBodyHtml(`<p>${e.target.value.replace(/\n/g, "<br/>")}</p>`);
            }}
            aria-label="Reply message"
          />
        </div>

        {/* Hidden File Input for Toolbar Paperclip */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Attached Files List & Mock Button (if in mock mode) */}
        {(attachedFiles.length > 0 || attachmentIds.length > 0 || allowMockAttachments) && (
          <div className="flex flex-wrap items-center gap-2">
            {allowMockAttachments ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-[11px] text-muted-foreground hover:text-foreground"
                disabled={!canEdit || isBusy}
                onClick={() =>
                  setAttachmentIds((current) => [
                    ...current,
                    `mock-attachment-${current.length + 1}`,
                  ])
                }
              >
                Add mock attachment
              </Button>
            ) : null}

            {attachedFiles.map((file, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/60 px-2.5 py-1 text-xs text-foreground font-medium shadow-2xs"
              >
                <Paperclip className="size-3 text-primary" />
                <span className="truncate max-w-[200px]">{file.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  ({Math.round(file.size / 1024)} KB)
                </span>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-destructive cursor-pointer ml-0.5 p-0.5"
                  onClick={() => removeAttachment(idx)}
                  title={`Xóa ${file.name}`}
                >
                  <Trash2 className="size-3" />
                </button>
              </span>
            ))}

            {attachmentIds.length > 0 && attachedFiles.length === 0 ? (
              <span className="text-xs text-muted-foreground">
                {attachmentIds.length} mock attachment{attachmentIds.length === 1 ? "" : "s"} ready
              </span>
            ) : null}
          </div>
        )}

        {error ? (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        ) : null}
        {status ? (
          <p role="status" aria-live="polite" className="text-xs text-emerald-600 font-medium">
            {status}
          </p>
        ) : null}
      </div>

      {/* Footer Actions */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border/60 bg-muted/20 px-3.5 py-2.5">
        <div className="flex items-center gap-1.5">
          {onClose ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isBusy}
              onClick={onClose}
              className="h-8 text-xs text-muted-foreground"
            >
              Thu gọn
            </Button>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            disabled={!canEdit || isBusy}
            onClick={() => void saveDraft()}
          >
            {isSaving ? "Saving draft…" : "Save draft"}
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!canSubmit || isBusy}
            onClick={() => void sendOutbound()}
          >
            <Send className="size-3.5" />
            {isSending ? "Sending…" : "Send outbound"}
          </Button>
        </div>
      </div>
    </section>
  );
}

function defaultMailboxId(thread: MailThread, mailboxes: readonly MailMailbox[]): string {
  return mailboxes.find((mailbox) => mailbox.id === thread.mailboxId)?.id ?? mailboxes[0]?.id ?? "";
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

