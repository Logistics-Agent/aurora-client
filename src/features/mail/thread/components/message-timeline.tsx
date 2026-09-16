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
    <section aria-label="Conversation timeline" className="grid gap-3">
      <h2 className="font-heading text-base font-semibold">Conversation</h2>
      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No messages in this conversation.</p>
      ) : (
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
      )}
    </section>
  );
}
