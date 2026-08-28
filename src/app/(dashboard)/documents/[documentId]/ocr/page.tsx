import { OcrReviewPage } from "@/features/documents";
export default async function Page({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  return <OcrReviewPage documentId={documentId} />;
}
