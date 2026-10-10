import type {
  AuthUserDto,
  UserProfile,
  UserRole,
} from "@/dto/auth/auth.dto";
import { PERMISSIONS } from "@/constants/permissions";

export type { AuthUserDto, UserProfile, UserRole } from "@/dto/auth/auth.dto";

// Baseline permissions granted implicitly by role
const STAFF_DEFAULT_PERMISSIONS: ReadonlySet<string> = new Set([
  PERMISSIONS.MAIL.READ,
  PERMISSIONS.MAIL.DRAFT_CREATE,
  PERMISSIONS.MAIL.SEND,
  PERMISSIONS.MAIL.THREAD_CLAIM,
  PERMISSIONS.SHIPMENT.READ,
  PERMISSIONS.SHIPMENT.CREATE,
  PERMISSIONS.SHIPMENT.UPDATE,
  PERMISSIONS.SHIPMENT.SUBMIT,
  PERMISSIONS.ROUTE_PLANNING.READ,
  PERMISSIONS.ROUTE_PLANNING.CREATE,
  PERMISSIONS.ROUTE_PLANNING.UPDATE,
  PERMISSIONS.ROUTE_PLANNING.OPTIMIZE,
  PERMISSIONS.ROUTE_PLANNING.EXECUTE,
  PERMISSIONS.DOCUMENTS.READ,
  PERMISSIONS.COMPLIANCE.READ,
  PERMISSIONS.ASSISTANT.QUERY,
  PERMISSIONS.NOTIFICATION.ACCESS,
  PERMISSIONS.IAM.USER_READ,
]);

const MANAGER_DEFAULT_PERMISSIONS: ReadonlySet<string> = new Set([
  ...STAFF_DEFAULT_PERMISSIONS,
  PERMISSIONS.MAIL.THREAD_READ_ALL,
  PERMISSIONS.MAIL.THREAD_REASSIGN,
  PERMISSIONS.MAIL.THREAD_UNASSIGN,
  PERMISSIONS.MAIL.QUARANTINE_READ,
  PERMISSIONS.MAIL.QUARANTINE_RELEASE,
  PERMISSIONS.MAIL.AUDIT_READ,
  PERMISSIONS.SHIPMENT.CANCEL,
  PERMISSIONS.SHIPMENT.DELETE,
  PERMISSIONS.SHIPMENT.IMPORT,
  PERMISSIONS.ROUTE_PLANNING.DELETE,
  PERMISSIONS.ROUTE_PLANNING.APPROVAL_READ,
  PERMISSIONS.ROUTE_PLANNING.APPROVE,
  PERMISSIONS.ROUTE_PLANNING.REJECT,
  PERMISSIONS.ROUTE_PLANNING.POLICY_MANAGE,
  PERMISSIONS.ROUTE_PLANNING.POLICY_PUBLISH,
  PERMISSIONS.OCR.REVIEW,
  PERMISSIONS.DOCUMENTS.INGEST,
  PERMISSIONS.DOCUMENTS.MANAGE,
  PERMISSIONS.COMPLIANCE.OVERRIDE,
  PERMISSIONS.BILLING.INVOICE_CREATE,
  PERMISSIONS.BILLING.INVOICE_UPDATE,
  PERMISSIONS.BILLING.SETTLEMENT_MANAGE,
  PERMISSIONS.GPS.GEOFENCE_MANAGE,
  PERMISSIONS.IAM.ROLE_READ,
]);

export function hasPermission(
  user: UserProfile | null,
  permission: string,
): boolean {
  if (!user) return false;

  const role = (user.role || "").toUpperCase().replace(/[-_]/g, "");

  // Super/Tenant Admins have all operational permissions
  if (
    role === "SYSTEMADMIN" ||
    role === "SYSTEM" ||
    role === "TENANTADMIN" ||
    role === "ADMIN"
  ) {
    return true;
  }

  const target = permission.toLowerCase().trim();

  // Check direct user permissions (case-insensitive & wildcards)
  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    const directMatch = user.permissions.some((p) => {
      const perm = p.toLowerCase().trim();
      if (perm === "*" || perm === "all" || perm === target) return true;
      const targetModule = target.split(":")[0];
      return (
        perm === `${targetModule}:*` ||
        perm === `${targetModule}:all` ||
        perm === `${targetModule}:manage` ||
        perm === `${targetModule}:read`
      );
    });
    if (directMatch) return true;
  }

  // Check role-based baseline permissions
  if (role === "MANAGER") {
    return MANAGER_DEFAULT_PERMISSIONS.has(target);
  }

  if (role === "STAFF") {
    return STAFF_DEFAULT_PERMISSIONS.has(target);
  }

  return false;
}


