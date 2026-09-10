import { PageHeader } from "@/components/layout";

import { DocumentReview } from "../components/document-review";

export function UploadDocumentPage() {
  return (
    <>
      <PageHeader
        title="Upload Document"
        description="Submit an object-storage reference to the OCR service and track its processing status."
      />
      <DocumentReview showUpload />
    </>
  );
}
