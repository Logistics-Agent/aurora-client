import { MailboxIdentity } from "@/components/common/mail";
import type { MailMessage } from "../../types";

export function OutboundMessage({ message }: { message: MailMessage }): React.JSX.Element {
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
    <article className="grid gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-xs">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/15 pb-2.5">
        <div className="grid gap-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
              Thư gửi đi (Outbound)
            </span>
            <MailboxIdentity address={message.senderAddress} label="Shared sender" />
          </div>
          <p className="text-xs text-muted-foreground">Authenticated author: {message.authorName}</p>
        </div>
        <div className="text-right">
          <time
            className="text-xs text-muted-foreground"
            dateTime={message.sentAt}
            aria-label={`Sent ${message.sentAt}`}
          >
            {message.sentAt}
          </time>
          <span className="mt-0.5 block text-[10px] text-muted-foreground uppercase tracking-wider">
            {message.deliveryStatus}
          </span>
        </div>
      </header>

      <div className="text-sm leading-relaxed text-foreground break-words whitespace-pre-wrap">
        {message.bodyText || "(Email không có nội dung)"}
      </div>
    </article>
  );
}
