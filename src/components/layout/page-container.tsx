"use client";

import { useSidebarStore } from "@/stores/sidebar.store";
import { cn } from "@/lib/utils";

export function PageContainer({ children }: { children: React.ReactNode }) {
  const isExpanded = useSidebarStore((state) => state.isExpanded);

  return (
    <main
      className={cn(
        "min-w-0 flex-1 overflow-y-auto transition-[margin-left] duration-200 ease-out",
        isExpanded ? "lg:ml-[224px]" : "lg:ml-[64px]",
      )}
    >
      <div className="w-full p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </main>
  );
}
