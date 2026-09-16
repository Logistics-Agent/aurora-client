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
    <section
      aria-label="Conversation timeline"
      className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain pr-1"
    >
      <h2 className="font-heading shrink-0 text-base font-semibold">Conversation</h2>
      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No messages in this conversation.</p>
      ) : (
        <ol className="grid gap-2">
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
      )}
    </section>
  );
}
