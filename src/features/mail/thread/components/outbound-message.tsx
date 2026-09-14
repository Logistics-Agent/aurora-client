import { Send, CheckCircle } from "lucide-react";
import type { MailMessage } from "../../types";

export interface OutboundMessageProps {
  message: MailMessage;
}

export function OutboundMessage({
  message,
}: OutboundMessageProps): React.JSX.Element {
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
    <article className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-3xs space-y-3">
      <header className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs border border-primary/20 shrink-0">
            <Send className="size-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-xs text-foreground">
                {message.authorName || message.senderAddress.split("@")[0]}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                &lt;{message.senderAddress}&gt;
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle className="size-3 text-emerald-600" />
          <time className="text-[11px] text-muted-foreground font-medium" dateTime={message.sentAt}>
            {formattedDate || message.sentAt}
          </time>
        </div>
      </header>

      {/* Full Content with scroll if long */}
      <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap break-words font-normal max-h-[320px] overflow-y-auto pr-1 select-text">
        {message.bodyText || <span className="italic text-muted-foreground">(No body text)</span>}
      </div>
    </article>
  );
}
