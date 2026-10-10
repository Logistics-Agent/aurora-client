"use client";

import { type FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useDocumentIntakeMutation } from "@/hooks/mutations/documents/use-document-intake-mutation";
import { useDocumentUploadMutation } from "@/hooks/mutations/documents/use-document-upload-mutation";
import { getApiErrorMessage } from "@/lib/api-error";
import type { DocumentTypeHint } from "@/dto/documents/document-upload.dto";

import { validateDocumentFile } from "../utils/validate-document-file";

export type DocumentUploadPhase = "idle" | "uploading" | "intaking" | "error";

export function useDocumentUploadForm(initialShipmentId = "") {
  const router = useRouter();
  const uploadMutation = useDocumentUploadMutation();
  const intakeMutation = useDocumentIntakeMutation();
  const [file, setFile] = useState<File | null>(null);
  const [documentTypeHint, setDocumentTypeHint] = useState<DocumentTypeHint>("COMMERCIAL_INVOICE");
  const [shipmentId, setShipmentId] = useState(initialShipmentId);
  const [phase, setPhase] = useState<DocumentUploadPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [uploadedSession, setUploadedSession] = useState<{ uploadId: string } | null>(null);
  const intakeIdempotencyKey = useRef<string | undefined>(undefined);
  const uploadAbortController = useRef<AbortController | undefined>(undefined);

  const handleFileChange = (nextFile: File | null) => {
    if (phase === "uploading" || phase === "intaking") return;
    setFile(nextFile);
    setUploadedSession(null);
    setProgress(0);
    setErrorMessage(null);
    setPhase("idle");
    intakeIdempotencyKey.current = undefined;
    setValidationMessage(validateDocumentFile(nextFile));
  };

  const submit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (phase === "uploading" || phase === "intaking") return;
    const validationError = validateDocumentFile(file);
    if (validationError) {
      setValidationMessage(validationError);
      return;
    }
    if (!file) return;

    setValidationMessage(null);
    setErrorMessage(null);
    intakeIdempotencyKey.current ??= crypto.randomUUID();
    let session = uploadedSession;

    try {
      if (!session) {
        setPhase("uploading");
        setProgress(0);
        const controller = new AbortController();
        uploadAbortController.current = controller;
        session = await uploadMutation.mutateAsync({
          file,
          idempotencyKey: crypto.randomUUID(),
          signal: controller.signal,
          onProgress: setProgress,
        });
        setUploadedSession(session);
      }

      setPhase("intaking");
      const result = await intakeMutation.mutateAsync({
        uploadId: session.uploadId,
        documentTypeHint,
        idempotencyKey: intakeIdempotencyKey.current,
        purpose: shipmentId.trim() ? "SHIPMENT_DOCUMENT" : "GENERAL_DOCUMENT",
        ...(shipmentId.trim() ? { externalReference: shipmentId.trim() } : {}),
      });
      router.push(`/documents/${result.id}/ocr`);
    } catch (error) {
      if (uploadAbortController.current?.signal.aborted) return;
      setPhase("error");
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      uploadAbortController.current = undefined;
    }
  };

  const cancel = () => {
    uploadAbortController.current?.abort();
    uploadAbortController.current = undefined;
    setPhase("idle");
    setProgress(0);
  };

  return {
    file,
    documentTypeHint,
    shipmentId,
    phase,
    progress,
    errorMessage,
    validationMessage,
    hasUploadedSession: Boolean(uploadedSession),
    isBusy: phase === "uploading" || phase === "intaking",
    handleFileChange,
    setDocumentTypeHint,
    setShipmentId,
    submit,
    cancel,
  };
}
