"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, KeyRound, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthFrame } from "../components/auth-frame";
import { authService } from "@/api/services/auth.service";

type Step = "request_code" | "reset_password" | "success";

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("request_code");
  const [email, setEmail] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Vui lòng nhập địa chỉ email.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      await authService.forgotPassword({ email: cleanEmail });
      setStep("reset_password");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể gửi yêu cầu đặt lại mật khẩu.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = confirmationCode.trim();
    if (!cleanCode) {
      setErrorMessage("Vui lòng nhập mã xác nhận.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setErrorMessage("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      await authService.resetPassword({
        email: email.trim(),
        confirmationCode: cleanCode,
        newPassword,
      });
      setStep("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Mã xác nhận không hợp lệ hoặc đã hết hạn.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame
      title={
        step === "success"
          ? "Đổi mật khẩu thành công"
          : step === "reset_password"
          ? "Nhập mã xác nhận"
          : "Quên mật khẩu"
      }
      description={
        step === "success"
          ? "Mật khẩu của bạn đã được cập nhật thành công."
          : step === "reset_password"
          ? `Mã xác thực (OTP) đã được gửi đến hộp thư ${email}.`
          : "Nhập địa chỉ email đăng ký để nhận mã xác nhận đặt lại mật khẩu."
      }
    >
      {errorMessage && (
        <div className="mt-6 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {step === "request_code" && (
        <form className="mt-8 space-y-5" onSubmit={handleRequestCode}>
          <label className="block space-y-2 text-sm font-medium">
            Email công việc
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                required
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
              />
            </div>
          </label>
          <Button className="w-full" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi mã xác nhận"} <ArrowRight className="ml-2 size-4" />
          </Button>
          <Link
            className="block text-center text-sm text-primary hover:underline"
            href="/login"
          >
            ← Quay lại đăng nhập
          </Link>
        </form>
      )}

      {step === "reset_password" && (
        <form className="mt-8 space-y-5" onSubmit={handleResetPassword}>
          <label className="block space-y-2 text-sm font-medium">
            Mã xác nhận (OTP 6 số từ Email)
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                required
                type="text"
                placeholder="Ví dụ: 123456"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                className="pl-9 tracking-widest font-mono"
              />
            </div>
          </label>

          <label className="block space-y-2 text-sm font-medium">
            Mật khẩu mới
            <div className="relative">
              <Input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Tối thiểu 8 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </label>

          <label className="block space-y-2 text-sm font-medium">
            Xác nhận mật khẩu mới
            <Input
              required
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>

          <Button className="w-full" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setStep("request_code");
                setErrorMessage(null);
              }}
              className="text-muted-foreground hover:underline"
            >
              Gửi lại mã
            </button>
            <Link className="text-primary hover:underline" href="/login">
              Quay lại đăng nhập
            </Link>
          </div>
        </form>
      )}

      {step === "success" && (
        <div className="mt-8 space-y-5">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
            <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" />
            <p className="mt-3 font-semibold">Đặt lại mật khẩu thành công!</p>
            <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-300">
              Bạn có thể sử dụng mật khẩu mới để đăng nhập ngay bây giờ.
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href="/login">Đăng nhập ngay</Link>
          </Button>
        </div>
      )}
    </AuthFrame>
  );
}
