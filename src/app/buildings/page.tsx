"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Building2, DoorOpen, Loader2, Plus, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatVND } from "@/lib/contract-utils";

interface BuildingListItem {
  id: string;
  name: string;
  address: string | null;
  electricityPrice: string | null;
  waterPrice: string | null;
  _count: { contracts: number };
}

export default function BuildingsPage() {
  useAuth();
  const [buildings, setBuildings] = useState<BuildingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  function refetch() {
    setLoading(true);
    return fetch("/api/buildings")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setBuildings(data.buildings))
      .catch(() => toast.error("Không thể tải danh sách nhà/căn hộ"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    refetch();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý nhà/căn hộ</h1>
          <p className="mt-1 text-sm text-slate-500">Nhóm các phòng (hợp đồng) theo từng nhà để lập phiếu tính tiền.</p>
        </div>
        <button type="button" onClick={() => setShowForm(true)} className="btn-primary text-sm">
          <Plus size={16} /> Thêm nhà
        </button>
      </div>

      {showForm && <BuildingForm onClose={() => setShowForm(false)} onSaved={refetch} />}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 size={28} className="animate-spin" />
        </div>
      ) : buildings.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Building2 size={22} />
          </span>
          <p className="text-sm font-medium text-slate-600">Chưa có nhà/căn hộ nào</p>
          <button type="button" onClick={() => setShowForm(true)} className="btn-primary text-sm">
            <Plus size={16} /> Thêm nhà đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {buildings.map((b) => (
            <Link key={b.id} href={`/buildings/${b.id}`} className="card p-5 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Building2 size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">{b.name}</p>
                  <p className="truncate text-xs text-slate-500">{b.address || "Chưa có địa chỉ"}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <DoorOpen size={13} /> {b._count.contracts} phòng
                </span>
                <span>
                  {b.electricityPrice ? `${formatVND(b.electricityPrice)}/kWh` : "Chưa đặt giá điện"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function BuildingForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [electricityPrice, setElectricityPrice] = useState("");
  const [waterPrice, setWaterPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên nhà/căn hộ");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/buildings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, electricityPrice, waterPrice }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Không thể tạo nhà/căn hộ");
        return;
      }
      toast.success("Đã thêm nhà/căn hộ");
      onSaved();
      onClose();
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">Thêm nhà/căn hộ mới</h2>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={18} />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Tên nhà/căn hộ</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhà số 12 Lê Lợi" className="input" />
        </div>
        <div>
          <label className="label">
            Địa chỉ <span className="font-normal text-slate-400">(không bắt buộc)</span>
          </label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Số nhà, đường..." className="input" />
        </div>
        <div>
          <label className="label">
            Đơn giá điện (đ/kWh) <span className="font-normal text-slate-400">(không bắt buộc)</span>
          </label>
          <input
            value={electricityPrice}
            onChange={(e) => setElectricityPrice(e.target.value)}
            placeholder="3500"
            inputMode="numeric"
            className="input"
          />
        </div>
        <div>
          <label className="label">
            Đơn giá nước (đ/m³) <span className="font-normal text-slate-400">(không bắt buộc)</span>
          </label>
          <input
            value={waterPrice}
            onChange={(e) => setWaterPrice(e.target.value)}
            placeholder="15000"
            inputMode="numeric"
            className="input"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-secondary text-sm">
          Hủy
        </button>
        <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-primary text-sm">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : "Lưu"}
        </button>
      </div>
    </div>
  );
}
