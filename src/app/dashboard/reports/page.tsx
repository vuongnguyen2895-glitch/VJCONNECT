"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Download, Loader2, Plus, TrendingDown, TrendingUp, Trash2, Wallet } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatVND } from "@/lib/contract-utils";
import { downloadCsv } from "@/lib/csv";

interface MonthRow {
  month: number;
  revenue: number;
  collected: number;
  expenses: number;
  profit: number;
}
interface YearRow {
  year: number;
  revenue: number;
  collected: number;
  expenses: number;
  profit: number;
}
interface BuildingRow {
  buildingId: string | null;
  buildingName: string;
  revenue: number;
  collected: number;
  expenses: number;
  profit: number;
}
interface ReportData {
  selectedYear: number;
  availableYears: number[];
  monthly: MonthRow[];
  yearly: YearRow[];
  byBuilding: BuildingRow[];
}

interface ExpenseRow {
  id: string;
  category: string;
  amount: string;
  date: string;
  note: string | null;
  building: { id: string; name: string } | null;
}

interface BuildingOption {
  id: string;
  name: string;
  monthlyRentCost: string | null;
}

const RENT_COST_CATEGORY = "Chi phí thuê nhà";
const CATEGORY_PRESETS = [RENT_COST_CATEGORY, "Bảo trì/Sửa chữa", "Thuế/Phí", "Lương nhân viên", "Marketing", "Khác"];

export default function ReportsPage() {
  useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [buildings, setBuildings] = useState<BuildingOption[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(true);

  const [form, setForm] = useState({ category: CATEGORY_PRESETS[0], amount: "", date: "", buildingId: "", note: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports?year=${year}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((d) => setData(d))
      .catch(() => toast.error("Không thể tải báo cáo"))
      .finally(() => setLoading(false));
  }, [year]);

  useEffect(() => {
    loadExpenses();
    fetch("/api/buildings")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((d) => setBuildings(d.buildings))
      .catch(() => {});
  }, []);

  function loadExpenses() {
    setExpensesLoading(true);
    fetch("/api/expenses")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((d) => setExpenses(d.expenses))
      .catch(() => toast.error("Không thể tải danh sách chi phí"))
      .finally(() => setExpensesLoading(false));
  }

  async function handleAddExpense() {
    if (!form.amount || !form.date) {
      toast.error("Vui lòng nhập số tiền và ngày");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Không thể lưu chi phí");
        return;
      }
      toast.success("Đã thêm chi phí");
      setForm({ category: CATEGORY_PRESETS[0], amount: "", date: "", buildingId: "", note: "" });
      loadExpenses();
      fetch(`/api/reports?year=${year}`)
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((d) => setData(d))
        .catch(() => {});
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setSaving(false);
    }
  }

  async function handleRecordRentCost(building: BuildingOption) {
    if (!building.monthlyRentCost) return;
    setSaving(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: RENT_COST_CATEGORY,
          amount: building.monthlyRentCost,
          date: today,
          buildingId: building.id,
          note: "",
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Không thể ghi nhận");
        return;
      }
      toast.success(`Đã ghi nhận tiền thuê nhà ${building.name} tháng này`);
      loadExpenses();
      fetch(`/api/reports?year=${year}`)
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((d) => setData(d))
        .catch(() => {});
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteExpense(id: string) {
    if (!window.confirm("Xóa khoản chi phí này?")) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Không thể xóa");
        return;
      }
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      toast.success("Đã xóa chi phí");
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    }
  }

  const rentCostBuildings = useMemo(() => {
    const now = new Date();
    return buildings
      .filter((b) => b.monthlyRentCost)
      .map((b) => {
        const recorded = expenses.some(
          (e) =>
            e.category === RENT_COST_CATEGORY &&
            e.building?.id === b.id &&
            new Date(e.date).getFullYear() === now.getFullYear() &&
            new Date(e.date).getMonth() === now.getMonth(),
        );
        return { building: b, recorded };
      });
  }, [buildings, expenses]);

  const yearTotal = useMemo(() => {
    if (!data) return null;
    return data.monthly.reduce(
      (acc, m) => ({
        revenue: acc.revenue + m.revenue,
        collected: acc.collected + m.collected,
        expenses: acc.expenses + m.expenses,
        profit: acc.profit + m.profit,
      }),
      { revenue: 0, collected: 0, expenses: 0, profit: 0 },
    );
  }, [data]);

  function exportMonthly() {
    if (!data) return;
    downloadCsv(
      `doanh-thu-theo-thang-${data.selectedYear}.csv`,
      ["Tháng", "Doanh thu", "Đã thu", "Chi phí", "Lãi/Lỗ"],
      data.monthly.map((m) => [`Tháng ${m.month}`, m.revenue, m.collected, m.expenses, m.profit]),
    );
  }
  function exportYearly() {
    if (!data) return;
    downloadCsv(
      "doanh-thu-theo-nam.csv",
      ["Năm", "Doanh thu", "Đã thu", "Chi phí", "Lãi/Lỗ"],
      data.yearly.map((y) => [y.year, y.revenue, y.collected, y.expenses, y.profit]),
    );
  }
  function exportByBuilding() {
    if (!data) return;
    downloadCsv(
      `doanh-thu-theo-nha-${data.selectedYear}.csv`,
      ["Nhà", "Doanh thu", "Đã thu", "Chi phí", "Lãi/Lỗ"],
      data.byBuilding.map((b) => [b.buildingName, b.revenue, b.collected, b.expenses, b.profit]),
    );
  }
  function exportExpenses() {
    downloadCsv(
      "chi-phi.csv",
      ["Ngày", "Loại chi phí", "Nhà", "Số tiền", "Ghi chú"],
      expenses.map((e) => [
        new Date(e.date).toLocaleDateString("vi-VN"),
        e.category,
        e.building?.name ?? "Chung",
        e.amount,
        e.note ?? "",
      ]),
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Báo cáo</h1>
          <p className="mt-1 text-sm text-slate-500">Doanh thu, chi phí và lãi/lỗ theo tháng, năm và từng nhà.</p>
        </div>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input w-32">
          {(data?.availableYears ?? [year]).map((y) => (
            <option key={y} value={y}>
              Năm {y}
            </option>
          ))}
        </select>
      </div>

      {loading || !data || !yearTotal ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 size={28} className="animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="card p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <TrendingUp size={19} />
              </span>
              <p className="mt-3 text-xl font-extrabold text-slate-900">{formatVND(yearTotal.revenue)}</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">Doanh thu (ghi nhận) năm {year}</p>
            </div>
            <div className="card p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Wallet size={19} />
              </span>
              <p className="mt-3 text-xl font-extrabold text-slate-900">{formatVND(yearTotal.collected)}</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">Đã thu thực tế</p>
            </div>
            <div className="card p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <TrendingDown size={19} />
              </span>
              <p className="mt-3 text-xl font-extrabold text-slate-900">{formatVND(yearTotal.expenses)}</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">Chi phí</p>
            </div>
            <div className="card p-5">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${yearTotal.profit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
              >
                {yearTotal.profit >= 0 ? <TrendingUp size={19} /> : <TrendingDown size={19} />}
              </span>
              <p className={`mt-3 text-xl font-extrabold ${yearTotal.profit >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                {formatVND(Math.abs(yearTotal.profit))}
                {yearTotal.profit < 0 && " (lỗ)"}
              </p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">Lãi/Lỗ (đã thu − chi phí)</p>
            </div>
          </div>

          <ReportTable
            title={`Theo tháng — năm ${year}`}
            onExport={exportMonthly}
            headers={["Tháng", "Doanh thu", "Đã thu", "Chi phí", "Lãi/Lỗ"]}
            rows={data.monthly.map((m) => [
              `Tháng ${m.month}`,
              formatVND(m.revenue),
              formatVND(m.collected),
              formatVND(m.expenses),
              <ProfitCell key="p" value={m.profit} />,
            ])}
          />

          <ReportTable
            title="Theo năm"
            onExport={exportYearly}
            headers={["Năm", "Doanh thu", "Đã thu", "Chi phí", "Lãi/Lỗ"]}
            rows={data.yearly.map((y) => [
              String(y.year),
              formatVND(y.revenue),
              formatVND(y.collected),
              formatVND(y.expenses),
              <ProfitCell key="p" value={y.profit} />,
            ])}
          />

          <ReportTable
            title={`Theo nhà — năm ${year}`}
            onExport={exportByBuilding}
            headers={["Nhà", "Doanh thu", "Đã thu", "Chi phí", "Lãi/Lỗ"]}
            rows={data.byBuilding.map((b) => [
              b.buildingName,
              formatVND(b.revenue),
              formatVND(b.collected),
              formatVND(b.expenses),
              <ProfitCell key="p" value={b.profit} />,
            ])}
          />
        </>
      )}

      {rentCostBuildings.length > 0 && (
        <div className="card p-6">
          <h2 className="text-sm font-bold text-slate-900">Chi phí thuê nhà hàng tháng</h2>
          <p className="mt-1 text-sm text-slate-500">
            Tiền thuê gốc bạn trả cho chủ nhà mỗi tháng — bấm để ghi nhận vào chi phí tháng này.
          </p>
          <div className="mt-4 divide-y divide-slate-100">
            {rentCostBuildings.map(({ building, recorded }) => (
              <div key={building.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{building.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{formatVND(building.monthlyRentCost!)}/tháng</p>
                </div>
                {recorded ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                    Đã ghi nhận tháng này
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRecordRentCost(building)}
                    disabled={saving}
                    className="btn-secondary text-xs"
                  >
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Ghi nhận tháng này
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900">Chi phí</h2>
          <button type="button" onClick={exportExpenses} className="btn-secondary text-xs">
            <Download size={13} /> Xuất CSV
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-dashed border-slate-200 p-4 sm:grid-cols-5">
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="input sm:col-span-1"
          >
            {CATEGORY_PRESETS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="Số tiền"
            inputMode="numeric"
            className="input"
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="input"
          />
          <select
            value={form.buildingId}
            onChange={(e) => setForm({ ...form, buildingId: e.target.value })}
            className="input"
          >
            <option value="">Chi phí chung</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Ghi chú (không bắt buộc)"
              className="input"
            />
            <button type="button" onClick={handleAddExpense} disabled={saving} className="btn-primary shrink-0 text-sm">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            </button>
          </div>
        </div>

        <div className="mt-4">
          {expensesLoading ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <Loader2 size={22} className="animate-spin" />
            </div>
          ) : expenses.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Chưa có khoản chi phí nào.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {expenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {e.category} {e.building && <span className="font-normal text-slate-400">· {e.building.name}</span>}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {new Date(e.date).toLocaleDateString("vi-VN")}
                      {e.note && ` · ${e.note}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-semibold text-red-600">-{formatVND(e.amount)}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(e.id)}
                      className="text-slate-400 hover:text-red-600"
                      aria-label="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfitCell({ value }: { value: number }) {
  return (
    <span className={value >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-red-600"}>
      {value < 0 ? "-" : ""}
      {formatVND(Math.abs(value))}
    </span>
  );
}

function ReportTable({
  title,
  headers,
  rows,
  onExport,
}: {
  title: string;
  headers: string[];
  rows: React.ReactNode[][];
  onExport: () => void;
}) {
  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        <button type="button" onClick={onExport} className="btn-secondary text-xs">
          <Download size={13} /> Xuất CSV
        </button>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[500px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              {headers.map((h, i) => (
                <th key={h} className={`px-3 py-2.5 ${i > 0 ? "text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-slate-50 last:border-0">
                {row.map((cell, j) => (
                  <td key={j} className={`px-3 py-2.5 ${j > 0 ? "text-right" : "font-medium text-slate-900"}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
