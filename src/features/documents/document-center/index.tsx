import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout";

import { DocumentReview } from "../components/document-review";

export function DocumentCenterPage() {
  return (
    <>
      <PageHeader
        title="Document Center"
        description="Review persisted OCR jobs and approve or reject extraction explicitly."
        actions={
          <Button asChild>
            <Link href="/documents/upload">Upload Document</Link>
          </Button>
        }
      />
      <DocumentReview />
    </>
  );
}
