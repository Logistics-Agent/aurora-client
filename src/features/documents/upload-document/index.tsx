import { PageHeader } from "@/components/layout";
import { DocumentReview } from "../components/document-review";

export function UploadDocumentPage() {
  return (
    <>
      <PageHeader
        title="Upload Document"
        description="Select a local fixture before backend upload integration."
      />
      <DocumentReview showUpload />
    </>
  );
}
