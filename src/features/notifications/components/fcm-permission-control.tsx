"use client";

import { Button } from "@/components/ui/button";
import { useFcmNotification } from "../hooks/use-fcm-notification";

export function FcmPermissionControl() {
  const { state, errorMessage, enable, disable } = useFcmNotification();

  if (state === "disabled") {
    return (
      <p className="text-sm text-muted-foreground">
        Browser notifications are disabled for this environment.
      </p>
    );
  }

  if (state === "unsupported") {
    return (
      <p className="text-sm text-muted-foreground">
        This browser does not support notifications.
      </p>
    );
  }

  if (state === "enabled") {
    return (
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-emerald-700" aria-live="polite">
          Notifications enabled
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void disable()}
          aria-label="Disable browser notifications"
        >
          Disable
        </Button>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <p className="text-sm text-amber-700" role="alert">
        Permission blocked in browser settings.
      </p>
    );
  }

  const isBusy = state === "requesting" || state === "registering";

  return (
    <div className="space-y-2">
      {state === "error" && (
        <p className="text-sm text-red-700" role="alert">
          {errorMessage ?? "Unable to enable browser notifications."}
        </p>
      )}
      <Button
        type="button"
        size="sm"
        disabled={isBusy}
        onClick={() => void enable()}
        aria-label="Enable browser notifications"
      >
        {isBusy ? "Enabling notifications…" : "Enable browser notifications"}
      </Button>
    </div>
  );
}
