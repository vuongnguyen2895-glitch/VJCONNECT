"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Users } from "lucide-react";
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

function formatDob(dob: string | null): string {
  if (!dob) return "—";
  const trimmed = dob.trim();
  // Plain birth-year entries ("1990") aren't a real date — show as-is.
  if (/^\d{4}$/.test(trimmed)) return trimmed;
  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return trimmed;
  return formatDateVN(d);
}

export default function TenantDirectoryPage() {
  useAuth();
  const [rows, setRows] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Danh sách khách thuê</h1>
        <p className="mt-1 text-sm text-slate-500">
          Thông tin đầy đủ từng khách thuê: CCCD, ngày sinh, tiền phòng/cọc, thời hạn hợp đồng và trạng thái ở.
        </p>
      </div>

      <DashboardTabs />

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 size={28} className="animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Users size={22} />
          </span>
          <p className="text-sm font-medium text-slate-600">Chưa có khách thuê nào (hợp đồng đã ký).</p>
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
              {rows.map((row) => (
                <tr key={row.contractId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
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
                  <td className="px-4 py-3 text-slate-500">{row.endDate ? formatDateVN(row.endDate) : "—"}</td>
                  <td className="px-4 py-3">
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
