"use client";

import Link from "next/link";
import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthFrame } from "../components/auth-frame";
import { authenticateMock } from "../mock";

export function LoginPage() {
  const [state, setState] = useState<
    "default" | "loading" | "error" | "locked"
  >("default");

  return (
    <AuthFrame
      title="Welcome back"
      description="Sign in to ACME Logistics operations"
    >
      <form
        className="mt-10 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          setState("loading");
          window.setTimeout(
            () =>
              setState(
                authenticateMock("ops@acmelogistics.com", "password") ===
                  "success"
                  ? "default"
                  : "error",
              ),
            500,
          );
        }}
      >
        {state === "error" && (
          <div
            role="alert"
            className="border-l-4 border-critical bg-red-50 p-3 text-sm text-red-700"
          >
            Email or password is incorrect.
          </div>
        )}
        {state === "locked" && (
          <div
            role="alert"
            className="border-l-4 border-critical bg-red-50 p-3 text-sm text-red-700"
          >
            Account locked after repeated attempts. Try again in 14:32.
          </div>
        )}
        <label className="block space-y-2 text-sm font-medium">
          Work email
          <Input required type="email" defaultValue="ops@acmelogistics.com" />
        </label>
        <label className="block space-y-2 text-sm font-medium">
          Password
          <Input required type="password" defaultValue="password" />
        </label>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Remember me
          </label>
          <Link
            href="/forgot-password"
            className="text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button className="w-full" disabled={state === "loading"}>
          {state === "loading" ? "Signing in…" : "Sign in"}
        </Button>
        <div className="flex justify-center gap-2 text-xs text-muted-foreground">
          <LockKeyhole className="size-3.5" /> Protected by enterprise SSO ·
          Need help?
        </div>
      </form>
      <button
        type="button"
        className="mt-4 text-xs text-muted-foreground hover:underline"
        onClick={() => setState("locked")}
      >
        Preview locked state
      </button>
    </AuthFrame>
  );
}
