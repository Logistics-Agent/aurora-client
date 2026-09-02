import { NegotiationDetailPage } from "@/features/commercial";
export default async function Page({
  params,
}: {
  params: Promise<{ negotiationId: string }>;
}) {
  const { negotiationId } = await params;
  return <NegotiationDetailPage negotiationId={negotiationId} />;
}
