"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2 } from "lucide-react";

const TABS = [
  { href: "/dashboard", label: "Hợp đồng" },
  { href: "/dashboard/tenants", label: "Khách thuê & hoá đơn" },
  { href: "/dashboard/tenant-directory", label: "Danh sách khách thuê" },
];

export default function DashboardTabs() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
      <div className="flex gap-1">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${
                active ? "border-brand-500 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      <Link
        href="/buildings"
        className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <Building2 size={15} /> Quản lý nhà
      </Link>
    </div>
  );
}
