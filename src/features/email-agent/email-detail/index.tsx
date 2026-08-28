import { StatusBadge } from "@/components/common";
import { PageHeader } from "@/components/layout";
import { EmailReview } from "../components/email-review";

export function EmailDetailPage({ emailId }: { emailId: string }) {
  return (
    <>
      <PageHeader
        breadcrumb={["Email Agent", emailId]}
        title={emailId}
        description="Review the extracted request and approve it explicitly."
        actions={<StatusBadge label="Human review" intent="warning" />}
      />
      <EmailReview emailId={emailId} />
    </>
  );
}
