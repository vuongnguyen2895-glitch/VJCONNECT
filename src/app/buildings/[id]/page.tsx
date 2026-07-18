"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatVND, getStatusDisplay } from "@/lib/contract-utils";
import type { ContractStatus } from "@prisma/client";

interface BuildingDetail {
  id: string;
  name: string;
  address: string | null;
  electricityPrice: string | null;
  waterPrice: string | null;
  contracts: {
    id: string;
    contractNo: string | null;
    roomName: string | null;
    status: ContractStatus;
    rentAmount: string | null;
    parties: { name: string; role: "LANDLORD" | "TENANT" }[];
  }[];
}

export default function BuildingDetailPage() {
  useAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [building, setBuilding] = useState<BuildingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [electricityPrice, setElectricityPrice] = useState("");
  const [waterPrice, setWaterPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/buildings/${params.id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setBuilding(data.building);
        setName(data.building.name);
        setAddress(data.building.address ?? "");
        setElectricityPrice(data.building.electricityPrice ?? "");
        setWaterPrice(data.building.waterPrice ?? "");
      })
      .catch(() => toast.error("Không thể tải thông tin nhà/căn hộ"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên nhà/căn hộ");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/buildings/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, electricityPrice, waterPrice }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Không thể lưu");
        return;
      }
      toast.success("Đã lưu thay đổi");
      setBuilding((prev) => (prev ? { ...prev, ...result.building } : prev));
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!building) return;
    if (building.contracts.length > 0) {
      toast.error("Không thể xóa nhà đang có phòng/hợp đồng liên kết");
      return;
    }
    if (!window.confirm("Xóa nhà/căn hộ này? Hành động không thể hoàn tác.")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/buildings/${params.id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Không thể xóa");
        return;
      }
      toast.success("Đã xóa nhà/căn hộ");
      router.push("/buildings");
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 size={28} className="animate-spin" />
      </div>
    );
  }

  if (!building) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm font-medium text-slate-600">Không tìm thấy nhà/căn hộ này.</p>
        <Link href="/buildings" className="btn-outline mt-4 inline-flex">
          <ArrowLeft size={16} /> Về danh sách nhà
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/buildings" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft size={15} /> Về danh sách nhà
      </Link>

      <div className="card p-6 sm:p-8">
        <h1 className="text-lg font-bold text-slate-900">Thông tin nhà/căn hộ</h1>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Tên nhà/căn hộ</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">
              Địa chỉ <span className="font-normal text-slate-400">(không bắt buộc)</span>
            </label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">
              Đơn giá điện (đ/kWh) <span className="font-normal text-slate-400">(không bắt buộc)</span>
            </label>
            <input value={electricityPrice} onChange={(e) => setElectricityPrice(e.target.value)} inputMode="numeric" className="input" />
          </div>
          <div>
            <label className="label">
              Đơn giá nước (đ/m³) <span className="font-normal text-slate-400">(không bắt buộc)</span>
            </label>
            <input value={waterPrice} onChange={(e) => setWaterPrice(e.target.value)} inputMode="numeric" className="input" />
          </div>
        </div>
        <div className="mt-4 flex justify-between">
          <button type="button" onClick={handleDelete} disabled={deleting} className="btn-danger text-sm">
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Xóa nhà
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="btn-primary text-sm">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Lưu thay đổi
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-bold text-slate-900">Phòng / hợp đồng ({building.contracts.length})</h2>
        {building.contracts.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">Chưa có phòng nào thuộc nhà này.</p>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {building.contracts.map((c) => {
              const status = getStatusDisplay(c.status);
              const tenant = c.parties.find((p) => p.role === "TENANT");
              return (
                <Link
                  key={c.id}
                  href={`/contracts/${c.id}`}
                  className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{c.roomName || c.contractNo || "Phòng"}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{tenant?.name ?? "Chưa có người thuê"}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-semibold text-slate-900">
                      {c.rentAmount ? formatVND(c.rentAmount) : "—"}
                    </span>
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{ color: status.color, backgroundColor: status.bg }}
                    >
                      {status.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
