"use client";

import { type FormEvent, useState } from "react";

import { useSubmitDocumentMutation } from "@/hooks/mutations/documents/use-submit-document-mutation";

export function useDocumentUploadForm() {
  const [storageReference, setStorageReference] = useState("");
  const [fileName, setFileName] = useState("");
  const [sizeBytes, setSizeBytes] = useState(0);
  const [documentTypeHint, setDocumentTypeHint] = useState(1);
  const [shipmentId, setShipmentId] = useState("");
  const submitMutation = useSubmitDocumentMutation();
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!storageReference.trim() || !fileName.trim() || sizeBytes <= 0) return;
    await submitMutation.mutateAsync({
      storageReference: storageReference.trim(),
      fileName: fileName.trim(),
      sizeBytes,
      documentTypeHint,
      externalDocumentId: crypto.randomUUID(),
      shipmentId: shipmentId.trim() || undefined,
    });
    setStorageReference("");
    setFileName("");
    setSizeBytes(0);
    setShipmentId("");
  };
  return {
    storageReference,
    setStorageReference,
    fileName,
    setFileName,
    sizeBytes,
    setSizeBytes,
    documentTypeHint,
    setDocumentTypeHint,
    shipmentId,
    setShipmentId,
    submit,
    submitMutation,
  };
}
