"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2, Clock, Loader2, Plus, Receipt } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatVND } from "@/lib/contract-utils";
import InvoiceForm from "@/components/invoice/InvoiceForm";
import type { CostMethod } from "@/types";

interface InvoiceListItem {
  id: string;
  year: number;
  month: number;
  totalAmount: string;
  status: "PAID" | "UNPAID";
  electricityNewReading: string | null;
  waterNewReading: string | null;
}

interface ContractForInvoicing {
  id: string;
  roomName: string | null;
  rentAmount: string | null;
  building: { name: string; electricityPrice: string | null; waterPrice: string | null } | null;
  dataJson: { terms?: { costElectricity?: CostMethod; costWater?: CostMethod } };
  parties: { name: string; role: "LANDLORD" | "TENANT" }[];
}

const MONTH_LABEL = (year: number, month: number) => `Tháng ${month}/${year}`;

function getDefaultPeriod(invoices: InvoiceListItem[]) {
  const now = new Date();
  if (invoices.length === 0) return { year: now.getFullYear(), month: now.getMonth() + 1 };
  const latest = invoices[0]; // API returns sorted desc by year, month
  let month = latest.month + 1;
  let year = latest.year;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  return { year, month };
}

export default function ContractInvoicesPage() {
  useAuth();
  const params = useParams<{ id: string }>();
  const [contract, setContract] = useState<ContractForInvoicing | null>(null);
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  function refetchInvoices() {
    return fetch(`/api/contracts/${params.id}/invoices`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setInvoices(data.invoices));
  }

  useEffect(() => {
    Promise.all([
      fetch(`/api/contracts/${params.id}`).then((res) => (res.ok ? res.json() : Promise.reject())),
      refetchInvoices(),
    ])
      .then(([contractData]) => setContract(contractData.contract))
      .catch(() => toast.error("Không thể tải dữ liệu hợp đồng"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 size={28} className="animate-spin" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm font-medium text-slate-600">Không tìm thấy hợp đồng này.</p>
        <Link href="/dashboard" className="btn-outline mt-4 inline-flex">
          <ArrowLeft size={16} /> Về trang tổng quan
        </Link>
      </div>
    );
  }

  const tenant = contract.parties.find((p) => p.role === "TENANT");
  const latestInvoice = invoices[0];
  const defaultPeriod = getDefaultPeriod(invoices);

  return (
    <div className="space-y-6">
      <Link
        href={`/contracts/${contract.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={15} /> Về hợp đồng
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Phiếu tính tiền — {contract.roomName || (contract.building ? contract.building.name : "Phòng")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{tenant?.name ?? "Chưa có người thuê"}</p>
        </div>
        {!showForm && (
          <button type="button" onClick={() => setShowForm(true)} className="btn-primary text-sm">
            <Plus size={16} /> Lập phiếu tháng này
          </button>
        )}
      </div>

      {showForm && (
        <InvoiceForm
          contractId={contract.id}
          defaultYear={defaultPeriod.year}
          defaultMonth={defaultPeriod.month}
          rentAmountDefault={contract.rentAmount ?? ""}
          costElectricity={contract.dataJson.terms?.costElectricity ?? "tenant"}
          costWater={contract.dataJson.terms?.costWater ?? "tenant"}
          electricityUnitPriceDefault={contract.building?.electricityPrice ?? ""}
          waterUnitPriceDefault={contract.building?.waterPrice ?? ""}
          electricityOldReadingDefault={latestInvoice?.electricityNewReading ?? ""}
          waterOldReadingDefault={latestInvoice?.waterNewReading ?? ""}
          onCreated={() => {
            setShowForm(false);
            refetchInvoices();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="card">
        <p className="border-b border-slate-100 px-5 py-3 text-sm font-bold text-slate-900">
          Lịch sử phiếu ({invoices.length})
        </p>
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Receipt size={22} />
            </span>
            <p className="text-sm text-slate-500">Chưa có phiếu tính tiền nào.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {invoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/contracts/${contract.id}/invoices/${invoice.id}`}
                className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-slate-50"
              >
                <p className="text-sm font-semibold text-slate-900">{MONTH_LABEL(invoice.year, invoice.month)}</p>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-slate-900">{formatVND(invoice.totalAmount)}</p>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      invoice.status === "PAID" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {invoice.status === "PAID" ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                    {invoice.status === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
