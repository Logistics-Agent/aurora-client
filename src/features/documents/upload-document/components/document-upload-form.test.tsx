import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  uploadMutateAsync: vi.fn(),
  intakeMutateAsync: vi.fn(),
  routerPush: vi.fn(),
  legacySubmitMutateAsync: vi.fn(),
}));

vi.mock("@/hooks/mutations/documents/use-document-upload-mutation", () => ({
  useDocumentUploadMutation: () => ({
    mutateAsync: mocks.uploadMutateAsync,
    isPending: false,
    reset: vi.fn(),
  }),
}));

vi.mock("@/hooks/mutations/documents/use-document-intake-mutation", () => ({
  useDocumentIntakeMutation: () => ({
    mutateAsync: mocks.intakeMutateAsync,
    isPending: false,
    reset: vi.fn(),
  }),
}));

vi.mock("@/hooks/mutations/documents/use-submit-document-mutation", () => ({
  useSubmitDocumentMutation: () => ({
    mutateAsync: mocks.legacySubmitMutateAsync,
    isPending: false,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.routerPush }),
}));

import { DocumentUploadForm } from "./document-upload-form";

const uploadSession = {
  uploadId: "01a09545-6eb5-7f02-bde4-1d9398a95b7a",
  storageReference: "tenant/uploads/invoice.pdf",
  writeUrl: "https://objects.example.test/upload",
  requiredHeaders: {},
  expiresAt: "2026-09-12T12:15:00Z",
  maximumSizeBytes: 10_485_760,
  fileName: "invoice.pdf",
  mimeType: "application/pdf",
  sizeBytes: 7,
  contentSha256: null,
  status: "PENDING" as const,
};

const intakeStatus = {
  id: "ocr-job-123",
  documentType: "SHIPMENT",
  status: "PROCESSING" as const,
  stage: "QUEUED" as const,
  fileName: "invoice.pdf",
  needsReview: false,
  confidence: null,
  normalizedJson: null,
  errorCode: null,
  errorMessage: null,
  createdAt: null,
  updatedAt: null,
};

function renderForm(initialShipmentId?: string) {
  return render(<DocumentUploadForm initialShipmentId={initialShipmentId} />);
}

function createFile(name = "invoice.pdf", type = "application/pdf", size = 7) {
  return new File([new Uint8Array(size)], name, { type });
}

describe("DocumentUploadForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValueOnce("intake-key-1")
      .mockReturnValueOnce("upload-key-1")
      .mockReturnValueOnce("upload-key-2")
      .mockReturnValueOnce("intake-key-2")
      .mockReturnValueOnce("upload-key-3");
    mocks.uploadMutateAsync.mockResolvedValue(uploadSession);
    mocks.intakeMutateAsync.mockResolvedValue(intakeStatus);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("accepts a supported file and sends the signed upload result to intake", async () => {
    const user = userEvent.setup();
    renderForm("shipment-42");

    await user.upload(screen.getByLabelText("Document file"), createFile());
    await user.selectOptions(screen.getByLabelText("Document type"), "BILL_OF_LADING");
    await user.click(screen.getByRole("button", { name: "Start upload" }));

    await waitFor(() => expect(mocks.intakeMutateAsync).toHaveBeenCalled());
    expect(mocks.uploadMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        file: expect.any(File),
        idempotencyKey: "upload-key-1",
      }),
    );
    expect(mocks.intakeMutateAsync).toHaveBeenCalledWith({
      uploadId: uploadSession.uploadId,
      documentTypeHint: "BILL_OF_LADING",
      idempotencyKey: "intake-key-1",
      purpose: "SHIPMENT_DOCUMENT",
      externalReference: "shipment-42",
    });
  });

  it("rejects unsupported types and files larger than 10 MB", async () => {
    const { unmount } = renderForm();

    fireEvent.change(screen.getByLabelText("Document file"), {
      target: { files: [createFile("notes.txt", "text/plain")] },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(/file type is not supported/i);
    unmount();

    renderForm();
    fireEvent.change(screen.getByLabelText("Document file"), {
      target: { files: [createFile("large.pdf", "application/pdf", 10_485_761)] },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(/10 mb or smaller/i);
    expect(mocks.uploadMutateAsync).not.toHaveBeenCalled();
  });

  it("shows upload progress while the signed upload is in flight", async () => {
    const user = userEvent.setup();
    let resolveUpload: (value: typeof uploadSession) => void = () => undefined;
    mocks.uploadMutateAsync.mockImplementation(({ onProgress }) => {
      onProgress?.(48);
      return new Promise((resolve) => {
        resolveUpload = resolve;
      });
    });
    renderForm();

    await user.upload(screen.getByLabelText("Document file"), createFile());
    await user.click(screen.getByRole("button", { name: "Start upload" }));

    expect(await screen.findByText("48% uploaded")).toBeInTheDocument();
    resolveUpload(uploadSession);
    await waitFor(() =>
      expect(mocks.routerPush).toHaveBeenCalledWith("/documents/ocr-job-123/ocr"),
    );
  });

  it("keeps the intake key but creates a new upload-session key after an expired upload", async () => {
    const user = userEvent.setup();
    mocks.uploadMutateAsync
      .mockRejectedValueOnce(new Error("signed URL expired"))
      .mockResolvedValueOnce(uploadSession);
    renderForm();

    await user.upload(screen.getByLabelText("Document file"), createFile());
    await user.click(screen.getByRole("button", { name: "Start upload" }));
    expect(await screen.findByRole("button", { name: "Retry upload" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry upload" }));
    await waitFor(() => expect(mocks.routerPush).toHaveBeenCalled());

    const firstUploadKey = mocks.uploadMutateAsync.mock.calls[0][0].idempotencyKey;
    const secondUploadKey = mocks.uploadMutateAsync.mock.calls[1][0].idempotencyKey;
    expect(secondUploadKey).not.toBe(firstUploadKey);
    expect(mocks.intakeMutateAsync).toHaveBeenCalledTimes(1);
    expect(mocks.intakeMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ idempotencyKey: "intake-key-1" }),
    );
  });

  it("disables duplicate submits while the upload is pending and navigates by returned job id", async () => {
    const user = userEvent.setup();
    let resolveUpload: (value: typeof uploadSession) => void = () => undefined;
    mocks.uploadMutateAsync.mockImplementation(
      () => new Promise((resolve) => (resolveUpload = resolve)),
    );
    renderForm();

    await user.upload(screen.getByLabelText("Document file"), createFile());
    const submit = screen.getByRole("button", { name: "Start upload" });
    await user.click(submit);
    expect(submit).toBeDisabled();
    await user.click(submit);
    expect(mocks.uploadMutateAsync).toHaveBeenCalledTimes(1);

    resolveUpload(uploadSession);
    await waitFor(() =>
      expect(mocks.routerPush).toHaveBeenCalledWith("/documents/ocr-job-123/ocr"),
    );
  });
});
