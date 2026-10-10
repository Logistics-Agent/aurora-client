"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFcmNotification } from "../hooks/use-fcm-notification";

export function FcmPermissionControl() {
  const { state, errorMessage, fcmToken, enable, disable } = useFcmNotification();
  const [copied, setCopied] = useState(false);

  if (state === "disabled") {
    return (
      <p className="text-sm text-muted-foreground">
        Browser notifications are disabled for this environment.
      </p>
    );
  }

  if (state === "unsupported") {
    return (
      <p className="text-sm text-muted-foreground">This browser does not support notifications.</p>
    );
  }

  if (state === "enabled") {
    return (
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-emerald-700" aria-live="polite">
          In-app and desktop notifications enabled
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void disable()}
          aria-label="Disable desktop notifications"
        >
          Disable
        </Button>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="space-y-1">
        <p className="text-sm text-amber-700" role="alert">
          Desktop notification permission is blocked in browser settings.
        </p>
        <p className="text-xs text-muted-foreground">In-app notifications remain available.</p>
      </div>
    );
  }

  const isBusy = state === "requesting" || state === "registering";

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-foreground">In-app notifications are always on.</p>
        <p className="text-xs text-muted-foreground">
          Enable desktop notifications only if you want updates while Aurora is in the background.
        </p>
      </div>
      {state === "error" && (
        <p className="text-sm text-red-700" role="alert">
          {errorMessage ?? "Unable to enable desktop notifications."}
        </p>
      )}
      {state === "error" && fcmToken && process.env.NODE_ENV !== "production" && (
        <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs text-amber-900">
            Firebase created the browser token, but the backend device registration failed. You can
            copy it for a local gRPC test.
          </p>
          <code
            className="block max-h-16 overflow-auto rounded bg-white p-2 text-[11px] break-all text-slate-700"
            data-testid="fcm-token"
          >
            {fcmToken}
          </code>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              void navigator.clipboard.writeText(fcmToken).then(() => {
                setCopied(true);
              });
            }}
          >
            {copied ? "FCM token copied" : "Copy FCM token"}
          </Button>
        </div>
      )}
      <Button
        type="button"
        size="sm"
        disabled={isBusy}
        onClick={() => void enable()}
        aria-label="Enable desktop notifications"
      >
        {isBusy ? "Enabling desktop notifications…" : "Enable desktop notifications"}
      </Button>
    </div>
  );
}
