import { staffNavigation } from "@/configs/navigation.config";
import { WorkspaceSidebar } from "./workspace-sidebar";

const operationsNavigation = staffNavigation.filter(
  (item) => item.label !== "Users & Roles" && item.label !== "AI Operations",
);

export function AppSidebar() {
  return (
    <WorkspaceSidebar
      navigation={operationsNavigation}
      ariaLabel="Staff navigation"
      brandName="Aurora"
      brandSubtitle="ACME Logistics"
      accountName="Operations"
      accountSubtitle="Staff workspace"
      accountInitials="AN"
      showNotifications
      showRealtimeStatus
    />
  );
}
