import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Globe2,
  LayoutDashboard,
  Mail,
  Map,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const workspaceCards = [
  {
    title: "Staff Operations Workspace",
    badge: "Operations",
    description: "Shipment monitoring, exceptions, and hub throughput metrics.",
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
    description: "Operational mail triage, draft replies, and AI assistance.",
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
    description: "Track cargo, documents, invoices, and customer requests.",
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
    description: "Plan multimodal routes and review live GPS conditions.",
    href: "/route-planning",
    icon: Map,
    links: [
      { label: "Route Planning", href: "/route-planning" },
      { label: "Live Map", href: "/live-map" },
    ],
  },
  {
    title: "Compliance & Documents",
    badge: "Audit & Trade",
    description: "Review customs documentation and compliance findings.",
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
    <main className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#172b3e] selection:bg-sky-500/20 dark:bg-[#080f18] dark:text-[#eaf0f7]">
      <header className="border-b border-[#cad6e1]/80 bg-[#f8fafc]/80 backdrop-blur-xl dark:border-[#344354] dark:bg-[#080f18]/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-[0.2em]">
            <Globe2 className="size-6 text-[#2f659e] dark:text-[#9aabbd]" />
            AURORA
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-lg px-3 py-2 text-xs font-semibold text-[#627489] transition-colors hover:bg-[#cad6e1]/50 hover:text-[#172b3e] dark:text-[#9aabbd] dark:hover:bg-[#344354] dark:hover:text-[#eaf0f7]">
              Sign in
            </Link>
            <Button asChild className="rounded-lg bg-[#2f659e] text-white shadow-none hover:bg-[#3c77b3]">
              <Link href="/overview" className="gap-2">
                Open workspace <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="border-b border-[#cad6e1]/70 bg-[radial-gradient(ellipse_at_78%_44%,#d6e1ec_0,#edf2f7_43%,#f8fafc_78%)] px-6 py-20 dark:border-[#344354] dark:bg-[radial-gradient(ellipse_at_78%_44%,#192b3d_0,#0b1521_45%,#080f18_80%)] lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="mb-5 text-[10px] font-semibold tracking-[0.24em] text-[#627489] dark:text-[#9aabbd]">
              LOGISTICS AI CONTROL TOWER
            </p>
            <h1 className="max-w-xl text-4xl font-medium leading-[1.08] tracking-[-0.045em] text-[#172b3e] dark:text-[#eaf0f7] sm:text-6xl">
              One view of every moving part.
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-8 text-[#627489] dark:text-[#9aabbd] sm:text-base">
              Aurora connects operations, communications, route planning, and customer visibility in one calm control tower.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="h-11 rounded-lg bg-[#2f659e] px-5 text-white shadow-none hover:bg-[#3c77b3]">
                <Link href="/overview" className="gap-2">
                  <LayoutDashboard className="size-4" /> Open operations
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-lg border-[#cad6e1] bg-transparent px-5 text-[#172b3e] hover:bg-[#cad6e1]/40 dark:border-[#344354] dark:text-[#eaf0f7] dark:hover:bg-[#344354]">
                <Link href="/portal" className="gap-2">
                  <Truck className="size-4" /> Customer portal
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#627489] dark:text-[#9aabbd]">WORKSPACES</p>
            <h2 className="mt-2 text-xl font-medium tracking-tight text-[#172b3e] dark:text-[#eaf0f7]">Choose an operational entry point</h2>
          </div>
          <span className="hidden text-xs text-[#627489] dark:text-[#9aabbd] sm:block">{workspaceCards.length} connected areas</span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workspaceCards.map(({ title, badge, description, href, icon: Icon, links }) => (
            <article key={href} className="group flex min-h-52 flex-col justify-between rounded-xl border border-[#cad6e1] bg-white/70 p-5 shadow-[0_10px_30px_rgba(23,43,62,0.04)] transition-colors hover:border-[#5b95d2] dark:border-[#344354] dark:bg-[#101c2a]/80 dark:shadow-none">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 place-items-center rounded-lg bg-[#edf2f7] text-[#2f659e] transition-colors group-hover:bg-[#2f659e] group-hover:text-white dark:bg-[#192b3d] dark:text-[#9aabbd] dark:group-hover:bg-[#3c77b3] dark:group-hover:text-white">
                    <Icon className="size-5" />
                  </span>
                  <span className="rounded-full border border-[#cad6e1] px-2 py-1 text-[10px] font-semibold text-[#627489] dark:border-[#344354] dark:text-[#9aabbd]">
                    {badge}
                  </span>
                </div>
                <h3 className="mt-5 text-sm font-semibold text-[#172b3e] dark:text-[#eaf0f7]">
                  <Link href={href} className="inline-flex items-center gap-1.5 hover:text-[#2f659e] dark:hover:text-[#9aabbd]">
                    {title} <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </h3>
                <p className="mt-2 text-xs leading-6 text-[#627489] dark:text-[#9aabbd]">{description}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-1.5 border-t border-[#cad6e1]/70 pt-3 dark:border-[#344354]">
                {links.map((link) => (
                  <Link key={link.href} href={link.href} className="rounded-md bg-[#edf2f7] px-2 py-1 text-[10px] font-medium text-[#627489] transition-colors hover:bg-[#d6e1ec] hover:text-[#2f659e] dark:bg-[#192b3d] dark:text-[#9aabbd] dark:hover:bg-[#344354] dark:hover:text-[#eaf0f7]">
                    {link.label}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#cad6e1]/70 px-6 py-6 text-center text-[10px] tracking-wide text-[#627489] dark:border-[#344354] dark:text-[#9aabbd] lg:px-10">
        Aurora Logistics AI Control Tower · Operational clarity, in motion.
      </footer>
    </main>
  );
}
