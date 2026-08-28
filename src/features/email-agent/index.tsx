import { EmailDetailPage as EmailDetailComposition } from "./email-detail";
import { EmailInboxPage } from "./inbox";

export function EmailAgentPage() {
  return <EmailInboxPage />;
}

export function EmailDetailPage({ emailId }: { emailId: string }) {
  return <EmailDetailComposition emailId={emailId} />;
}
