import { StatusBadge } from "@/components/common";
import { PageHeader } from "@/components/layout";
import { DocumentReview } from "../components/document-review";

export function OcrReviewPage({ documentId }: { documentId: string }) {
  return (
    <>
      <PageHeader
        breadcrumb={["Documents", documentId]}
        title="OCR Review"
        description={`Review extracted fields for ${documentId}.`}
        actions={<StatusBadge label="Human review required" intent="warning" />}
      />
      <DocumentReview showOcrFields initialDocumentId={documentId} />
    </>
  );
}
