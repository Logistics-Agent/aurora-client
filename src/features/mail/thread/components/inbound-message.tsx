import { User, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MailAttachment, MailMessage } from "../../types";

export interface InboundMessageProps {
  message: MailMessage;
  onAttachmentOpen?: (attachment: MailAttachment) => void;
}

export function InboundMessage({
  message,
  onAttachmentOpen,
}: InboundMessageProps): React.JSX.Element {
  const formattedDate = message.sentAt
    ? new Date(message.sentAt).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-3xs space-y-3">
      <header className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-xs border border-slate-200 shrink-0">
            <User className="size-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-xs text-slate-900">{message.authorName || message.senderAddress.split("@")[0]}</span>
              <span className="text-[11px] text-slate-500 font-mono">&lt;{message.senderAddress}&gt;</span>
            </div>
          </div>
        </div>
        <time className="text-[11px] text-slate-400 font-medium" dateTime={message.sentAt}>
          {formattedDate || message.sentAt}
        </time>
      </header>

      {/* Full Content with scroll if long */}
      <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap break-words font-normal max-h-[320px] overflow-y-auto pr-1 select-text">
        {message.bodyText || <span className="italic text-slate-400">(No body text)</span>}
      </div>

      {message.attachments.length > 0 && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 items-center">
          {message.attachments.map((attachment) => (
            <Button
              key={attachment.id}
              variant="outline"
              size="sm"
              onClick={() => onAttachmentOpen?.(attachment)}
              disabled={!onAttachmentOpen}
              className="text-xs gap-1.5 h-7"
            >
              <Paperclip className="size-3 text-slate-500" />
              {attachment.fileName}
            </Button>
          ))}
        </div>
      )}
    </article>
  );
}

