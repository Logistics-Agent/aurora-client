import { staffNavigation } from "@/configs/navigation.config";
import { WorkspaceSidebar } from "./workspace-sidebar";

export function AppSidebar() {
  return (
    <WorkspaceSidebar
      navigation={staffNavigation}
      ariaLabel="Staff navigation"
      brandName="Aurora"
      brandSubtitle="ACME Logistics"
      accountName="Operations Staff"
      accountSubtitle="Staff workspace"
      accountInitials="OP"
      showNotifications
    />
  );
}
