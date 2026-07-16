"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Loader2, Lock, Mail, Phone, User as UserIcon } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations";

type RegisterFormValues = RegisterInput & { confirmPassword: string };

export default function RegisterPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>();

  const onSubmit = handleSubmit(async (data) => {
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        setError(issue.path[0] as keyof RegisterFormValues, { message: issue.message });
      });
      return;
    }
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", { message: "Mật khẩu xác nhận không khớp" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Đăng ký thất bại");
        return;
      }
      toast.success(`Chào mừng đến với VJConnect, ${result.user.name}!`);
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="card p-8">
      <h1 className="text-2xl font-bold text-slate-900">Tạo tài khoản</h1>
      <p className="mt-1.5 text-sm text-slate-500">Bắt đầu tạo hợp đồng miễn phí trong 5 phút</p>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="name">
            Họ và tên
          </label>
          <div className="relative">
            <UserIcon size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input id="name" placeholder="Nguyễn Văn A" className="input pl-10" {...register("name")} />
          </div>
          {errors.name && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.name.message}</p>}
        </div>

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

        <div>
          <label className="label" htmlFor="phone">
            Số điện thoại <span className="font-normal text-slate-400">(không bắt buộc)</span>
          </label>
          <div className="relative">
            <Phone size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input id="phone" type="tel" placeholder="0912345678" className="input pl-10" {...register("phone")} />
          </div>
          {errors.phone && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="password">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Tối thiểu 6 ký tự"
              className="input pl-10"
              {...register("password")}
            />
          </div>
          {errors.password && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.password.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="confirmPassword">
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu"
              className="input pl-10"
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs font-medium text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
          {submitting ? <Loader2 size={18} className="animate-spin" /> : "Tạo tài khoản miễn phí"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
