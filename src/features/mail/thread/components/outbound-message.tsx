import { MailboxIdentity } from "@/components/common/mail";
import type { MailMessage } from "../../types";

export function OutboundMessage({ message }: { message: MailMessage }): React.JSX.Element {
  return (
    <article className="grid gap-3 rounded-lg border border-blue-200 bg-blue-50/40 p-4">
      <header className="grid gap-1">
        <h3 className="font-medium">Outbound message</h3>
        <MailboxIdentity address={message.senderAddress} label="Shared sender" />
        <p className="text-sm text-muted-foreground">
          Authenticated author: {message.authorName}
        </p>
        <p className="text-xs text-muted-foreground">
          Delivery: {message.deliveryStatus}
        </p>
        <time
          className="text-xs text-muted-foreground"
          dateTime={message.sentAt}
          aria-label={`Sent ${message.sentAt}`}
        >
          {message.sentAt}
        </time>
      </header>
      <p className="whitespace-pre-wrap break-words">{message.bodyText}</p>
    </article>
  );
}
