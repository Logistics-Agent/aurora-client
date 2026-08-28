import { InvoiceDetailPage } from "@/features/commercial";
export default async function Page({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  return <InvoiceDetailPage invoiceId={invoiceId} />;
}
