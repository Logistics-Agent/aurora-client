import { UploadDocumentPage } from "@/features/documents";

type UploadPageSearchParams = Promise<{
  shipmentId?: string | string[];
}>;

export default async function Page({ searchParams }: { searchParams: UploadPageSearchParams }) {
  const params = await searchParams;
  const shipmentId = Array.isArray(params.shipmentId) ? params.shipmentId[0] : params.shipmentId;

  return <UploadDocumentPage shipmentId={shipmentId} />;
}
