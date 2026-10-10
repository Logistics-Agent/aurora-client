/**
 * Authoritative Permission Constants for Aurora Client
 * Synchronized 1:1 with aurora-server Shared.Constants.PermissionConstants
 */
export const PERMISSIONS = {
  // Mail
  MAIL: {
    READ: "mail:read",
    DRAFT_CREATE: "mail:draft:create",
    SEND: "mail:send",
    THREAD_CLAIM: "mail:thread:claim",
    THREAD_READ_ALL: "mail:thread:read_all",
    THREAD_REASSIGN: "mail:thread:reassign",
    THREAD_UNASSIGN: "mail:thread:unassign",
    QUARANTINE_READ: "mail:quarantine:read",
    QUARANTINE_RELEASE: "mail:quarantine:release",
    QUARANTINE_DELETE: "mail:quarantine:delete",
    AUDIT_READ: "mail:audit:read",
    DOMAIN_MANAGE: "mail:domain:manage",
    MAILBOX_MANAGE: "mail:mailbox:manage",
    SYSTEM_MANAGE: "mail:system:manage",
  },

  // Shipment
  SHIPMENT: {
    CREATE: "shipments:create",
    READ: "shipments:read",
    UPDATE: "shipments:update",
    SUBMIT: "shipments:submit",
    CANCEL: "shipments:cancel",
    DELETE: "shipments:delete",
    IMPORT: "shipments:import",
  },

  // Route Planning
  ROUTE_PLANNING: {
    READ: "route_planning:read",
    CREATE: "route_planning:create",
    UPDATE: "route_planning:update",
    OPTIMIZE: "route_planning:optimize",
    EXECUTE: "route_planning:execute",
    DELETE: "route_planning:delete",
    APPROVAL_READ: "route_planning:approval:read",
    APPROVE: "route_planning:approve",
    REJECT: "route_planning:reject",
    POLICY_MANAGE: "route_planning:policy:manage",
    POLICY_PUBLISH: "route_planning:policy:publish",
  },

  // OCR
  OCR: {
    REVIEW: "ocr:review",
  },

  // Documents
  DOCUMENTS: {
    READ: "documents:read",
    INGEST: "documents:ingest",
    MANAGE: "documents:manage",
  },

  // Compliance
  COMPLIANCE: {
    READ: "compliance:read",
    OVERRIDE: "compliance:override",
    PLATFORM_INGEST: "compliance:platform:ingest",
  },

  // AI assistant
  ASSISTANT: {
    QUERY: "assistant:query",
  },

  // Financial & Tax
  FINANCIAL: {
    READ: "financial_tax:read",
    CALCULATE: "financial_tax:calculate",
  },

  // Billing & Settlement
  BILLING: {
    READ: "billing_settlement:read",
    INVOICE_CREATE: "billing_settlement:invoice:create",
    INVOICE_UPDATE: "billing_settlement:invoice:update",
    CREDIT_CHECK: "billing_settlement:credit:check",
    ESCROW_READ: "billing_settlement:escrow:read",
    SETTLEMENT_MANAGE: "billing_settlement:settlement:manage",
  },

  // GPS Tracking
  GPS: {
    GEOFENCE_MANAGE: "gps_tracking:geofence:manage",
  },

  // Notification
  NOTIFICATION: {
    ACCESS: "notifications:access",
  },

  // IAM (Administration)
  IAM: {
    USER_READ: "iam:user:read",
    USER_INVITE: "iam:user:invite",
    USER_UPDATE: "iam:user:update",
    ROLE_READ: "iam:role:read",
    ROLE_MANAGE: "iam:role:manage",
    PERMISSION_MANAGE: "iam:permission:manage",
  },
} as const;

export type PermissionCode =
  | (typeof PERMISSIONS.MAIL)[keyof typeof PERMISSIONS.MAIL]
  | (typeof PERMISSIONS.SHIPMENT)[keyof typeof PERMISSIONS.SHIPMENT]
  | (typeof PERMISSIONS.ROUTE_PLANNING)[keyof typeof PERMISSIONS.ROUTE_PLANNING]
  | (typeof PERMISSIONS.OCR)[keyof typeof PERMISSIONS.OCR]
  | (typeof PERMISSIONS.DOCUMENTS)[keyof typeof PERMISSIONS.DOCUMENTS]
  | (typeof PERMISSIONS.COMPLIANCE)[keyof typeof PERMISSIONS.COMPLIANCE]
  | (typeof PERMISSIONS.ASSISTANT)[keyof typeof PERMISSIONS.ASSISTANT]
  | (typeof PERMISSIONS.FINANCIAL)[keyof typeof PERMISSIONS.FINANCIAL]
  | (typeof PERMISSIONS.BILLING)[keyof typeof PERMISSIONS.BILLING]
  | (typeof PERMISSIONS.GPS)[keyof typeof PERMISSIONS.GPS]
  | (typeof PERMISSIONS.NOTIFICATION)[keyof typeof PERMISSIONS.NOTIFICATION]
  | (typeof PERMISSIONS.IAM)[keyof typeof PERMISSIONS.IAM];
