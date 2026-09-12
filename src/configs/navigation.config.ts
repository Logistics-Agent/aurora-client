import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookOpen,
  Bot,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Mail,
  Map,
  Settings,
  Truck,
  Upload,
} from "lucide-react";

import { PERMISSIONS } from "@/constants/permissions";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  capability?: string;
};

export const staffNavigation: NavigationItem[] = [
  { label: "Overview", href: "/overview", icon: LayoutDashboard },
  {
    label: "Shipments",
    href: "/shipments",
    icon: Truck,
    capability: PERMISSIONS.SHIPMENT.READ,
  },
  {
    label: "Live Map",
    href: "/live-map",
    icon: Map,
    capability: PERMISSIONS.SHIPMENT.READ,
  },
  {
    label: "Route Planning",
    href: "/route-planning",
    icon: Activity,
    capability: PERMISSIONS.ROUTE_PLANNING.READ,
  },
  {
    label: "Documents",
    href: "/documents",
    icon: FileText,
    capability: PERMISSIONS.DOCUMENTS.READ,
  },
  {
    label: "Upload Document",
    href: "/documents/upload",
    icon: Upload,
    capability: PERMISSIONS.DOCUMENTS.INGEST,
  },
  {
    label: "Compliance",
    href: "/compliance",
    icon: ClipboardCheck,
    capability: PERMISSIONS.COMPLIANCE.READ,
  },
  {
    label: "Regulatory Corpus",
    href: "/corpus",
    icon: BookOpen,
    capability: PERMISSIONS.DOCUMENTS.INGEST,
  },
  {
    label: "Mail",
    href: "/mail",
    icon: Mail,
    capability: PERMISSIONS.MAIL.READ,
  },
  {
    label: "AI Assistant",
    href: "/assistant",
    icon: Bot,
    capability: PERMISSIONS.ASSISTANT.QUERY,
  },
  { label: "Settings", href: "/settings", icon: Settings },
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
