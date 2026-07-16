"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import type { ContractStatus, PartyRole } from "@prisma/client";
import { formatDateVN, formatVND, getStatusDisplay } from "@/lib/contract-utils";
import SignaturePad from "@/components/contract/SignaturePad";

interface SignParty {
  role: PartyRole;
  name: string;
  cccd?: string | null;
  phone?: string | null;
  email?: string | null;
  signedAt: string | null;
}

interface SignData {
  party: { role: PartyRole; name: string; signedAt: string | null };
  contract: {
    contractNo: string | null;
    title: string | null;
    status: ContractStatus;
    dataJson: { property?: Record<string, string>; terms?: Record<string, string> };
    startDate: string | null;
    endDate: string | null;
    rentAmount: string | null;
    deposit: string | null;
    template: { name: string; icon: string | null };
    parties: SignParty[];
  };
}

export default function SignPage() {
  const params = useParams<{ token: string }>();
  const [data, setData] = useState<SignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [justSigned, setJustSigned] = useState(false);

  useEffect(() => {
    fetch(`/api/sign/${params.token}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((result) => setData(result))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.token]);

  async function handleSign() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sign/${params.token}`, { method: "POST" });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Không thể xác nhận ký");
        return;
      }
      setJustSigned(true);
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="card flex items-center justify-center p-16 text-slate-400">
        <Loader2 size={28} className="animate-spin" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="card flex flex-col items-center gap-3 p-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle size={22} />
        </span>
        <h1 className="text-lg font-bold text-slate-900">Liên kết không hợp lệ</h1>
        <p className="text-sm text-slate-500">Liên kết ký này không tồn tại hoặc đã hết hạn. Vui lòng liên hệ bên gửi hợp đồng.</p>
      </div>
    );
  }

  const alreadySigned = Boolean(data.party.signedAt) || justSigned;
  const { contract } = data;
  const status = getStatusDisplay(contract.status);
  const property = contract.dataJson?.property ?? {};
  const roleLabel = data.party.role === "LANDLORD" ? "Bên cho thuê (Bên A)" : "Bên thuê (Bên B)";

  if (alreadySigned) {
    return (
      <div className="card flex flex-col items-center gap-3 p-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={24} />
        </span>
        <h1 className="text-lg font-bold text-slate-900">Bạn đã ký hợp đồng này</h1>
        <p className="text-sm text-slate-500">
          Cảm ơn {data.party.name}. Hợp đồng {contract.contractNo} đã ghi nhận chữ ký của bạn với vai trò {roleLabel.toLowerCase()}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl">
              {contract.template.icon ?? "📄"}
            </span>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{contract.title ?? contract.template.name}</h1>
              <p className="font-mono text-xs text-slate-500">{contract.contractNo}</p>
            </div>
          </div>
          <span
            className="rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{ color: status.color, backgroundColor: status.bg }}
          >
            {status.label}
          </span>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Bạn đang ký với vai trò <span className="font-semibold text-slate-700">{roleLabel}</span>: {data.party.name}
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-4">
          <div>
            <dt className="text-xs font-medium text-slate-400">Địa chỉ</dt>
            <dd className="mt-0.5 text-sm font-semibold text-slate-900">{property.address ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-400">Giá thuê</dt>
            <dd className="mt-0.5 text-sm font-semibold text-slate-900">
              {contract.rentAmount ? formatVND(contract.rentAmount) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-400">Đặt cọc</dt>
            <dd className="mt-0.5 text-sm font-semibold text-slate-900">
              {contract.deposit ? formatVND(contract.deposit) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-400">Thời hạn</dt>
            <dd className="mt-0.5 text-sm font-semibold text-slate-900">
              {contract.startDate ? formatDateVN(contract.startDate) : "—"} –{" "}
              {contract.endDate ? formatDateVN(contract.endDate) : "—"}
            </dd>
          </div>
        </dl>

        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
          {contract.parties.map((p) => (
            <div key={p.role} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <div>
                <p className="text-[11px] font-medium text-slate-400">
                  {p.role === "LANDLORD" ? "Bên A" : "Bên B"}
                </p>
                <p className="text-sm font-semibold text-slate-800">{p.name}</p>
              </div>
              {p.signedAt ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 size={13} /> Đã ký
                </span>
              ) : (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">Chưa ký</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6 sm:p-8">
        <h2 className="text-sm font-bold text-slate-900">Ký xác nhận</h2>
        <p className="mt-1 text-sm text-slate-500">
          Vẽ chữ ký của bạn vào khung bên dưới để xác nhận đồng ý với các điều khoản trong hợp đồng.
        </p>
        <div className="mt-4">
          <SignaturePad onChange={setHasSignature} />
        </div>
        <button
          type="button"
          onClick={handleSign}
          disabled={!hasSignature || submitting}
          className="btn-primary mt-5 w-full justify-center"
        >
          {submitting ? <Loader2 size={18} className="animate-spin" /> : "Xác nhận ký"}
        </button>
      </div>
    </div>
  );
}
