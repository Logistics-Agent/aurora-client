import { PageHeader } from "@/components/layout";
import { DocumentReview } from "../components/document-review";

export function DocumentCenterPage() {
  return (
    <>
      <PageHeader
        title="Document Center"
        description="Review local document fixtures and approve extraction explicitly."
      />
      <DocumentReview />
    </>
  );
}
