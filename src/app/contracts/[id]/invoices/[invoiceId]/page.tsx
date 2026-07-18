"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2, Clock, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatVND, formatDateVN } from "@/lib/contract-utils";

interface InvoiceDetail {
  id: string;
  year: number;
  month: number;
  rentAmount: string;
  electricityOldReading: string | null;
  electricityNewReading: string | null;
  electricityUnitPrice: string | null;
  electricityAmount: string;
  waterOldReading: string | null;
  waterNewReading: string | null;
  waterUnitPrice: string | null;
  waterAmount: string;
  internetAmount: string;
  serviceFeeAmount: string;
  otherAmount: string;
  otherNote: string | null;
  totalAmount: string;
  status: "PAID" | "UNPAID";
  paidAt: string | null;
  note: string | null;
}

export default function InvoiceDetailPage() {
  useAuth();
  const params = useParams<{ id: string; invoiceId: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/invoices/${params.invoiceId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setInvoice(data.invoice))
      .catch(() => toast.error("Không thể tải phiếu tính tiền"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.invoiceId]);

  async function toggleStatus() {
    if (!invoice) return;
    setUpdating(true);
    try {
      const nextStatus = invoice.status === "PAID" ? "UNPAID" : "PAID";
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Không thể cập nhật");
        return;
      }
      setInvoice(result.invoice);
      toast.success(nextStatus === "PAID" ? "Đã đánh dấu thanh toán" : "Đã đánh dấu chưa thanh toán");
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!invoice) return;
    if (!window.confirm("Xóa phiếu tính tiền này? Hành động không thể hoàn tác.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Không thể xóa");
        return;
      }
      toast.success("Đã xóa phiếu tính tiền");
      router.push(`/contracts/${params.id}/invoices`);
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

  if (!invoice) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm font-medium text-slate-600">Không tìm thấy phiếu tính tiền này.</p>
        <Link href={`/contracts/${params.id}/invoices`} className="btn-outline mt-4 inline-flex">
          <ArrowLeft size={16} /> Về lịch sử phiếu
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/contracts/${params.id}/invoices`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={15} /> Về lịch sử phiếu
      </Link>

      <div className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Phiếu tính tiền tháng {invoice.month}/{invoice.year}
            </h1>
            {invoice.paidAt && <p className="mt-1 text-xs text-slate-400">Đã thanh toán ngày {formatDateVN(invoice.paidAt)}</p>}
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${
              invoice.status === "PAID" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            }`}
          >
            {invoice.status === "PAID" ? <CheckCircle2 size={15} /> : <Clock size={15} />}
            {invoice.status === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
          </span>
        </div>

        <dl className="mt-6 space-y-2 border-t border-slate-100 pt-6 text-sm">
          <Row label="Tiền thuê nhà" value={formatVND(invoice.rentAmount)} />
          <Row
            label={
              invoice.electricityOldReading !== null
                ? `Tiền điện (${invoice.electricityOldReading} → ${invoice.electricityNewReading}, ${formatVND(invoice.electricityUnitPrice ?? 0)}/kWh)`
                : "Tiền điện"
            }
            value={formatVND(invoice.electricityAmount)}
          />
          <Row
            label={
              invoice.waterOldReading !== null
                ? `Tiền nước (${invoice.waterOldReading} → ${invoice.waterNewReading}, ${formatVND(invoice.waterUnitPrice ?? 0)}/m³)`
                : "Tiền nước"
            }
            value={formatVND(invoice.waterAmount)}
          />
          {Number(invoice.internetAmount) > 0 && <Row label="Internet" value={formatVND(invoice.internetAmount)} />}
          {Number(invoice.serviceFeeAmount) > 0 && <Row label="Phí dịch vụ" value={formatVND(invoice.serviceFeeAmount)} />}
          {Number(invoice.otherAmount) > 0 && <Row label={invoice.otherNote || "Khác"} value={formatVND(invoice.otherAmount)} />}
        </dl>

        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
          <p className="text-base font-bold text-slate-900">Tổng cộng</p>
          <p className="text-lg font-extrabold text-brand-700">{formatVND(invoice.totalAmount)}</p>
        </div>

        {invoice.note && <p className="mt-4 text-sm italic text-slate-500">Ghi chú: {invoice.note}</p>}

        <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
          <a
            href={`/api/invoices/${invoice.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm"
          >
            <ExternalLink size={16} /> Xem / In phiếu
          </a>
          <button type="button" onClick={toggleStatus} disabled={updating} className="btn-secondary text-sm">
            {updating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : invoice.status === "PAID" ? (
              <Clock size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {invoice.status === "PAID" ? "Đánh dấu chưa thanh toán" : "Đánh dấu đã thanh toán"}
          </button>
          <button type="button" onClick={handleDelete} disabled={deleting} className="btn-danger text-sm">
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Xóa phiếu
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="shrink-0 font-medium text-slate-900">{value}</dd>
    </div>
  );
}
