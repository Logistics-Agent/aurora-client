export interface MailDraftFormValues {
  senderMailboxId: string;
  body: string;
  bodyHtml?: string;
  attachmentIds: readonly string[];
  attachments?: RealAttachmentItem[];
}

export interface RealAttachmentItem {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  contentBase64: string;
}

export type MailDraftValidationResult = { valid: true } | { valid: false; error: string };
