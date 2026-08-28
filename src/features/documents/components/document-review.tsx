"use client";

import { useState } from "react";
import { FileCheck2, Upload } from "lucide-react";
import {
  ConfirmActionDialog,
  StatusBadge,
  WorkspaceCard,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { approveDocument, documentMocks, ocrFieldMocks } from "../mock";

export function DocumentReview({
  showUpload = false,
  showOcrFields = false,
  initialDocumentId = "INV-2026-0048",
}: {
  showUpload?: boolean;
  showOcrFields?: boolean;
  initialDocumentId?: string;
}) {
  const [documents, setDocuments] = useState(documentMocks);
  const [selected, setSelected] = useState(
    documentMocks.find(({ id }) => id === initialDocumentId) ??
      documentMocks[1],
  );
  const [confirm, setConfirm] = useState(false);

  return (
    <>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        {showUpload && (
          <WorkspaceCard title="Upload">
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <Upload className="mx-auto size-8 text-primary" />
              <p className="mt-3 font-semibold">Select local mock document</p>
              <Button
                className="mt-4"
                onClick={() => setSelected(documents[1])}
              >
                Select file
              </Button>
            </div>
          </WorkspaceCard>
        )}
        <WorkspaceCard title="Document queue">
          <div className="space-y-3">
            {documents.map((document) => (
              <button
                type="button"
                key={document.id}
                onClick={() => setSelected(document)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left ${selected.id === document.id ? "border-primary bg-blue-50" : "border-border"}`}
              >
                <div className="flex items-center gap-3">
                  <FileCheck2 className="size-4 text-primary" />
                  <div>
                    <p className="font-semibold">{document.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {document.id} · {document.shipmentId}
                    </p>
                  </div>
                </div>
                <StatusBadge
                  label={document.state}
                  intent={
                    document.state === "Verified"
                      ? "success"
                      : document.state === "Processing"
                        ? "ai"
                        : "warning"
                  }
                />
              </button>
            ))}
          </div>
        </WorkspaceCard>
        <WorkspaceCard title="Review detail">
          <div className="space-y-3">
            {(showOcrFields
              ? ocrFieldMocks
              : [
                  {
                    label: "Selected document",
                    value: selected.name,
                    confidence: `${selected.confidence ?? 0}%`,
                  },
                ]
            ).map((field) => (
              <div
                className="flex justify-between gap-3 border-b border-border pb-2 text-sm"
                key={field.label}
              >
                <span className="text-muted-foreground">{field.label}</span>
                <span className="font-medium">
                  {field.value}{" "}
                  <span className="ml-2 text-xs text-ai">
                    {field.confidence}
                  </span>
                </span>
              </div>
            ))}
          </div>
          <Button className="mt-5 w-full" onClick={() => setConfirm(true)}>
            Approve extraction
          </Button>
        </WorkspaceCard>
      </div>
      <ConfirmActionDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`Approve ${selected.name}?`}
        consequence="Only the local mock document state changes."
        confirmLabel="Approve"
        onConfirm={() => {
          const approved = approveDocument(selected);
          setDocuments((current) =>
            current.map((document) =>
              document.id === selected.id ? approved : document,
            ),
          );
          setSelected(approved);
          setConfirm(false);
        }}
      />
    </>
  );
}
