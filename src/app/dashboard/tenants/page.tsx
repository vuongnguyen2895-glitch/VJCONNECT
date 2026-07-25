"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Check, ChevronLeft, ChevronRight, Loader2, Search, Users, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatDateVN, formatVND } from "@/lib/contract-utils";
import DashboardTabs from "@/components/dashboard/DashboardTabs";

interface InvoiceCell {
  id: string;
  year: number;
  month: number;
  status: "PAID" | "UNPAID";
  totalAmount: string;
}

interface TenantRow {
  contractId: string;
  roomName: string | null;
  buildingName: string | null;
  tenantName: string | null;
  rentAmount: string | null;
  signedAt: string | null;
  startDate: string;
  endDate: string;
  status: "SIGNED" | "TERMINATED";
  invoices: InvoiceCell[];
}

interface MonthKey {
  year: number;
  month: number;
}

function ym(year: number, month: number): number {
  return year * 12 + month;
}

function monthRange(fromYm: number, toYm: number): MonthKey[] {
  const out: MonthKey[] = [];
  for (let v = fromYm; v <= toYm; v++) {
    out.push({ year: Math.floor((v - 1) / 12), month: ((v - 1) % 12) + 1 });
  }
  return out;
}

const WINDOW_SIZE = 6;

function currentYm(): number {
  const now = new Date();
  return ym(now.getFullYear(), now.getMonth() + 1);
}

export default function TenantsInvoicesPage() {
  useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("ALL");
  const [windowStart, setWindowStart] = useState(() => currentYm() - 1);

  useEffect(() => {
    loadRows();
  }, []);

  function loadRows() {
    setLoading(true);
    fetch("/api/dashboard/tenant-invoices")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setRows(data.rows))
      .catch(() => toast.error("Không thể tải dữ liệu khách thuê & hoá đơn"))
      .finally(() => setLoading(false));
  }

  const buildingOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.buildingName).filter((n): n is string => Boolean(n)))).sort(),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (buildingFilter !== "ALL" && r.buildingName !== buildingFilter) return false;
      if (q) {
        const haystack = [r.tenantName, r.roomName, r.buildingName].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [rows, search, buildingFilter]);

  const dataRange = useMemo(() => {
    if (rows.length === 0) return null;
    const starts = rows.map((r) => {
      const d = new Date(r.startDate);
      return ym(d.getFullYear(), d.getMonth() + 1);
    });
    const ends = rows.map((r) => {
      const d = new Date(r.endDate);
      return ym(d.getFullYear(), d.getMonth() + 1);
    });
    return { min: Math.min(...starts), max: Math.max(...ends) };
  }, [rows]);

  const months = useMemo(() => {
    if (!dataRange) return [];
    const from = Math.max(windowStart, dataRange.min);
    const to = Math.min(windowStart + WINDOW_SIZE - 1, dataRange.max);
    if (from > to) return [];
    return monthRange(from, to);
  }, [dataRange, windowStart]);

  const canGoEarlier = dataRange ? windowStart > dataRange.min : false;
  const canGoLater = dataRange ? windowStart + WINDOW_SIZE - 1 < dataRange.max : false;

  async function handleToggle(row: TenantRow, month: MonthKey, current: InvoiceCell | undefined) {
    const key = `${row.contractId}-${month.year}-${month.month}`;
    const nextStatus: "PAID" | "UNPAID" = !current || current.status === "UNPAID" ? "PAID" : "UNPAID";

    setTogglingKey(key);
    try {
      const res = await fetch(`/api/contracts/${row.contractId}/invoices/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: month.year, month: month.month, status: nextStatus }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Không thể cập nhật");
        return;
      }
      setRows((prev) =>
        prev.map((r) => {
          if (r.contractId !== row.contractId) return r;
          const others = r.invoices.filter((inv) => !(inv.year === month.year && inv.month === month.month));
          return { ...r, invoices: [...others, result.invoice] };
        }),
      );
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setTogglingKey(null);
    }
  }

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
        <h1 className="text-2xl font-bold text-slate-900">Khách thuê & hoá đơn</h1>
        <p className="mt-1 text-sm text-slate-500">
          Theo dõi thanh toán quanh tháng hiện tại — bấm vào ô tháng để đánh dấu đã/chưa thanh toán, hệ thống sẽ tự
          tạo phiếu tính tiền tương ứng nếu chưa có. Khách đã hết hạn hợp đồng sẽ tự động ẩn khỏi danh sách này.
        </p>
      </div>

      <DashboardTabs />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên khách, mã phòng..."
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
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setWindowStart((v) => v - 1)}
            disabled={!canGoEarlier}
            title="Xem tháng trước đó"
            className="btn-secondary h-10 w-10 justify-center p-0 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setWindowStart(currentYm() - 1)}
            className="btn-secondary h-10 text-sm"
          >
            Tháng này
          </button>
          <button
            type="button"
            onClick={() => setWindowStart((v) => v + 1)}
            disabled={!canGoLater}
            title="Xem tháng sau"
            className="btn-secondary h-10 w-10 justify-center p-0 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
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
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="sticky left-0 z-10 bg-white px-4 py-3">Mã căn hộ</th>
                <th className="sticky left-[110px] z-10 bg-white px-4 py-3">Họ và tên</th>
                <th className="px-4 py-3 text-right">Tiền phòng</th>
                <th className="px-4 py-3">Ngày ký HĐ</th>
                <th className="px-4 py-3">Ngày hết HĐ</th>
                {months.map((m) => (
                  <th key={`${m.year}-${m.month}`} className="px-2 py-3 text-center">
                    T{m.month}/{String(m.year).slice(2)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                const rowStartYm = (() => {
                  const d = new Date(row.startDate);
                  return ym(d.getFullYear(), d.getMonth() + 1);
                })();
                const rowEndYm = (() => {
                  const d = new Date(row.endDate);
                  return ym(d.getFullYear(), d.getMonth() + 1);
                })();
                return (
                  <tr key={row.contractId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td
                      onClick={() => router.push(`/contracts/${row.contractId}`)}
                      className="sticky left-0 z-10 cursor-pointer bg-white px-4 py-3 font-medium text-slate-900"
                    >
                      {row.roomName || "—"}
                      {row.buildingName && <span className="block text-xs font-normal text-slate-400">{row.buildingName}</span>}
                    </td>
                    <td
                      onClick={() => router.push(`/contracts/${row.contractId}`)}
                      className="sticky left-[110px] z-10 cursor-pointer bg-white px-4 py-3 text-slate-700"
                    >
                      {row.tenantName || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {row.rentAmount ? formatVND(row.rentAmount) : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{row.signedAt ? formatDateVN(row.signedAt) : "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDateVN(row.endDate)}</td>
                    {months.map((m) => {
                      const monthYm = ym(m.year, m.month);
                      const inRange = monthYm >= rowStartYm && monthYm <= rowEndYm;
                      if (!inRange) {
                        return <td key={`${m.year}-${m.month}`} className="bg-slate-50/50 px-2 py-3" />;
                      }
                      const invoice = row.invoices.find((inv) => inv.year === m.year && inv.month === m.month);
                      const key = `${row.contractId}-${m.year}-${m.month}`;
                      const paid = invoice?.status === "PAID";
                      return (
                        <td key={key} className="px-2 py-3 text-center">
                          <button
                            type="button"
                            disabled={togglingKey === key}
                            onClick={() => handleToggle(row, m, invoice)}
                            title={paid ? "Đã thanh toán — bấm để bỏ đánh dấu" : invoice ? "Chưa thanh toán — bấm để đánh dấu đã thu" : "Chưa lập phiếu — bấm để đánh dấu đã thu"}
                            className={`flex h-7 w-7 items-center justify-center rounded-full mx-auto transition-colors ${
                              paid
                                ? "bg-emerald-500 text-white"
                                : invoice
                                  ? "bg-amber-100 text-amber-600"
                                  : "border border-dashed border-slate-300 text-slate-300 hover:border-slate-400 hover:text-slate-400"
                            }`}
                          >
                            {paid ? <Check size={14} /> : invoice ? <X size={14} /> : null}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check size={11} />
          </span>
          Đã thanh toán
        </span>
        <span className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <X size={11} />
          </span>
          Chưa thanh toán
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-5 w-5 rounded-full border border-dashed border-slate-300" />
          Chưa lập phiếu
        </span>
      </div>
    </div>
  );
}
