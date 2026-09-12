import { ComplianceDetailPage } from "@/features/compliance";
export default async function Page({ params }: { params: Promise<{ evaluationId: string }> }) {
  const { evaluationId } = await params;
  return <ComplianceDetailPage evaluationId={evaluationId} />;
}
