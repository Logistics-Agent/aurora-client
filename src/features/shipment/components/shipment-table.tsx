"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import {
  EmptyState,
  FilterBar,
  RiskBadge,
  StatusBadge,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { shipmentUiFixtures } from "../mock";

export function ShipmentTable() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const rows = useMemo(
    () =>
      shipmentUiFixtures.filter((item) =>
        `${item.id} ${item.customer} ${item.lane}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <div className="space-y-4">
      <FilterBar
        value={query}
        onChange={setQuery}
        chips={selected.length ? [`${selected.length} selected`] : []}
        onClear={() => {
          setQuery("");
          setSelected([]);
        }}
      />
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-secondary text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="w-10 px-4 py-3" />
              <th className="px-4 py-3">Shipment</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Lane</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Risk</th>
              <th className="px-4 py-3">ETA</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr
                key={item.id}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest("input[type='checkbox']") || target.closest("a") || target.closest("button")) {
                    return;
                  }
                  router.push(`/shipments/${item.id}`);
                }}
                className="group cursor-pointer border-t border-border transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    aria-label={`Select ${item.id}`}
                    checked={selected.includes(item.id)}
                    onChange={(event) =>
                      setSelected((current) =>
                        event.target.checked
                          ? [...current, item.id]
                          : current.filter((id) => id !== item.id),
                      )
                    }
                  />
                </td>
                <td className="px-4 py-4">
                  <Link
                    href={`/shipments/${item.id}`}
                    className="font-semibold text-primary hover:underline focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.id}
                  </Link>
                </td>
                <td className="px-4 py-4 font-medium text-foreground">{item.customer}</td>
                <td className="px-4 py-4 text-muted-foreground">{item.lane}</td>
                <td className="px-4 py-4">
                  <StatusBadge
                    label={item.status}
                    intent={
                      item.status === "Delayed"
                        ? "critical"
                        : item.status === "Delivered"
                          ? "success"
                          : "info"
                    }
                  />
                </td>
                <td className="px-4 py-4">
                  <RiskBadge level={item.risk} />
                </td>
                <td className="px-4 py-4 text-muted-foreground">{item.eta}</td>
                <td className="px-4 py-4 text-right">
                  <Link
                    href={`/shipments/${item.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-blue-700 hover:underline dark:hover:text-blue-400"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>Detail</span>
                    <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <EmptyState
            title="No shipments found"
            description="Try a different search or clear your filters."
          />
        )}
      </div>
    </div>
  );
}
