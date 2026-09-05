import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bot,
  Boxes,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Mail,
  Map,
  Settings2,
  Truck,
  Users,
} from "lucide-react";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  capability?: string;
};

export const staffNavigation: NavigationItem[] = [
  { label: "Overview", href: "/overview", icon: LayoutDashboard },
  { label: "Shipments", href: "/shipments", icon: Truck },
  { label: "Live Map", href: "/live-map", icon: Map },
  { label: "Route Planning", href: "/route-planning", icon: Activity },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Compliance", href: "/compliance", icon: ClipboardCheck },
  { label: "Mail", href: "/mail", icon: Mail, capability: "mail:read" },
  { label: "AI Assistant", href: "/assistant", icon: Bot },
  {
    label: "Administration",
    href: "/admin/users",
    icon: Settings2,
    capability: "admin",
  },
  {
    label: "Users & Roles",
    href: "/admin/users",
    icon: Users,
    capability: "admin",
  },
  {
    label: "AI Operations",
    href: "/admin/ai-operations",
    icon: Boxes,
    capability: "admin",
  },
];

export const customerNavigation: NavigationItem[] = [
  { label: "Overview", href: "/portal", icon: LayoutDashboard },
  { label: "My Shipments", href: "/portal/shipments", icon: Truck },
  { label: "Documents", href: "/portal/documents", icon: FileText },
  { label: "Quotes", href: "/portal/quotes", icon: ClipboardCheck },
  { label: "Invoices", href: "/portal/invoices", icon: FileText },
  { label: "AI Assistant", href: "/portal/assistant", icon: Bot },
  { label: "Notifications", href: "/portal/notifications", icon: Activity },
];
