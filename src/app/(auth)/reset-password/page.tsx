"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!token) {
    return (
      <div className="card p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Liên kết không hợp lệ</h1>
        <p className="mt-3 text-sm text-slate-500">
          Thiếu mã xác nhận. Vui lòng yêu cầu lại liên kết đặt lại mật khẩu.
        </p>
        <Link href="/forgot-password" className="btn-outline mt-6 inline-flex">
          Yêu cầu lại
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới tối thiểu 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Không thể đặt lại mật khẩu");
        return;
      }
      toast.success("Đã đặt lại mật khẩu, vui lòng đăng nhập lại");
      router.push("/login");
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card p-8">
      <h1 className="text-2xl font-bold text-slate-900">Đặt lại mật khẩu</h1>
      <p className="mt-1.5 text-sm text-slate-500">Nhập mật khẩu mới cho tài khoản của bạn.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="newPassword">
            Mật khẩu mới
          </label>
          <div className="relative">
            <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Tối thiểu 6 ký tự"
              className="input pl-10"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="confirmPassword">
            Nhập lại mật khẩu mới
          </label>
          <div className="relative">
            <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="input pl-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
          {submitting ? <Loader2 size={18} className="animate-spin" /> : "Đặt lại mật khẩu"}
        </button>
      </form>
    </div>
  );
}
