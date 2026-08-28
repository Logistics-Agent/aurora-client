import { DocumentCenterPage as DocumentCenterComposition } from "./document-center";
import { OcrReviewPage as OcrReviewComposition } from "./ocr-review";
import { UploadDocumentPage as UploadDocumentComposition } from "./upload-document";

export function DocumentsPage() {
  return <DocumentCenterComposition />;
}

export function UploadDocumentPage() {
  return <UploadDocumentComposition />;
}

export function OcrReviewPage({ documentId }: { documentId?: string }) {
  return <OcrReviewComposition documentId={documentId ?? "INV-2026-0048"} />;
}
