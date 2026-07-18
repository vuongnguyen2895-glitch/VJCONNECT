"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { CheckCircle2, Clock, FileStack, Loader2, Receipt, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatVND } from "@/lib/contract-utils";
import DashboardTabs from "@/components/dashboard/DashboardTabs";

interface RoomItem {
  contractId: string;
  contractNo: string | null;
  roomName: string | null;
  buildingId: string | null;
  buildingName: string | null;
  tenantName: string | null;
  tenantPhone: string | null;
  rentAmount: string | null;
  currentMonthInvoice: { id: string; status: "PAID" | "UNPAID"; totalAmount: string } | null;
}

interface TenantsData {
  year: number;
  month: number;
  buildings: { id: string; name: string; rooms: RoomItem[] }[];
  unassigned: RoomItem[];
}

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

export default function TenantsPage() {
  useAuth();
  const [data, setData] = useState<TenantsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/tenants")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((d) => setData(d))
      .catch(() => toast.error("Không thể tải danh sách khách thuê"))
      .finally(() => setLoading(false));
  }, []);

  const groups = data ? [...data.buildings, ...(data.unassigned.length > 0 ? [{ id: "__unassigned__", name: "Chưa gán nhà", rooms: data.unassigned }] : [])] : [];
  const totalRooms = groups.reduce((sum, g) => sum + g.rooms.length, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Khách thuê & hoá đơn</h1>
        <p className="mt-1 text-sm text-slate-500">
          {data ? `${MONTH_NAMES[data.month - 1]}/${data.year}` : "Đang tải..."} · Danh sách phòng đang cho thuê và trạng thái phiếu tính tiền tháng này.
        </p>
      </div>

      <DashboardTabs />

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 size={28} className="animate-spin" />
        </div>
      ) : totalRooms === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Users size={22} />
          </span>
          <p className="text-sm font-medium text-slate-600">Chưa có phòng nào đang cho thuê (hợp đồng đã ký).</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.id} className="card">
              <p className="border-b border-slate-100 px-5 py-3 text-sm font-bold text-slate-900">
                {group.name} <span className="font-normal text-slate-400">· {group.rooms.length} phòng</span>
              </p>
              <div className="divide-y divide-slate-100">
                {group.rooms.map((room) => (
                  <div key={room.contractId} className="flex flex-wrap items-center gap-4 p-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <FileStack size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {room.roomName || room.contractNo || "Phòng"}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {room.tenantName ?? "Chưa có người thuê"}
                        {room.tenantPhone && ` · ${room.tenantPhone}`}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-slate-900">
                      {room.rentAmount ? formatVND(room.rentAmount) : "—"}
                    </p>

                    {room.currentMonthInvoice ? (
                      <Link
                        href={`/contracts/${room.contractId}/invoices`}
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                          room.currentMonthInvoice.status === "PAID"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {room.currentMonthInvoice.status === "PAID" ? (
                          <CheckCircle2 size={13} />
                        ) : (
                          <Clock size={13} />
                        )}
                        {room.currentMonthInvoice.status === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"} ·{" "}
                        {formatVND(room.currentMonthInvoice.totalAmount)}
                      </Link>
                    ) : (
                      <Link href={`/contracts/${room.contractId}/invoices`} className="btn-secondary shrink-0 text-xs">
                        <Receipt size={14} /> Lập phiếu tháng này
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
