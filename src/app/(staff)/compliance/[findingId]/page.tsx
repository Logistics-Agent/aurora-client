import { ComplianceDetailPage } from "@/features/compliance";
export default async function Page({
  params,
}: {
  params: Promise<{ findingId: string }>;
}) {
  const { findingId } = await params;
  return <ComplianceDetailPage findingId={findingId} />;
}
