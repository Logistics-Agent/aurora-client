"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthFrame } from "../components/auth-frame";
import { tenantMocks } from "../mock";

export function SelectTenantPage() {
  const [selected, setSelected] = useState("ACME Logistics");

  return (
    <AuthFrame
      title="Select workspace"
      description="You have access to 3 operational tenants."
    >
      <div className="mt-8 space-y-3">
        {tenantMocks.map(([initials, name, subtitle, meta]) => (
          <button
            type="button"
            key={name}
            onClick={() => setSelected(name)}
            className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left ${selected === name ? "border-primary bg-blue-50/50" : "border-border hover:bg-secondary"}`}
          >
            <span className="grid size-11 place-items-center rounded-lg bg-primary text-xs font-bold text-white">
              {initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{name}</span>
              <span className="block text-xs text-muted-foreground">
                {subtitle}
              </span>
              <span className="mt-1 block text-[11px] text-success">
                ● {meta}
              </span>
            </span>
            <ArrowRight className="size-4 text-muted-foreground" />
          </button>
        ))}
        <Button className="mt-4 w-full">Continue to {selected}</Button>
        <button
          type="button"
          className="w-full text-center text-sm text-muted-foreground hover:underline"
        >
          Sign out
        </button>
      </div>
    </AuthFrame>
  );
}
