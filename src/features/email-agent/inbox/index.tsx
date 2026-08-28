import { PageHeader } from "@/components/layout";
import { EmailReview } from "../components/email-review";

export function EmailInboxPage() {
  return (
    <>
      <PageHeader
        title="Email Agent Inbox"
        description="Review extracted carrier requests before approval."
      />
      <EmailReview />
    </>
  );
}
