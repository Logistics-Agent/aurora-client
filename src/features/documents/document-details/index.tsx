import { PageHeader } from "@/components/layout";

import { DocumentReview } from "../components/document-review";

export function DocumentDetailsPage({ documentId }: { documentId: string }) {
  return (
    <>
      <PageHeader
        breadcrumb={["Documents", documentId]}
        title="Document details"
        description={`Track processing status and actions for ${documentId}.`}
      />
      <DocumentReview initialDocumentId={documentId} />
    </>
  );
}
