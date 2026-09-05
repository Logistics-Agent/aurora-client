import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bot,
  FileText,
  LayoutDashboard,
  Mail,
  Map,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const workspaceCards = [
  {
    title: "Staff Operations Workspace",
    badge: "Operations",
    badgeColor: "bg-blue-50 text-primary border-blue-200",
    description:
      "Core operational control tower with real-time shipment monitoring, exceptions, and hub throughput metrics.",
    href: "/overview",
    icon: LayoutDashboard,
    links: [
      { label: "Overview", href: "/overview" },
      { label: "Shipments", href: "/shipments" },
      { label: "Live Map", href: "/live-map" },
    ],
  },
  {
    title: "Staff Mail & Communications",
    badge: "AI Communications",
    badgeColor: "bg-purple-50 text-ai border-purple-200",
    description:
      "3-pane operational mail workspace with customer inquiry triage, draft replies, and AI counter-offers.",
    href: "/mail",
    icon: Mail,
    links: [
      { label: "Mail Workspace", href: "/mail" },
      { label: "AI Assistant", href: "/assistant" },
    ],
  },
  {
    title: "Customer Self-Service Portal",
    badge: "Customer Facing",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description:
      "Dedicated portal for shippers and consignees to track cargo, download commercial documents, and pay invoices.",
    href: "/portal",
    icon: Truck,
    links: [
      { label: "Portal Home", href: "/portal" },
      { label: "My Shipments", href: "/portal/shipments" },
      { label: "Documents", href: "/portal/documents" },
      { label: "Invoices", href: "/portal/invoices" },
    ],
  },
  {
    title: "Route Planning & Live Map",
    badge: "Geospatial Engine",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    description:
      "Multi-modal route planner with waypoint optimization, weather disruption alerts, and live GPS map.",
    href: "/route-planning",
    icon: Map,
    links: [
      { label: "Route Planning", href: "/route-planning" },
      { label: "Live Map", href: "/live-map" },
    ],
  },
  {
    title: "Tenant Administration & IAM",
    badge: "Security & Control",
    badgeColor: "bg-slate-100 text-slate-800 border-slate-300",
    description:
      "Enterprise control plane for managing tenant staff, fine-grained capability assignments, and security audit logs.",
    href: "/admin/users",
    icon: ShieldCheck,
    links: [
      { label: "Users & Roles", href: "/admin/users" },
      { label: "Tenant Profile", href: "/admin/tenant" },
    ],
  },
  {
    title: "Compliance & Documents",
    badge: "Audit & Trade",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    description:
      "Customs documentation repository, regulatory verification, bill of lading filing, and automated compliance checks.",
    href: "/compliance",
    icon: FileText,
    links: [
      { label: "Compliance Center", href: "/compliance" },
      { label: "All Documents", href: "/documents" },
    ],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg bg-primary text-sm font-bold text-white shadow-sm">
              L
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">Aurora</span>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wide">
                  Control Tower
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">ACME Logistics Operations</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="shadow-sm">
              <Link href="/overview" className="gap-1.5">
                <span>Enter Workspace</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-card to-background px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-medium text-primary">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            Active Platform Workspaces
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Logistics AI Control Tower
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Centralized intelligent logistics suite for autonomous dispatching, live fleet tracking,
            multimodal route planning, and customer collaboration.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild className="shadow-md shadow-primary/20">
              <Link href="/overview" className="gap-2 font-semibold">
                <LayoutDashboard className="size-4" /> Open Operations Workspace
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/portal" className="gap-2">
                <Truck className="size-4" /> Customer Portal
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Direct Module Navigation Cards */}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Workspaces & Applications
              </h2>
              <p className="text-xs text-muted-foreground">
                Select an entry point below to navigate directly to each operational module.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workspaceCards.map(
              ({ title, badge, badgeColor, description, href, icon: Icon, links }) => (
                <div
                  key={href}
                  className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                        <Icon className="size-5" />
                      </div>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${badgeColor}`}
                      >
                        {badge}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        <Link href={href} className="flex items-center gap-1.5 focus:outline-none">
                          {title}
                          <ArrowRight className="size-3.5 opacity-0 transition-all -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0" />
                        </Link>
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-border pt-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Quick Links
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-[11px] font-medium text-foreground hover:bg-blue-50 hover:text-primary transition-colors"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 text-center text-xs text-muted-foreground">
        <p>Aurora Logistics AI Control Tower • Development & Testing Workspace</p>
      </footer>
    </div>
  );
}
