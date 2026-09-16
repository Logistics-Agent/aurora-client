export const CONTROLLERS = {
  documents: {
    uploads: "api/v1/documents/uploads",
    intakes: "api/v1/documents/intakes",
    corpusIntakes: "api/v1/documents/corpus-intakes",
    shipmentDocuments: "api/v1/documents/shipment-documents",
    shipmentDocument: (id: string) =>
      `api/v1/documents/shipment-documents/${encodeURIComponent(id)}`,
    shipmentDocumentReview: (id: string) =>
      `api/v1/documents/shipment-documents/${encodeURIComponent(id)}/review`,
    shipmentDocumentDownload: (id: string) =>
      `api/v1/documents/shipment-documents/${encodeURIComponent(id)}/download`,
    shipmentDocumentCancel: (id: string) =>
      `api/v1/documents/shipment-documents/${encodeURIComponent(id)}/cancel`,
    shipmentDocumentRetry: (id: string) =>
      `api/v1/documents/shipment-documents/${encodeURIComponent(id)}/retry`,
    shipmentDocumentSubmit: "api/v1/documents/shipment",
  },
  compliance: {
    evaluations: "api/v1/compliance/evaluations",
    evaluation: (id: string) => `api/v1/compliance/evaluations/${encodeURIComponent(id)}`,
    copilotAsk: "api/v1/compliance/copilot/ask",
  },
  corpus: {
    regulatory: "api/v1/documents/regulatory",
    regulatorySources: "api/v1/documents/regulatory-sources",
    regulatorySource: (id: string) =>
      `api/v1/documents/regulatory-sources/${encodeURIComponent(id)}`,
    regulatorySourceStatus: (id: string) =>
      `api/v1/documents/regulatory-sources/${encodeURIComponent(id)}/status`,
    regulatoryQuery: "api/v1/documents/regulatory/query",
    knowledge: "api/v1/documents/knowledge",
    knowledgeDocuments: "api/v1/documents/knowledge-documents",
    knowledgeDocument: (id: string) =>
      `api/v1/documents/knowledge-documents/${encodeURIComponent(id)}`,
    knowledgeDocumentStatus: (id: string) =>
      `api/v1/documents/knowledge-documents/${encodeURIComponent(id)}/status`,
    knowledgeQuery: "api/v1/documents/knowledge/query",
    general: "api/v1/documents/general",
    promoteGeneral: (id: string) =>
      `api/v1/documents/general-documents/${encodeURIComponent(id)}/promote-to-knowledge`,
  },
  assistant: {
    query: "api/v1/assistant/query",
  },
  mail: {
    mailboxes: "api/v1/mail/mailboxes",
    threads: "api/v1/mail/threads",
    thread: (id: string) => `api/v1/mail/threads/${encodeURIComponent(id)}`,
    threadClaim: (id: string) => `api/v1/mail/threads/${encodeURIComponent(id)}/claim`,
    threadReassign: (id: string) => `api/v1/mail/threads/${encodeURIComponent(id)}/reassign`,
    threadUnassign: (id: string) => `api/v1/mail/threads/${encodeURIComponent(id)}/unassign`,
    threadAssignmentHistory: (id: string) =>
      `api/v1/mail/threads/${encodeURIComponent(id)}/assignment-history`,
    drafts: "api/v1/mail/drafts",
    draft: (id: string) => `api/v1/mail/drafts/${encodeURIComponent(id)}`,
    outboundMessages: "api/v1/mail/messages/outbound",
    messages: "api/v1/mail/messages",
    message: (id: string) => `api/v1/mail/messages/${encodeURIComponent(id)}`,
    quarantine: "api/v1/mail/quarantine",
    quarantineRecord: (id: string) => `api/v1/mail/quarantine/${encodeURIComponent(id)}`,
    quarantineRelease: (id: string) => `api/v1/mail/quarantine/${encodeURIComponent(id)}/release`,
  },
  notifications: "api/v1/notifications",
  notificationUnreadCount: "api/v1/notifications/unread-count",
  notificationDevices: "api/v1/notifications/devices",
  notificationReadAll: "api/v1/notifications/read-all",
} as const;
