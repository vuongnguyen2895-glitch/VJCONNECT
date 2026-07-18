"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, X } from "lucide-react";
import { formatVND } from "@/lib/contract-utils";
import type { CostMethod } from "@/types";

interface InvoiceFormProps {
  contractId: string;
  defaultYear: number;
  defaultMonth: number;
  rentAmountDefault: string;
  costElectricity: CostMethod;
  costWater: CostMethod;
  electricityUnitPriceDefault: string;
  waterUnitPriceDefault: string;
  electricityOldReadingDefault: string;
  waterOldReadingDefault: string;
  onCreated: () => void;
  onCancel: () => void;
}

function num(value: string): number {
  const n = parseFloat(value);
  return isNaN(n) ? 0 : n;
}

export default function InvoiceForm({
  contractId,
  defaultYear,
  defaultMonth,
  rentAmountDefault,
  costElectricity,
  costWater,
  electricityUnitPriceDefault,
  waterUnitPriceDefault,
  electricityOldReadingDefault,
  waterOldReadingDefault,
  onCreated,
  onCancel,
}: InvoiceFormProps) {
  const [period, setPeriod] = useState(`${defaultYear}-${String(defaultMonth).padStart(2, "0")}`);
  const [rentAmount, setRentAmount] = useState(rentAmountDefault);

  const [electricityOldReading, setElectricityOldReading] = useState(electricityOldReadingDefault);
  const [electricityNewReading, setElectricityNewReading] = useState("");
  const [electricityUnitPrice, setElectricityUnitPrice] = useState(electricityUnitPriceDefault);
  const [electricityFixedAmount, setElectricityFixedAmount] = useState("0");

  const [waterOldReading, setWaterOldReading] = useState(waterOldReadingDefault);
  const [waterNewReading, setWaterNewReading] = useState("");
  const [waterUnitPrice, setWaterUnitPrice] = useState(waterUnitPriceDefault);
  const [waterFixedAmount, setWaterFixedAmount] = useState("0");

  const [internetAmount, setInternetAmount] = useState("0");
  const [serviceFeeAmount, setServiceFeeAmount] = useState("0");
  const [otherAmount, setOtherAmount] = useState("");
  const [otherNote, setOtherNote] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const electricityAmount = useMemo(() => {
    if (costElectricity === "included") return 0;
    if (costElectricity === "tenant") {
      return Math.max(0, num(electricityNewReading) - num(electricityOldReading)) * num(electricityUnitPrice);
    }
    return num(electricityFixedAmount);
  }, [costElectricity, electricityOldReading, electricityNewReading, electricityUnitPrice, electricityFixedAmount]);

  const waterAmount = useMemo(() => {
    if (costWater === "included") return 0;
    if (costWater === "tenant") {
      return Math.max(0, num(waterNewReading) - num(waterOldReading)) * num(waterUnitPrice);
    }
    return num(waterFixedAmount);
  }, [costWater, waterOldReading, waterNewReading, waterUnitPrice, waterFixedAmount]);

  const total = num(rentAmount) + electricityAmount + waterAmount + num(internetAmount) + num(serviceFeeAmount) + num(otherAmount);

  async function handleSubmit() {
    const [yearStr, monthStr] = period.split("-");
    if (!yearStr || !monthStr) {
      toast.error("Vui lòng chọn tháng lập phiếu");
      return;
    }
    if (!rentAmount) {
      toast.error("Vui lòng nhập tiền thuê");
      return;
    }
    if (costElectricity === "tenant" && (!electricityNewReading || num(electricityNewReading) < num(electricityOldReading))) {
      toast.error("Chỉ số điện mới không hợp lệ");
      return;
    }
    if (costWater === "tenant" && (!waterNewReading || num(waterNewReading) < num(waterOldReading))) {
      toast.error("Chỉ số nước mới không hợp lệ");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/contracts/${contractId}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: parseInt(yearStr),
          month: parseInt(monthStr),
          rentAmount,
          electricityOldReading: costElectricity === "tenant" ? electricityOldReading : undefined,
          electricityNewReading: costElectricity === "tenant" ? electricityNewReading : undefined,
          electricityUnitPrice: costElectricity === "tenant" ? electricityUnitPrice : undefined,
          electricityAmount: String(electricityAmount),
          waterOldReading: costWater === "tenant" ? waterOldReading : undefined,
          waterNewReading: costWater === "tenant" ? waterNewReading : undefined,
          waterUnitPrice: costWater === "tenant" ? waterUnitPrice : undefined,
          waterAmount: String(waterAmount),
          internetAmount,
          serviceFeeAmount,
          otherAmount: otherAmount || "0",
          otherNote,
          note,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Không thể lập phiếu");
        return;
      }
      toast.success("Đã lập phiếu tính tiền");
      onCreated();
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setSubmitting(false);
    }
  }

  const COST_LABELS: Record<CostMethod, string> = {
    tenant: "Theo chỉ số",
    included: "Đã bao gồm trong giá thuê",
    fixed: "Khoán cố định",
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">Lập phiếu tính tiền</h2>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X size={18} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Tháng lập phiếu</label>
          <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Tiền thuê nhà (đ)</label>
          <input value={rentAmount} onChange={(e) => setRentAmount(e.target.value)} inputMode="numeric" className="input" />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-700">Tiền điện — {COST_LABELS[costElectricity]}</p>
        {costElectricity === "tenant" && (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Chỉ số cũ</label>
              <input value={electricityOldReading} onChange={(e) => setElectricityOldReading(e.target.value)} inputMode="decimal" className="input" />
            </div>
            <div>
              <label className="label">Chỉ số mới</label>
              <input value={electricityNewReading} onChange={(e) => setElectricityNewReading(e.target.value)} inputMode="decimal" className="input" />
            </div>
            <div>
              <label className="label">Đơn giá (đ/kWh)</label>
              <input value={electricityUnitPrice} onChange={(e) => setElectricityUnitPrice(e.target.value)} inputMode="numeric" className="input" />
            </div>
          </div>
        )}
        {costElectricity === "fixed" && (
          <div className="mt-3">
            <label className="label">Số tiền khoán (đ)</label>
            <input value={electricityFixedAmount} onChange={(e) => setElectricityFixedAmount(e.target.value)} inputMode="numeric" className="input max-w-xs" />
          </div>
        )}
        <p className="mt-3 text-sm font-semibold text-brand-700">Thành tiền: {formatVND(electricityAmount)}</p>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-700">Tiền nước — {COST_LABELS[costWater]}</p>
        {costWater === "tenant" && (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Chỉ số cũ</label>
              <input value={waterOldReading} onChange={(e) => setWaterOldReading(e.target.value)} inputMode="decimal" className="input" />
            </div>
            <div>
              <label className="label">Chỉ số mới</label>
              <input value={waterNewReading} onChange={(e) => setWaterNewReading(e.target.value)} inputMode="decimal" className="input" />
            </div>
            <div>
              <label className="label">Đơn giá (đ/m³)</label>
              <input value={waterUnitPrice} onChange={(e) => setWaterUnitPrice(e.target.value)} inputMode="numeric" className="input" />
            </div>
          </div>
        )}
        {costWater === "fixed" && (
          <div className="mt-3">
            <label className="label">Số tiền khoán (đ)</label>
            <input value={waterFixedAmount} onChange={(e) => setWaterFixedAmount(e.target.value)} inputMode="numeric" className="input max-w-xs" />
          </div>
        )}
        <p className="mt-3 text-sm font-semibold text-brand-700">Thành tiền: {formatVND(waterAmount)}</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Internet (đ)</label>
          <input value={internetAmount} onChange={(e) => setInternetAmount(e.target.value)} inputMode="numeric" className="input" />
        </div>
        <div>
          <label className="label">Phí dịch vụ/quản lý (đ)</label>
          <input value={serviceFeeAmount} onChange={(e) => setServiceFeeAmount(e.target.value)} inputMode="numeric" className="input" />
        </div>
        <div>
          <label className="label">
            Khoản khác (đ) <span className="font-normal text-slate-400">(không bắt buộc)</span>
          </label>
          <input value={otherAmount} onChange={(e) => setOtherAmount(e.target.value)} inputMode="numeric" placeholder="0" className="input" />
        </div>
        <div>
          <label className="label">
            Nội dung khoản khác <span className="font-normal text-slate-400">(không bắt buộc)</span>
          </label>
          <input value={otherNote} onChange={(e) => setOtherNote(e.target.value)} placeholder="VD: Sửa vòi nước" className="input" />
        </div>
      </div>

      <div className="mt-4">
        <label className="label">
          Ghi chú <span className="font-normal text-slate-400">(không bắt buộc)</span>
        </label>
        <input value={note} onChange={(e) => setNote(e.target.value)} className="input" />
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="text-base font-bold text-slate-900">Tổng cộng: {formatVND(total)}</p>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="btn-secondary text-sm">
            Hủy
          </button>
          <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-primary text-sm">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : "Lập phiếu"}
          </button>
        </div>
      </div>
    </div>
  );
}
