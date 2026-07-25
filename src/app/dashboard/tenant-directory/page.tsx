"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Cake, Loader2, Search, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatDateVN, formatVND } from "@/lib/contract-utils";
import DashboardTabs from "@/components/dashboard/DashboardTabs";

interface TenantRow {
  contractId: string;
  roomName: string | null;
  buildingName: string | null;
  tenantName: string | null;
  cccd: string | null;
  dob: string | null;
  phone: string | null;
  rentAmount: string | null;
  deposit: string | null;
  signedAt: string | null;
  endDate: string | null;
  status: "SIGNED" | "TERMINATED";
}

const BIRTHDAY_WINDOW_DAYS = 30;
const EXPIRING_WINDOW_DAYS = 60;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function formatDob(dob: string | null): string {
  if (!dob) return "—";
  const trimmed = dob.trim();
  // Plain birth-year entries ("1990") aren't a real date — show as-is.
  if (/^\d{4}$/.test(trimmed)) return trimmed;
  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return trimmed;
  return formatDateVN(d);
}

/** Full dd/mm/yyyy-style dob only — a bare birth year has no month/day to celebrate. */
function parseDobMonthDay(dob: string | null): { month: number; day: number } | null {
  if (!dob || /^\d{4}$/.test(dob.trim())) return null;
  const d = new Date(dob.trim());
  if (isNaN(d.getTime())) return null;
  return { month: d.getUTCMonth(), day: d.getUTCDate() };
}

function daysUntilNextBirthday(month: number, day: number): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let next = new Date(today.getFullYear(), month, day);
  next.setHours(0, 0, 0, 0);
  if (next.getTime() < today.getTime()) {
    next = new Date(today.getFullYear() + 1, month, day);
  }
  return Math.round((next.getTime() - today.getTime()) / MS_PER_DAY);
}

function daysUntilEnd(endDate: string | null): number | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  if (isNaN(end.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / MS_PER_DAY);
}

export default function TenantDirectoryPage() {
  useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SIGNED" | "TERMINATED">("SIGNED");
  const [buildingFilter, setBuildingFilter] = useState("ALL");

  useEffect(() => {
    loadRows();
  }, []);

  function loadRows() {
    setLoading(true);
    fetch("/api/dashboard/tenant-directory")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setRows(data.rows))
      .catch(() => toast.error("Không thể tải danh sách khách thuê"))
      .finally(() => setLoading(false));
  }

  async function handleStatusChange(contractId: string, status: "SIGNED" | "TERMINATED") {
    setUpdatingId(contractId);
    try {
      const res = await fetch(`/api/contracts/${contractId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Không thể cập nhật trạng thái");
        return;
      }
      setRows((prev) => prev.map((r) => (r.contractId === contractId ? { ...r, status } : r)));
      toast.success("Đã cập nhật trạng thái");
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setUpdatingId(null);
    }
  }

  const buildingOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.buildingName).filter((n): n is string => Boolean(n)))).sort(),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (buildingFilter !== "ALL" && r.buildingName !== buildingFilter) return false;
      if (q) {
        const haystack = [r.tenantName, r.cccd, r.roomName, r.buildingName, r.phone].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [rows, search, statusFilter, buildingFilter]);

  const upcomingBirthdays = useMemo(() => {
    return rows
      .filter((r) => r.status === "SIGNED")
      .map((r) => {
        const parts = parseDobMonthDay(r.dob);
        if (!parts) return null;
        return { row: r, daysUntil: daysUntilNextBirthday(parts.month, parts.day) };
      })
      .filter((v): v is { row: TenantRow; daysUntil: number } => v !== null && v.daysUntil <= BIRTHDAY_WINDOW_DAYS)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [rows]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 size={28} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Danh sách khách thuê</h1>
        <p className="mt-1 text-sm text-slate-500">
          Thông tin đầy đủ từng khách thuê: CCCD, ngày sinh, tiền phòng/cọc, thời hạn hợp đồng và trạng thái ở.
        </p>
      </div>

      <DashboardTabs />

      {upcomingBirthdays.length > 0 && (
        <div className="card flex flex-col gap-3 border-l-4 border-l-pink-400 p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Cake size={17} className="text-pink-500" /> Sắp đến sinh nhật khách thuê
          </div>
          <div className="flex flex-wrap gap-2">
            {upcomingBirthdays.map(({ row, daysUntil }) => (
              <span
                key={row.contractId}
                className="inline-flex items-center gap-1.5 rounded-full bg-pink-50 px-3 py-1.5 text-xs font-semibold text-pink-700"
              >
                {row.tenantName}
                <span className="font-normal text-pink-500">
                  {daysUntil === 0 ? "hôm nay 🎉" : `còn ${daysUntil} ngày`}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, CCCD, mã phòng, SĐT..."
            className="input pl-10"
          />
        </div>
        <select value={buildingFilter} onChange={(e) => setBuildingFilter(e.target.value)} className="input sm:w-48">
          <option value="ALL">Tất cả nhà</option>
          {buildingOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "ALL" | "SIGNED" | "TERMINATED")}
          className="input sm:w-44"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="SIGNED">Còn ở</option>
          <option value="TERMINATED">Không còn ở</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Users size={22} />
          </span>
          <p className="text-sm font-medium text-slate-600">Chưa có khách thuê nào (hợp đồng đã ký).</p>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-16 text-center">
          <p className="text-sm font-medium text-slate-600">Không tìm thấy khách thuê phù hợp.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-2">
          <table className="w-full min-w-[1100px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">Mã căn hộ</th>
                <th className="px-4 py-3">Họ và tên</th>
                <th className="px-4 py-3">CCCD</th>
                <th className="px-4 py-3">Ngày sinh</th>
                <th className="px-4 py-3 text-right">Tiền phòng</th>
                <th className="px-4 py-3 text-right">Tiền cọc</th>
                <th className="px-4 py-3">Ngày ký HĐ</th>
                <th className="px-4 py-3">Ngày hết HĐ</th>
                <th className="px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                const remaining = row.status === "SIGNED" ? daysUntilEnd(row.endDate) : null;
                const expiringSoon = remaining !== null && remaining >= 0 && remaining <= EXPIRING_WINDOW_DAYS;
                const overdue = remaining !== null && remaining < 0;
                return (
                  <tr
                    key={row.contractId}
                    onClick={() => router.push(`/contracts/${row.contractId}`)}
                    className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {row.roomName || "—"}
                      {row.buildingName && <span className="block text-xs font-normal text-slate-400">{row.buildingName}</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.tenantName || "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{row.cccd || "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDob(row.dob)}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {row.rentAmount ? formatVND(row.rentAmount) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">{row.deposit ? formatVND(row.deposit) : "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{row.signedAt ? formatDateVN(row.signedAt) : "—"}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {row.endDate ? formatDateVN(row.endDate) : "—"}
                      {expiringSoon && (
                        <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                          Sắp hết hạn
                        </span>
                      )}
                      {overdue && (
                        <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                          Đã hết hạn
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={row.status}
                        disabled={updatingId === row.contractId}
                        onChange={(e) => handleStatusChange(row.contractId, e.target.value as "SIGNED" | "TERMINATED")}
                        className={`rounded-lg border-0 px-2.5 py-1.5 text-xs font-semibold outline-none ${
                          row.status === "SIGNED" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <option value="SIGNED">Còn ở</option>
                        <option value="TERMINATED">Không còn ở</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
