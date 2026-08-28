"use client";

import { Bell, Command, HelpCircle, Search, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { RealtimeStatus } from "@/components/common";

export function AppHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 sm:px-6">
      <div className="relative min-w-0 max-w-xl flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-10 bg-secondary pl-9 pr-16"
          placeholder="Search shipment, customer, hub or document…"
        />
        <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 text-[10px] text-muted-foreground sm:flex">
          <Command className="size-3" />K
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <RealtimeStatus state="live" />
        <span className="hidden items-center gap-1 text-xs font-medium text-ai sm:flex">
          <Sparkles className="size-3.5" />
          AI · 3 processing
        </span>
        <button
          type="button"
          aria-label="Notifications"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="size-5" />
          <span className="absolute -right-1 -top-1 size-2 rounded-full bg-critical" />
        </button>
        <HelpCircle className="hidden size-5 text-muted-foreground sm:block" />
        <Avatar className="size-9">
          <AvatarFallback className="bg-primary text-xs font-semibold text-white">
            AN
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
