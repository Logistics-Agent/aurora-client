"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Bell,
  CheckCircle2,
  Globe,
  KeyRound,
  Laptop,
  Mail,
  Moon,
  Package,
  Route,
  ShieldCheck,
  Sparkles,
  Sun,
  UserCheck,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceCard } from "@/components/common";
import { PageHeader } from "@/components/layout";
import { useCurrentUserQuery } from "@/hooks/queries/auth/use-current-user-query";
import { PERMISSIONS } from "@/constants/permissions";
import { cn } from "@/lib/utils";

const PERMISSION_GROUPS = [
  {
    title: "Shipments & Logistics",
    icon: Package,
    permissions: [
      { code: PERMISSIONS.SHIPMENT.READ, label: "View Shipments", desc: "Access shipment lists and detail" },
      { code: PERMISSIONS.SHIPMENT.CREATE, label: "Create Shipment", desc: "Register new shipments" },
      { code: PERMISSIONS.SHIPMENT.UPDATE, label: "Update Shipment", desc: "Modify shipment properties" },
      { code: PERMISSIONS.SHIPMENT.SUBMIT, label: "Submit Shipment", desc: "Submit shipment to workflow" },
      { code: PERMISSIONS.SHIPMENT.CANCEL, label: "Cancel Shipment", desc: "Cancel active shipment" },
      { code: PERMISSIONS.SHIPMENT.DELETE, label: "Delete Shipment", desc: "Permanently remove shipment" },
      { code: PERMISSIONS.SHIPMENT.IMPORT, label: "Import Shipments", desc: "Bulk import CSV/Excel" },
    ],
  },
  {
    title: "Route Planning & Governance",
    icon: Route,
    permissions: [
      { code: PERMISSIONS.ROUTE_PLANNING.READ, label: "View Routes", desc: "Inspect route plans" },
      { code: PERMISSIONS.ROUTE_PLANNING.CREATE, label: "Create Route", desc: "Draft new routes" },
      { code: PERMISSIONS.ROUTE_PLANNING.OPTIMIZE, label: "AI Route Optimization", desc: "Run AI path calculation" },
      { code: PERMISSIONS.ROUTE_PLANNING.APPROVE, label: "Approve Route", desc: "Supervisor route approval" },
      { code: PERMISSIONS.ROUTE_PLANNING.REJECT, label: "Reject Route", desc: "Reject exception route" },
      { code: PERMISSIONS.ROUTE_PLANNING.EXECUTE, label: "Dispatch Route", desc: "Activate physical route" },
    ],
  },
  {
    title: "Mail & Agent Platform",
    icon: Mail,
    permissions: [
      { code: PERMISSIONS.MAIL.READ, label: "Read Email Threads", desc: "Access assigned mail threads" },
      { code: PERMISSIONS.MAIL.DRAFT_CREATE, label: "Create Drafts", desc: "Draft AI-assisted responses" },
      { code: PERMISSIONS.MAIL.SEND, label: "Send Mail", desc: "Dispatch emails to clients" },
      { code: PERMISSIONS.MAIL.THREAD_CLAIM, label: "Claim Thread", desc: "Self-assign incoming threads" },
      { code: PERMISSIONS.MAIL.THREAD_READ_ALL, label: "Read All Threads", desc: "Supervisory team mailbox view" },
      { code: PERMISSIONS.MAIL.THREAD_REASSIGN, label: "Reassign Thread", desc: "Rebalance thread assignments" },
      { code: PERMISSIONS.MAIL.QUARANTINE_RELEASE, label: "Release Quarantine", desc: "Unblock suspicious mail" },
    ],
  },
  {
    title: "Documents & Compliance",
    icon: ShieldCheck,
    permissions: [
      { code: PERMISSIONS.DOCUMENTS.INGEST, label: "Upload Documents", desc: "Ingest invoices, BoLs, customs" },
      { code: PERMISSIONS.DOCUMENTS.MANAGE, label: "Manage Documents", desc: "Update and delete documents" },
      { code: PERMISSIONS.OCR.REVIEW, label: "OCR Verification", desc: "Confirm/correct OCR extractions" },
      { code: PERMISSIONS.COMPLIANCE.OVERRIDE, label: "Compliance Override", desc: "Bypass non-blocking rules" },
    ],
  },
  {
    title: "System & Notifications",
    icon: Bell,
    permissions: [
      { code: PERMISSIONS.NOTIFICATION.ACCESS, label: "Browser Notifications", desc: "Receive FCM push notifications" },
      { code: PERMISSIONS.BILLING.READ, label: "View Billing", desc: "View invoices and settlement" },
      { code: PERMISSIONS.GPS.GEOFENCE_MANAGE, label: "Geofence Management", desc: "Configure boundary alerts" },
    ],
  },
];

export function SettingsPage() {
  const { data: user } = useCurrentUserQuery();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<"vi" | "en">("vi");

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? theme : "system";
  const userPermissions = user?.permissions ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Profile"
        description="Manage your account profile, direct capability permissions, theme appearance, and language preferences."
      />

      {/* Profile Section */}
      <WorkspaceCard className="p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border-2 border-primary/20 shadow-sm">
              <AvatarFallback className="bg-primary text-xl font-bold text-white">
                {user?.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "OP"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-foreground">
                  {user?.name || "Operations Staff"}
                </h2>
                <Badge variant="secondary" className="bg-blue-50 text-primary border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                  {user?.role || "STAFF"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{user?.email || "ops@acmelogistics.com"}</p>
              <p className="text-xs text-muted-foreground">
                Tenant: <span className="font-mono text-foreground">{user?.tenantId || "acme-logistics"}</span> · User ID: <span className="font-mono">{user?.userId || "user-local"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="flex items-center gap-1.5 border-emerald-300 bg-emerald-50 px-3 py-1 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              <UserCheck className="size-3.5" />
              Authenticated Session
            </Badge>
          </div>
        </div>
      </WorkspaceCard>

      {/* Theme & Appearance */}
      <WorkspaceCard className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Appearance & Theme</h3>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Customize the visual interface of the Control Tower.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={cn(
              "flex flex-col items-center gap-3 rounded-xl border-2 p-4 text-left transition-all",
              currentTheme === "light"
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:bg-muted/40",
            )}
          >
            <div className="grid size-10 place-items-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950">
              <Sun className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Light Mode</p>
              <p className="text-xs text-muted-foreground">Clean, high-contrast light theme</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={cn(
              "flex flex-col items-center gap-3 rounded-xl border-2 p-4 text-left transition-all",
              currentTheme === "dark"
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:bg-muted/40",
            )}
          >
            <div className="grid size-10 place-items-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950">
              <Moon className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Dark Mode</p>
              <p className="text-xs text-muted-foreground">Sleek, low-glare dark theme</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme("system")}
            className={cn(
              "flex flex-col items-center gap-3 rounded-xl border-2 p-4 text-left transition-all",
              currentTheme === "system"
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:bg-muted/40",
            )}
          >
            <div className="grid size-10 place-items-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800">
              <Laptop className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">System Sync</p>
              <p className="text-xs text-muted-foreground">Match OS appearance automatically</p>
            </div>
          </button>
        </div>
      </WorkspaceCard>

      {/* Language & Regional Settings */}
      <WorkspaceCard className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Globe className="size-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Language & Regional</h3>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Select preferred display language for UI labels and notifications.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant={language === "vi" ? "default" : "outline"}
            onClick={() => setLanguage("vi")}
            className="flex items-center gap-2"
          >
            🇻🇳 Tiếng Việt (Vietnamese)
          </Button>
          <Button
            type="button"
            variant={language === "en" ? "default" : "outline"}
            onClick={() => setLanguage("en")}
            className="flex items-center gap-2"
          >
            🇺🇸 English (US)
          </Button>
        </div>
      </WorkspaceCard>

      {/* Direct Capabilities (CBAC Explorer) */}
      <WorkspaceCard className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="size-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Direct Capability Permissions</h3>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            {userPermissions.length} Active Capabilities
          </Badge>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          Your runtime operational authority derived directly from <code className="text-primary font-semibold">UserPermissions</code> (CBAC).
        </p>

        <div className="space-y-6">
          {PERMISSION_GROUPS.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.title} className="rounded-xl border border-border p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Icon className="size-4 text-primary" />
                  <h4 className="text-sm font-bold text-foreground">{group.title}</h4>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {group.permissions.map((p) => {
                    const isGranted = userPermissions.includes(p.code);
                    return (
                      <div
                        key={p.code}
                        className={cn(
                          "flex items-start justify-between gap-2 rounded-lg border p-3 transition-colors",
                          isGranted
                            ? "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30"
                            : "border-border/60 bg-muted/20 opacity-60",
                        )}
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-foreground">{p.label}</p>
                          <p className="text-[11px] text-muted-foreground">{p.desc}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">{p.code}</p>
                        </div>
                        {isGranted ? (
                          <Badge className="shrink-0 bg-primary/90 text-[10px] text-white">
                            <CheckCircle2 className="mr-1 size-3" /> Granted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="shrink-0 text-[10px] text-muted-foreground">
                            Not Granted
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </WorkspaceCard>
    </div>
  );
}
