import { Paperclip } from "lucide-react";
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
      return new Date(message.sentAt).toLocaleString("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return message.sentAt;
    }
  })();

  return (
    <article className="grid gap-3 rounded-xl border border-border bg-card/60 p-4 shadow-xs transition-colors hover:bg-card">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {message.authorName.charAt(0).toUpperCase()}
          </div>
          <div className="grid gap-0.5">
            <h3 className="text-sm font-semibold text-foreground">{message.authorName}</h3>
            <p className="text-xs text-muted-foreground">{message.senderAddress}</p>
          </div>
        </div>
        <time
          className="text-xs text-muted-foreground"
          dateTime={message.sentAt}
          aria-label={`Received ${message.sentAt}`}
        >
          {message.sentAt}
        </time>
      </header>

      <div className="text-sm leading-relaxed text-foreground break-words whitespace-pre-wrap">
        {message.bodyText || "(Email không có nội dung văn bản)"}
      </div>

      {message.attachments.length > 0 ? (
        <div className="border-t border-border/40 pt-2.5">
          <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
            <Paperclip className="size-3.5" />
            Tệp đính kèm ({message.attachments.length}):
          </p>
          <ul className="flex flex-wrap gap-2" aria-label="Attachments">
            {message.attachments.map((attachment) => (
              <li key={attachment.id}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  aria-label={`Open ${attachment.fileName}`}
                  onClick={() => onAttachmentOpen?.(attachment)}
                  disabled={!onAttachmentOpen}
                >
                  <Paperclip className="size-3 text-muted-foreground" />
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
