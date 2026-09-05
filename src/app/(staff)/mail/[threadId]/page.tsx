import { MailPage } from "@/features/mail";

export default async function Page({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;

  return <MailPage initialThreadId={threadId} />;
}
