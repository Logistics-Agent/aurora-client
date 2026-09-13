import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";

import { documentUploadService } from "./document-upload.service";

const uploadSession = {
  uploadId: "01a09545-6eb5-7f02-bde4-1d9398a95b7a",
  storageReference: "tenant/uploads/invoice.pdf",
  writeUrl: "https://objects.example.test/uploads/invoice.pdf?signature=redacted",
  requiredHeaders: { "content-type": "application/pdf", "x-upload-token": "token" },
  expiresAt: "2026-09-12T12:15:00Z",
  maximumSizeBytes: 10_485_760,
  fileName: "invoice.pdf",
  mimeType: "application/pdf",
  sizeBytes: 4,
  contentSha256: null,
  status: "PENDING" as const,
};

class FakeXmlHttpRequest {
  static instances: FakeXmlHttpRequest[] = [];

  readonly headers = new Map<string, string>();
  readonly upload: { onprogress: ((event: ProgressEvent) => void) | null } = {
    onprogress: null,
  };
  body: Document | XMLHttpRequestBodyInit | null = null;
  method = "";
  onabort: ((event: ProgressEvent) => void) | null = null;
  onerror: ((event: ProgressEvent) => void) | null = null;
  onload: ((event: ProgressEvent) => void) | null = null;
  status = 200;
  url = "";
  withCredentials = true;

  constructor() {
    FakeXmlHttpRequest.instances.push(this);
  }

  abort() {
    this.onabort?.(new ProgressEvent("abort"));
  }

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  send(body: Document | XMLHttpRequestBodyInit | null) {
    this.body = body;
  }

  setRequestHeader(name: string, value: string) {
    this.headers.set(name, value);
  }
}

afterEach(() => {
  vi.restoreAllMocks();
  FakeXmlHttpRequest.instances = [];
});

describe("document upload service", () => {
  it("creates an upload session through the Staff BFF", async () => {
    const post = vi.spyOn(api, "post").mockResolvedValue(uploadSession as never);

    const result = await documentUploadService.createUploadSession({
      idempotencyKey: "upload-attempt-1",
      fileName: "invoice.pdf",
      mimeType: "application/pdf",
      sizeBytes: 4,
    });

    expect(post).toHaveBeenCalledWith("api/v1/documents/uploads", {
      idempotencyKey: "upload-attempt-1",
      fileName: "invoice.pdf",
      mimeType: "application/pdf",
      sizeBytes: 4,
    });
    expect(result.uploadId).toBe(uploadSession.uploadId);
  });

  it("uploads directly to the signed URL without credentials and reports progress", async () => {
    vi.stubGlobal("XMLHttpRequest", FakeXmlHttpRequest);
    const onProgress = vi.fn();
    const file = new File(["test"], "invoice.pdf", { type: "application/pdf" });

    const pendingUpload = documentUploadService.uploadObject(uploadSession, file, { onProgress });
    const request = FakeXmlHttpRequest.instances[0];

    expect(request?.method).toBe("PUT");
    expect(request?.url).toBe(uploadSession.writeUrl);
    expect(request?.withCredentials).toBe(false);
    expect(request?.headers).toEqual(
      new Map([
        ["content-type", "application/pdf"],
        ["x-upload-token", "token"],
      ]),
    );
    request?.upload.onprogress?.(
      new ProgressEvent("progress", { lengthComputable: true, loaded: 2, total: 4 }),
    );
    expect(onProgress).toHaveBeenCalledWith(50);

    request?.onload?.(new ProgressEvent("load"));
    await expect(pendingUpload).resolves.toBeUndefined();
  });

  it("aborts the signed upload when its signal is cancelled", async () => {
    vi.stubGlobal("XMLHttpRequest", FakeXmlHttpRequest);
    const controller = new AbortController();
    const file = new File(["test"], "invoice.pdf", { type: "application/pdf" });
    const pendingUpload = documentUploadService.uploadObject(uploadSession, file, {
      signal: controller.signal,
    });

    controller.abort();

    await expect(pendingUpload).rejects.toMatchObject({ name: "AbortError" });
  });
});
