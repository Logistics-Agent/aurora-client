import { ForgotPasswordPage as ForgotPasswordComposition } from "./forgot-password";
import { LoginPage as LoginComposition } from "./login";
import { PermissionState as PermissionStateComposition } from "./components/permission-state";
import { SelectTenantPage as SelectTenantComposition } from "./select-tenant";

export function LoginPage() {
  return <LoginComposition />;
}

export function ForgotPasswordPage() {
  return <ForgotPasswordComposition />;
}

export function SelectTenantPage() {
  return <SelectTenantComposition />;
}

export function PermissionState(
  props: React.ComponentProps<typeof PermissionStateComposition>,
) {
  return <PermissionStateComposition {...props} />;
}
