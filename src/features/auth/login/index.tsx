"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService, type IdentifyResponse } from "@/api/services/auth.service";
import { AuthFrame } from "../components/auth-frame";

type AuthStep = "IDENTIFY" | "PASSWORD" | "COMPLETE_INVITATION";

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/overview";

  const [step, setStep] = useState<AuthStep>("IDENTIFY");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Invitation completion (First-time temporary password login)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [sessionCode, setSessionCode] = useState<string>("");

  // Identified Tenant Info
  const [identity, setIdentity] = useState<IdentifyResponse | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ── 1. Step: Identify ────────────────────────────────────────────────────────
  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid work email address.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authService.identify(email.trim());
      if (res && res.exists) {
        setIdentity(res);
        setStep("PASSWORD");
      } else {
        setErrorMessage(
          "We couldn't find an account matching that email address. Please contact your system administrator.",
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.detail ||
          err?.message ||
          "Unable to identify account. Please check your connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ── 2. Step: Password Login ──────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authService.login({
        email: email.trim(),
        password,
        tenantCode: identity?.tenantCode,
      });

      setSuccessMessage("Authenticated successfully! Redirecting…");
      setTimeout(() => {
        window.location.assign(returnUrl);
      }, 500);
    } catch (err: any) {
      // Check for 409 Conflict indicating first-time login (FORCE_CHANGE_PASSWORD)
      if (
        err?.response?.status === 409 ||
        err?.response?.data?.requiresInvitationCompletion
      ) {
        const session =
          err?.response?.data?.session ||
          err?.response?.data?.detail?.replace("NEW_PASSWORD_REQUIRED:", "") ||
          "";
        setSessionCode(session);
        setStep("COMPLETE_INVITATION");
        setErrorMessage(null);
      } else if (err?.response?.status === 401) {
        setErrorMessage("Incorrect password. Please verify your credentials.");
      } else {
        setErrorMessage(
          err?.response?.data?.detail ||
            err?.message ||
            "Authentication failed. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── 3. Step: Complete Invitation (Set Permanent Password) ───────────────────
  const handleCompleteInvitation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authService.completeInvitation({
        email: email.trim(),
        newPassword,
        confirmationCode: sessionCode,
      });

      setSuccessMessage("Password established successfully! Welcome to LogiSphere.");
      setTimeout(() => {
        window.location.assign(returnUrl);
      }, 600);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to set new password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFrame
      title={
        step === "COMPLETE_INVITATION"
          ? "Set New Password"
          : step === "PASSWORD"
            ? "Enter Password"
            : "Sign In"
      }
      description={
        step === "COMPLETE_INVITATION"
          ? "Welcome! Please create a secure permanent password to activate your account."
          : step === "PASSWORD"
            ? "Enter your credentials to access your organization's workspace."
            : "Enter your work email address to get started."
      }
    >
      <div className="space-y-5 animate-in fade-in duration-300">
        {/* Error Alert */}
        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/90 backdrop-blur-md p-3.5 text-xs text-rose-800 animate-in fade-in shadow-xs">
            <p className="font-semibold">{errorMessage}</p>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 backdrop-blur-md p-3.5 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in shadow-xs">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <p className="font-semibold">{successMessage}</p>
          </div>
        )}

        {/* ── STEP 1: IDENTIFY EMAIL ────────────────────────────────────────── */}
        {step === "IDENTIFY" && (
          <form onSubmit={handleIdentify} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold text-slate-700">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 size-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="pl-10 h-11 text-sm bg-white/95 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus-visible:border-sky-500 focus-visible:ring-sky-500/20 shadow-xs"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold gap-2 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 hover:from-sky-500 hover:via-blue-500 hover:to-cyan-500 text-white shadow-[0_4px_18px_rgba(2,132,199,0.35)] transition-all hover:scale-[1.01] active:scale-[0.99]"
              disabled={isLoading || !email.trim()}
            >
              <span>{isLoading ? "Identifying account…" : "Continue"}</span>
              <ArrowRight className="size-4" />
            </Button>
          </form>
        )}

        {/* ── STEP 2: PASSWORD LOGIN ────────────────────────────────────────── */}
        {step === "PASSWORD" && (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Account Card */}
            <div className="flex items-center justify-between rounded-xl border border-sky-200/90 bg-sky-50/70 backdrop-blur-md p-3 text-xs shadow-xs">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="grid size-8 place-items-center rounded-lg bg-sky-500/15 border border-sky-300 text-sky-700 font-bold text-xs shrink-0">
                  {identity?.tenantCode ? identity.tenantCode.slice(0, 2).toUpperCase() : "WS"}
                </div>
                <div className="truncate">
                  <p className="font-semibold text-slate-900 truncate">{email}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Building2 className="size-3 text-sky-600" />
                    {identity?.tenantCode || "Default Organization"} ·{" "}
                    <span className="capitalize text-slate-700 font-medium">{identity?.userType?.replace("_", " ").toLowerCase() || "Member"}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep("IDENTIFY");
                  setPassword("");
                  setErrorMessage(null);
                }}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline ml-2 shrink-0 transition-colors"
              >
                Change
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 size-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password or temporary code"
                  className="pl-10 pr-10 h-11 text-sm bg-white/95 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus-visible:border-sky-500 focus-visible:ring-sky-500/20 shadow-xs"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold gap-2 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 hover:from-sky-500 hover:via-blue-500 hover:to-cyan-500 text-white shadow-[0_4px_18px_rgba(2,132,199,0.35)] transition-all hover:scale-[1.01] active:scale-[0.99]"
              disabled={isLoading || !password}
            >
              <span>{isLoading ? "Signing In…" : "Sign In"}</span>
              <ArrowRight className="size-4" />
            </Button>
          </form>
        )}

        {/* ── STEP 3: COMPLETE INVITATION / SET PERMANENT PASSWORD ─────────── */}
        {step === "COMPLETE_INVITATION" && (
          <form onSubmit={handleCompleteInvitation} className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 backdrop-blur-md p-3 text-xs text-amber-900 flex items-start gap-2.5 shadow-xs">
              <Sparkles className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">First-time login detected</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Please establish your permanent password for account <span className="font-semibold text-slate-900">{email}</span>.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-xs font-semibold text-slate-700">
                New Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 size-4 text-slate-400" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  className="pl-10 pr-10 h-11 text-sm bg-white/95 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus-visible:border-sky-500 focus-visible:ring-sky-500/20 shadow-xs"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 size-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Re-enter your new password"
                  className="pl-10 h-11 text-sm bg-white/95 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus-visible:border-sky-500 focus-visible:ring-sky-500/20 shadow-xs"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <Button
                type="button"
                variant="outline"
                className="h-11 text-xs border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl"
                onClick={() => {
                  setStep("PASSWORD");
                  setErrorMessage(null);
                }}
                disabled={isLoading}
              >
                <ArrowLeft className="size-3.5 mr-1" />
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 text-sm font-semibold gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:via-teal-500 hover:to-sky-500 text-white shadow-[0_4px_18px_rgba(16,185,129,0.35)] transition-all hover:scale-[1.01] active:scale-[0.99]"
                disabled={isLoading || !newPassword || !confirmPassword}
              >
                <span>{isLoading ? "Setting Password…" : "Set Password & Sign In"}</span>
                <CheckCircle2 className="size-4" />
              </Button>
            </div>
          </form>
        )}

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 border-t border-slate-100 pt-4">
          <ShieldCheck className="size-3.5 text-sky-600" />
          <span>Enterprise Secure Authentication · OAuth2 / OIDC</span>
        </div>
      </div>
    </AuthFrame>
  );
}



