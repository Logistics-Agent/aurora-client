"use client";

import { Command, HelpCircle, LogOut, Search, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { RealtimeStatus } from "@/components/common";
import { Button } from "@/components/ui/button";
import { useAuthLogout } from "@/hooks/mutations/auth/use-auth-logout";
import { NotificationBell } from "./notification-bell";

export function AppHeader() {
  const logoutMutation = useAuthLogout();

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
        <NotificationBell />
        <HelpCircle className="hidden size-5 text-muted-foreground sm:block" />
        {logoutMutation.isError && (
          <span className="sr-only" role="alert">
            Unable to sign out while browser notification cleanup is pending.
          </span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Sign out"
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="size-4" />
        </Button>
        <Avatar className="size-9">
          <AvatarFallback className="bg-primary text-xs font-semibold text-white">
            AN
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
