import { MessageSquare } from "lucide-react";
import type { MailAttachment, MailMessage } from "../../types";
import { InboundMessage } from "./inbound-message";
import { OutboundMessage } from "./outbound-message";

export interface MessageTimelineProps {
  messages: readonly MailMessage[];
  onAttachmentOpen?: (attachment: MailAttachment) => void;
}

export function MessageTimeline({
  messages,
  onAttachmentOpen,
}: MessageTimelineProps): React.JSX.Element {
  return (
    <section aria-label="Conversation timeline" className="grid gap-2.5">
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="size-4 text-slate-500" />
          <h2 className="font-heading text-sm font-semibold text-slate-800">Conversation</h2>
        </div>
        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
          {messages.length} {messages.length === 1 ? "message" : "messages"}
        </span>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center">
          <p className="text-xs text-muted-foreground">No messages in this conversation yet.</p>
        </div>
      ) : (
        <div className="max-h-[460px] overflow-y-auto pr-1.5 space-y-3 rounded-lg scroll-smooth">
          <ol className="grid gap-3">
            {messages.map((message) => (
              <li key={message.id}>
                {message.direction === "inbound" ? (
                  <InboundMessage message={message} onAttachmentOpen={onAttachmentOpen} />
                ) : (
                  <OutboundMessage message={message} />
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

