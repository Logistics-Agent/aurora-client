import { PageHeader } from "@/components/layout";

import { DocumentUploadForm } from "./components/document-upload-form";

export function UploadDocumentPage({ shipmentId }: { shipmentId?: string }) {
  return (
    <>
      <PageHeader
        title="Upload Document"
        description="Upload a document to object storage and start OCR processing."
      />
      <DocumentUploadForm initialShipmentId={shipmentId} />
    </>
  );
}
