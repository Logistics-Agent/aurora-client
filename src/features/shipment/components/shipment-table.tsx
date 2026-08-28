"use client";

import { useMemo, useState } from "react";
import {
  EmptyState,
  FilterBar,
  RiskBadge,
  StatusBadge,
} from "@/components/common";
import { shipmentUiFixtures } from "../mock";

export function ShipmentTable() {
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
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr
                className="border-t border-border hover:bg-secondary"
                key={item.id}
              >
                <td className="px-4 py-4">
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
                <td className="px-4 py-4 font-semibold text-primary">
                  {item.id}
                </td>
                <td className="px-4 py-4">{item.customer}</td>
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
