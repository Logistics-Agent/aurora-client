import { AiExecutionDetailPage } from "@/features/administration";
export default async function Page({
  params,
}: {
  params: Promise<{ executionId: string }>;
}) {
  const { executionId } = await params;
  return <AiExecutionDetailPage executionId={executionId} />;
}
