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
  return (
    <article className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4">
      <header className="grid gap-0.5">
        <h3 className="font-medium">Received from {message.authorName}</h3>
        <p className="text-sm text-muted-foreground">From: {message.senderAddress}</p>
        <time
          className="text-xs text-muted-foreground"
          dateTime={message.sentAt}
          aria-label={`Received ${message.sentAt}`}
        >
          {message.sentAt}
        </time>
      </header>
      <p className="whitespace-pre-wrap break-words">{message.bodyText}</p>
      {message.attachments.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Attachments">
          {message.attachments.map((attachment) => (
            <li key={attachment.id}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAttachmentOpen?.(attachment)}
                disabled={!onAttachmentOpen}
              >
                Open {attachment.fileName}
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
