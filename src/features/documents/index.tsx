import { DocumentCenterPage as DocumentCenterComposition } from "./document-center";
import { DocumentDetailsPage as DocumentDetailsComposition } from "./document-details";
import { OcrReviewPage as OcrReviewComposition } from "./ocr-review";
import { UploadDocumentPage as UploadDocumentComposition } from "./upload-document";

export function DocumentsPage() {
  return <DocumentCenterComposition />;
}

export function UploadDocumentPage({ shipmentId }: { shipmentId?: string }) {
  return <UploadDocumentComposition shipmentId={shipmentId} />;
}

export function OcrReviewPage({ documentId }: { documentId: string }) {
  return <OcrReviewComposition documentId={documentId} />;
}

export function DocumentDetailsPage({ documentId }: { documentId: string }) {
  return <DocumentDetailsComposition documentId={documentId} />;
}
