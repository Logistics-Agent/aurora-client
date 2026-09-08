"use client";

import Link from "next/link";
import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/api/services/auth.service";
import { AuthFrame } from "../components/auth-frame";

export function LoginPage() {
  const [state, setState] = useState<"default" | "loading" | "locked">(
    "default",
  );

  const handleCognitoLogin = () => {
    setState("loading");
    window.location.assign(authService.buildLoginRedirectUrl("/overview"));
  };

  return (
    <AuthFrame
      title="Welcome back"
      description="Sign in to ACME Logistics operations via Cognito SSO"
    >
      <div className="mt-8 space-y-4">
        <Button
          type="button"
          className="w-full h-11 text-base font-semibold shadow-sm"
          disabled={state === "loading"}
          onClick={handleCognitoLogin}
        >
          {state === "loading" ? "Redirecting to Cognito…" : "Sign in with Cognito"}
        </Button>

        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <span className="relative bg-card px-2 text-xs uppercase tracking-wider text-muted-foreground">
            Or standard login
          </span>
        </div>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleCognitoLogin();
          }}
        >
          {state === "locked" && (
            <div
              role="alert"
              className="border-l-4 border-critical bg-red-50 p-3 text-sm text-red-700"
            >
              Account locked after repeated attempts. Try again in 14:32.
            </div>
          )}
          <label className="block space-y-1.5 text-sm font-medium">
            Work email
            <Input required type="email" defaultValue="ops@acmelogistics.com" />
          </label>
          <label className="block space-y-1.5 text-sm font-medium">
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
          <Button variant="outline" className="w-full" disabled={state === "loading"}>
            {state === "loading" ? "Signing in…" : "Sign in"}
          </Button>
          <div className="flex justify-center gap-2 text-xs text-muted-foreground pt-2">
            <LockKeyhole className="size-3.5" /> Protected by AWS Cognito SSO ·
            Need help?
          </div>
        </form>

        <button
          type="button"
          className="mt-2 block w-full text-center text-xs text-muted-foreground hover:underline"
          onClick={() => setState("locked")}
        >
          Preview locked state
        </button>
      </div>
    </AuthFrame>
  );
}
