import { ArrowDownLeft, Paperclip } from "lucide-react";
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
  const formattedDate = (() => {
    try {
      const d = new Date(message.sentAt);
      if (Number.isNaN(d.getTime())) return message.sentAt;
      return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(d);
    } catch {
      return message.sentAt;
    }
  })();

  return (
    <article className="grid gap-3 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 bg-emerald-50/20 dark:bg-card/70 dark:border-slate-800 dark:border-l-emerald-500 p-4 shadow-xs transition-colors hover:bg-emerald-50/40">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 dark:border-border/40 pb-2.5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-2xs">
            {message.authorName ? message.authorName.charAt(0).toUpperCase() : "K"}
          </div>
          <div className="grid gap-0.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800 px-2 py-0.5 text-xs font-semibold">
                <ArrowDownLeft className="size-3 text-emerald-600 dark:text-emerald-400" />
                Thư đến (Inbound)
              </span>
              <h3 className="text-sm font-semibold text-foreground">{message.authorName}</h3>
            </div>
            <p className="text-xs text-muted-foreground">{message.senderAddress}</p>
          </div>
        </div>
        <time
          className="text-xs font-medium text-muted-foreground"
          dateTime={message.sentAt}
          aria-label={`Received ${formattedDate}`}
          title={message.sentAt}
        >
          {formattedDate}
        </time>
      </header>

      {message.bodyHtml ? (
        <div
          className="text-sm leading-relaxed text-foreground break-words prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: message.bodyHtml }}
        />
      ) : (
        <div className="text-sm leading-relaxed text-foreground break-words whitespace-pre-wrap">
          {message.bodyText || "(Email không có nội dung văn bản)"}
        </div>
      )}

      {message.attachments && message.attachments.length > 0 ? (
        <div className="border-t border-emerald-100 dark:border-border/40 pt-2.5">
          <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
            <Paperclip className="size-3.5 text-emerald-600" />
            Tệp đính kèm ({message.attachments.length}):
          </p>
          <ul className="flex flex-wrap gap-2" aria-label="Attachments">
            {message.attachments.map((attachment) => (
              <li key={attachment.id}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs bg-white/80 hover:bg-white dark:bg-card"
                  aria-label={`Open ${attachment.fileName}`}
                  onClick={() => onAttachmentOpen?.(attachment)}
                  disabled={!onAttachmentOpen}
                >
                  <Paperclip className="size-3 text-emerald-600" />
                  <span>{attachment.fileName}</span>
                  {attachment.sizeBytes > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      ({Math.round(attachment.sizeBytes / 1024)} KB)
                    </span>
                  )}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
