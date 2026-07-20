"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Save, KeyRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AccountProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  cccd: string;
}

export default function SettingsPage() {
  useAuth();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetch("/api/account")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) =>
        setProfile({
          name: data.user.name ?? "",
          email: data.user.email ?? "",
          phone: data.user.phone ?? "",
          address: data.user.address ?? "",
          cccd: data.user.cccd ?? "",
        }),
      )
      .catch(() => toast.error("Không thể tải thông tin tài khoản"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveProfile() {
    if (!profile) return;
    if (!profile.name.trim()) {
      toast.error("Vui lòng nhập họ tên");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Không thể lưu thông tin");
        return;
      }
      toast.success("Đã lưu thông tin tài khoản");
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword) {
      toast.error("Vui lòng nhập đầy đủ mật khẩu");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới nhập lại không khớp");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Không thể đổi mật khẩu");
        return;
      }
      toast.success("Đã đổi mật khẩu");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 size={28} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tài khoản</h1>
        <p className="mt-1 text-sm text-slate-500">Quản lý thông tin cá nhân và mật khẩu đăng nhập.</p>
      </div>

      <div className="card p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900">Thông tin cá nhân</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Họ và tên</label>
            <input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Số điện thoại</label>
            <input
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Số CCCD/CMND</label>
            <input
              value={profile.cccd}
              onChange={(e) => setProfile({ ...profile, cccd: e.target.value })}
              className="input"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Địa chỉ</label>
            <input
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="input"
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Thông tin này sẽ được dùng để tự động điền vào phần &quot;Bên cho thuê&quot; mỗi khi bạn tạo hợp đồng mới.
        </p>
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={handleSaveProfile} disabled={saving} className="btn-primary text-sm">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Lưu thay đổi
          </button>
        </div>
      </div>

      <div className="card p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900">Đổi mật khẩu</h2>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <div>
            <label className="label">Mật khẩu hiện tại</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>
          <div>
            <label className="label">Nhập lại mật khẩu mới</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="btn-primary text-sm"
          >
            {changingPassword ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />} Đổi mật khẩu
          </button>
        </div>
      </div>
    </div>
  );
}
