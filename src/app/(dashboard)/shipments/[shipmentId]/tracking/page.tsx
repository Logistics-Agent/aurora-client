import { TrackingPage } from "@/features/route-tracking";

export default async function Page({
  params,
}: {
  params: Promise<{ shipmentId: string }>;
}) {
  const { shipmentId } = await params;
  return <TrackingPage shipmentId={shipmentId} />;
}
