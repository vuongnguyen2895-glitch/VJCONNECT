"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Loader2, Mail } from "lucide-react";
import { forgotPasswordSchema } from "@/lib/validations";

interface FormValues {
  email: string;
}

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = handleSubmit(async (data) => {
    const parsed = forgotPasswordSchema.safeParse(data);
    if (!parsed.success) {
      setError("email", { message: parsed.error.issues[0]?.message });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Không thể gửi yêu cầu");
        return;
      }
      setSent(true);
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setSubmitting(false);
    }
  });

  if (sent) {
    return (
      <div className="card p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Kiểm tra email của bạn</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          Nếu email bạn nhập đã đăng ký tài khoản, chúng tôi đã gửi một liên kết đặt lại mật khẩu. Liên kết có hiệu
          lực trong 1 giờ.
        </p>
        <Link href="/login" className="btn-outline mt-6 inline-flex">
          Quay lại đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-8">
      <h1 className="text-2xl font-bold text-slate-900">Quên mật khẩu?</h1>
      <p className="mt-1.5 text-sm text-slate-500">Nhập email đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.</p>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="ban@email.com"
              className="input pl-10"
              {...register("email")}
            />
          </div>
          {errors.email && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email.message}</p>}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
          {submitting ? <Loader2 size={18} className="animate-spin" /> : "Gửi liên kết đặt lại mật khẩu"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Nhớ ra mật khẩu rồi?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
