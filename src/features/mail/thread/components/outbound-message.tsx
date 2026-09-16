import { MailboxIdentity } from "@/components/common/mail";
import type { MailMessage } from "../../types";

export function OutboundMessage({ message }: { message: MailMessage }): React.JSX.Element {
  return (
    <article className="grid gap-2 rounded-lg border border-blue-200 bg-blue-50/40 p-3">
      <header className="grid gap-1">
        <h3 className="font-medium">Outbound message</h3>
        <MailboxIdentity address={message.senderAddress} label="Shared sender" />
        <p className="text-sm text-muted-foreground">Authenticated author: {message.authorName}</p>
        <p className="text-xs text-muted-foreground">Delivery: {message.deliveryStatus}</p>
        <time
          className="text-xs text-muted-foreground"
          dateTime={message.sentAt}
          aria-label={`Sent ${message.sentAt}`}
        >
          {message.sentAt}
        </time>
      </header>
      <p className="break-words whitespace-pre-wrap">{message.bodyText}</p>
    </article>
  );
}
