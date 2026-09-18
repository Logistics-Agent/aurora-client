import { ArrowUpRight, Paperclip, Send } from "lucide-react";
import { MailboxIdentity } from "@/components/common/mail";
import { Button } from "@/components/ui/button";
import type { MailAttachment, MailMessage } from "../../types";

export interface OutboundMessageProps {
  message: MailMessage;
  onAttachmentOpen?: (attachment: MailAttachment) => void;
}

export function OutboundMessage({ message, onAttachmentOpen }: OutboundMessageProps): React.JSX.Element {
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
    <article className="grid gap-3 rounded-xl border border-blue-200 border-l-4 border-l-blue-600 bg-blue-50/40 dark:bg-blue-950/20 dark:border-blue-900 dark:border-l-blue-500 p-4 shadow-xs transition-colors hover:bg-blue-50/60">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200/60 dark:border-blue-900/60 pb-2.5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/80 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 shadow-2xs">
            <Send className="size-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="grid gap-0.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-100/90 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-300 dark:border-blue-700 px-2 py-0.5 text-xs font-semibold">
                <ArrowUpRight className="size-3 text-blue-600 dark:text-blue-400" />
                Thư gửi đi (Outbound)
              </span>
              <MailboxIdentity address={message.senderAddress} label="Shared sender" />
            </div>
            <p className="text-xs text-muted-foreground">Authenticated author: {message.authorName}</p>
          </div>
        </div>
        <div className="text-right">
          <time
            className="text-xs font-medium text-muted-foreground"
            dateTime={message.sentAt}
            aria-label={`Sent ${formattedDate}`}
            title={message.sentAt}
          >
            {formattedDate}
          </time>
          <span className="mt-0.5 inline-block rounded bg-blue-100/70 px-1.5 py-0.2 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 uppercase tracking-wider">
            {message.deliveryStatus}
          </span>
        </div>
      </header>

      {message.bodyHtml ? (
        <div
          className="text-sm leading-relaxed text-foreground break-words prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: message.bodyHtml }}
        />
      ) : (
        <div className="text-sm leading-relaxed text-foreground break-words whitespace-pre-wrap">
          {message.bodyText || "(Email không có nội dung)"}
        </div>
      )}

      {message.attachments && message.attachments.length > 0 ? (
        <div className="border-t border-blue-200/60 dark:border-blue-900/60 pt-2.5">
          <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
            <Paperclip className="size-3.5 text-blue-600" />
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
                  <Paperclip className="size-3 text-blue-600" />
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
