import { EmailDetailPage } from "@/features/email-agent";
export default async function Page({
  params,
}: {
  params: Promise<{ emailId: string }>;
}) {
  const { emailId } = await params;
  return <EmailDetailPage emailId={emailId} />;
}
