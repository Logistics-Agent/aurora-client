export interface RealAttachmentItem {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  contentBase64: string;
}

export interface MailDraftFormValues {
  senderMailboxId: string;
  body: string;
  attachmentIds: readonly string[];
  attachments?: readonly RealAttachmentItem[];
}

export type MailDraftValidationResult =
  | { valid: true }
  | { valid: false; error: string };

