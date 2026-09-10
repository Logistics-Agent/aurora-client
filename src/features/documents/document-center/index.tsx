import { PageHeader } from "@/components/layout";

import { DocumentReview } from "../components/document-review";

export function DocumentCenterPage() {
  return (
    <>
      <PageHeader
        title="Document Center"
        description="Review persisted OCR jobs and approve or reject extraction explicitly."
      />
      <DocumentReview />
    </>
  );
}
