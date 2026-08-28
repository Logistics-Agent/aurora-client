"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthFrame } from "../components/auth-frame";

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  return (
    <AuthFrame
      title={sent ? "Check your inbox" : "Reset password"}
      description={
        sent
          ? "We sent a secure reset link to ops@acmelogistics.com."
          : "Enter your work email and we’ll send a secure reset link."
      }
    >
      {sent ? (
        <div className="mt-10 space-y-5">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <CheckCircle2 className="size-6 text-success" />
            <p className="mt-3 font-semibold">Reset link sent</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The link expires in 30 minutes.
            </p>
          </div>
          <Button className="w-full" onClick={() => setSent(false)}>
            Send another link
          </Button>
        </div>
      ) : (
        <form
          className="mt-10 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            setSent(true);
          }}
        >
          <label className="block space-y-2 text-sm font-medium">
            Work email
            <Input required type="email" defaultValue="ops@acmelogistics.com" />
          </label>
          <Button className="w-full">
            Send reset link <ArrowRight className="ml-2 size-4" />
          </Button>
          <Link
            className="block text-center text-sm text-primary hover:underline"
            href="/login"
          >
            ← Back to sign in
          </Link>
        </form>
      )}
    </AuthFrame>
  );
}
