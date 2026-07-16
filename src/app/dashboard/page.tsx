"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { CheckCircle2, Clock, FileStack, FileText, Loader2, Plus, Search, Timer } from "lucide-react";
import type { ContractStatus, PartyRole } from "@prisma/client";
import { useAuth } from "@/hooks/useAuth";
import { formatVND, formatDateVN, getStatusDisplay } from "@/lib/contract-utils";
import type { DashboardStats } from "@/types";

interface ContractListItem {
  id: string;
  contractNo: string | null;
  status: ContractStatus;
  title: string | null;
  rentAmount: string | null;
  updatedAt: string;
  template: { name: string; icon: string | null };
  parties: { name: string; role: PartyRole; signedAt: string | null }[];
}

interface ActivityItem {
  id: string;
  action: string;
  actorName: string | null;
  createdAt: string;
  contract: { contractNo: string | null; title: string | null };
}

const STATUS_TABS: { value: "ALL" | ContractStatus; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "DRAFT", label: "Bản nháp" },
  { value: "PENDING_LANDLORD", label: "Chờ ký" },
  { value: "SIGNED", label: "Đã ký" },
  { value: "EXPIRED", label: "Hết hạn" },
];

const ACTIVITY_LABELS: Record<string, string> = {
  created: "đã tạo hợp đồng",
  updated: "đã cập nhật hợp đồng",
  sent_for_signing: "đã gửi ký",
  signed_by_landlord: "bên A đã ký",
  signed_by_tenant: "bên B đã ký",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [listLoading, setListLoading] = useState(true);
  const [tab, setTab] = useState<"ALL" | ContractStatus>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setStats(data.stats);
        setActivities(data.activities);
      })
      .catch(() => toast.error("Không thể tải thống kê"))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    setListLoading(true);
    const params = new URLSearchParams();
    if (tab !== "ALL") params.set("status", tab);
    if (search.trim()) params.set("q", search.trim());

    const handle = setTimeout(() => {
      fetch(`/api/contracts?${params.toString()}`)
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => setContracts(data.contracts))
        .catch(() => toast.error("Không thể tải danh sách hợp đồng"))
        .finally(() => setListLoading(false));
    }, 300);

    return () => clearTimeout(handle);
  }, [tab, search]);

  const statCards = [
    { label: "Tổng số hợp đồng", value: stats?.total, icon: FileStack, color: "bg-brand-50 text-brand-600" },
    { label: "Đã ký", value: stats?.signed, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
    { label: "Chờ ký", value: stats?.pending, icon: Clock, color: "bg-amber-50 text-amber-600" },
    { label: "Bản nháp", value: stats?.draft, icon: FileText, color: "bg-slate-100 text-slate-600" },
    { label: "Sắp hết hạn", value: stats?.expiringSoon, icon: Timer, color: "bg-red-50 text-red-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Chào {user?.name ?? "bạn"} 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Đây là tổng quan hợp đồng của bạn.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {statCards.map((card) => (
          <div key={card.label} className="card p-5">
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}>
              <card.icon size={19} />
            </span>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">
              {statsLoading ? <Loader2 size={20} className="animate-spin text-slate-300" /> : card.value ?? 0}
            </p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {STATUS_TABS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTab(t.value)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    tab === t.value ? "bg-brand-50 text-brand-700" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, số hợp đồng..."
                className="input py-2 pl-9 text-sm sm:w-56"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {listLoading ? (
              <div className="flex items-center justify-center py-16 text-slate-400">
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : contracts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <FileStack size={22} />
                </span>
                <p className="text-sm font-medium text-slate-600">Chưa có hợp đồng nào</p>
                <Link href="/contracts/new" className="btn-primary text-sm">
                  <Plus size={16} /> Tạo hợp đồng đầu tiên
                </Link>
              </div>
            ) : (
              contracts.map((contract) => {
                const status = getStatusDisplay(contract.status);
                return (
                  <Link
                    key={contract.id}
                    href={`/contracts/${contract.id}`}
                    className="flex items-center gap-4 p-5 transition-colors hover:bg-slate-50"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xl">
                      {contract.template.icon ?? "📄"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {contract.title ?? contract.template.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {contract.contractNo} · {contract.parties.map((p) => p.name).join(" — ")}
                      </p>
                    </div>
                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="text-sm font-semibold text-slate-900">
                        {contract.rentAmount ? formatVND(contract.rentAmount) : "—"}
                      </p>
                      <p className="text-xs text-slate-400">{formatDateVN(contract.updatedAt)}</p>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{ color: status.color, backgroundColor: status.bg }}
                    >
                      {status.label}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-bold text-slate-900">Hoạt động gần đây</h2>
          <div className="mt-4 space-y-4">
            {activities.length === 0 && !statsLoading && <p className="text-sm text-slate-400">Chưa có hoạt động nào.</p>}
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                <p className="text-slate-600">
                  <span className="font-semibold text-slate-900">{activity.actorName ?? "Hệ thống"}</span>{" "}
                  {ACTIVITY_LABELS[activity.action] ?? activity.action}{" "}
                  <span className="text-slate-400">({activity.contract.contractNo ?? activity.contract.title})</span>
                  <br />
                  <span className="text-xs text-slate-400">{formatDateVN(activity.createdAt)}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
