"use client";

import { useState } from "react";
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/api/services/auth.service";
import { AuthFrame } from "../components/auth-frame";

export function LoginPage() {
  const [redirecting, setRedirecting] = useState(false);

  const handleCognitoRedirect = () => {
    setRedirecting(true);
    if (typeof window !== "undefined") {
      const returnUrl =
        new URLSearchParams(window.location.search).get("returnUrl") || "/overview";
      window.location.assign(authService.buildLoginRedirectUrl(returnUrl));
    }
  };

  return (
    <AuthFrame
      title="Single Sign-On (SSO)"
      description="Authenticate via AWS Cognito Identity Provider for enterprise access"
    >
      <div className="mt-6 space-y-6 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-blue-50 border border-blue-100 text-primary shadow-xs">
          <ShieldCheck className="size-8 text-primary" />
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-foreground flex items-center justify-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Enterprise Cognito Identity
          </p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Your workspace is secured with AWS Cognito Single Sign-On and role-based access control.
          </p>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            className="w-full h-11 text-sm font-semibold gap-2 shadow-sm"
            disabled={redirecting}
            onClick={handleCognitoRedirect}
          >
            <span>{redirecting ? "Connecting to Cognito SSO…" : "Sign In with Cognito"}</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground border-t border-border pt-4">
          <LockKeyhole className="size-3.5 text-emerald-600" />
          <span>OAuth2 · OIDC · Secure HttpOnly Cookies</span>
        </div>
      </div>
    </AuthFrame>
  );
}
