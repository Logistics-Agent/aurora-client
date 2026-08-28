import { CustomerPortalPage } from "@/features/customer-portal";

export default async function Page({
  params,
}: {
  params: Promise<{ shipmentId: string }>;
}) {
  const { shipmentId } = await params;
  return (
    <CustomerPortalPage kind="customer-tracking" shipmentId={shipmentId} />
  );
}
