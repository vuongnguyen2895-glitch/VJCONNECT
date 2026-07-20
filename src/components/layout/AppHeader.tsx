"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Plus, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/brand/Logo";

export default function AppHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const showCreateCta = pathname !== "/contracts/new";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard">
          <Logo textClassName="hidden text-lg sm:inline" />
        </Link>

        <div className="flex items-center gap-3">
          {showCreateCta && (
            <Link href="/contracts/new" className="btn-primary text-sm">
              <Plus size={16} /> <span className="hidden sm:inline">Tạo hợp đồng</span>
            </Link>
          )}

          {user && (
            <Link
              href="/dashboard/settings"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700 hover:bg-brand-100"
              title={user.name}
              aria-label="Tài khoản"
            >
              {user.name.charAt(0).toUpperCase()}
            </Link>
          )}

          <Link
            href="/dashboard/settings"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Tài khoản"
            title="Tài khoản"
          >
            <Settings size={19} />
          </Link>

          <button
            type="button"
            onClick={logout}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Đăng xuất"
            title="Đăng xuất"
          >
            <LogOut size={19} />
          </button>
        </div>
      </div>
    </header>
  );
}
