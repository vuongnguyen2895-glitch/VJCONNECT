"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2, Clock, Copy, ExternalLink, Loader2, Send, Trash2, Wallet } from "lucide-react";
import type { ContractStatus, PartyRole } from "@prisma/client";
import { formatDateVN, formatVND, getStatusDisplay } from "@/lib/contract-utils";
import { useAuth } from "@/hooks/useAuth";

interface ContractParty {
  id: string;
  role: PartyRole;
  name: string;
  cccd: string | null;
  phone: string | null;
  email: string | null;
  signedAt: string | null;
  signingUrl: string | null;
}

interface ContractDetail {
  id: string;
  contractNo: string | null;
  status: ContractStatus;
  title: string | null;
  dataJson: { property?: Record<string, string>; terms?: Record<string, string> };
  startDate: string | null;
  endDate: string | null;
  rentAmount: string | null;
  deposit: string | null;
  template: { name: string; icon: string | null };
  parties: ContractParty[];
  activities: { id: string; action: string; actorName: string | null; createdAt: string }[];
}

const ACTIVITY_LABELS: Record<string, string> = {
  created: "đã tạo hợp đồng",
  updated: "đã cập nhật hợp đồng",
  sent_for_signing: "đã gửi ký",
  signed_by_landlord: "bên A đã ký",
  signed_by_tenant: "bên B đã ký",
  deposit_received: "đã xác nhận nhận cọc",
};

export default function ContractDetailPage() {
  useAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [sending, setSending] = useState(false);
  const [markingDeposit, setMarkingDeposit] = useState(false);

  async function refetchContract() {
    const res = await fetch(`/api/contracts/${params.id}`);
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    setContract(data.contract);
  }

  useEffect(() => {
    refetchContract()
      .catch(() => toast.error("Không thể tải hợp đồng"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function handleDelete() {
    if (!contract) return;
    if (!window.confirm("Xóa bản nháp này? Hành động không thể hoàn tác.")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/contracts/${contract.id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Không thể xóa hợp đồng");
        return;
      }
      toast.success("Đã xóa bản nháp");
      router.push("/dashboard");
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setDeleting(false);
    }
  }

  async function handleSendForSigning() {
    if (!contract) return;
    setSending(true);
    try {
      const res = await fetch(`/api/contracts/${contract.id}/send-for-signing`, { method: "POST" });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Không thể gửi yêu cầu ký");
        return;
      }
      await refetchContract();
      toast.success("Đã tạo liên kết ký cho các bên");
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setSending(false);
    }
  }

  async function handleMarkDepositReceived() {
    if (!contract) return;
    setMarkingDeposit(true);
    try {
      const res = await fetch(`/api/contracts/${contract.id}/mark-deposit-received`, { method: "POST" });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Không thể xác nhận");
        return;
      }
      await refetchContract();
      toast.success("Đã đánh dấu nhận cọc");
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setMarkingDeposit(false);
    }
  }

  function copySigningLink(token: string) {
    const url = `${window.location.origin}/sign/${token}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Đã sao chép liên kết ký"))
      .catch(() => toast.error("Không thể sao chép liên kết"));
  }

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

  const status = getStatusDisplay(contract.status);
  const landlord = contract.parties.find((p) => p.role === "LANDLORD");
  const tenant = contract.parties.find((p) => p.role === "TENANT");
  const terms = contract.dataJson?.terms ?? {};
  const property = contract.dataJson?.property ?? {};
  const depositReceived = contract.activities.some((a) => a.action === "deposit_received");

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={15} /> Về trang tổng quan
      </Link>

      <div className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-2xl">
              {contract.template.icon ?? "📄"}
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{contract.title ?? contract.template.name}</h1>
              <p className="mt-0.5 font-mono text-sm text-slate-500">{contract.contractNo}</p>
            </div>
          </div>
          <span
            className="rounded-full px-3 py-1.5 text-sm font-semibold"
            style={{ color: status.color, backgroundColor: status.bg }}
          >
            {status.label}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-4">
          <Stat label="Giá thuê" value={contract.rentAmount ? formatVND(contract.rentAmount) : "—"} />
          <Stat label="Đặt cọc" value={contract.deposit ? formatVND(contract.deposit) : "—"} />
          <Stat label="Bắt đầu" value={contract.startDate ? formatDateVN(contract.startDate) : "—"} />
          <Stat label="Kết thúc" value={contract.endDate ? formatDateVN(contract.endDate) : "—"} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
          <a
            href={`/api/contracts/${contract.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm"
          >
            <ExternalLink size={16} /> Xem / In hợp đồng
          </a>
          {contract.status === "DRAFT" && (
            <>
              <button type="button" onClick={handleSendForSigning} disabled={sending} className="btn-secondary text-sm">
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Gửi yêu cầu ký
              </button>
              <button type="button" onClick={handleDelete} disabled={deleting} className="btn-danger text-sm">
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Xóa bản nháp
              </button>
            </>
          )}
          {contract.status !== "DRAFT" && contract.deposit && !depositReceived && (
            <button
              type="button"
              onClick={handleMarkDepositReceived}
              disabled={markingDeposit}
              className="btn-secondary text-sm"
            >
              {markingDeposit ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />} Đánh dấu đã nhận cọc
            </button>
          )}
          {depositReceived && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-600">
              <CheckCircle2 size={16} /> Đã nhận cọc
            </span>
          )}
        </div>
      </div>

      {contract.status !== "DRAFT" && (
        <div className="card p-6">
          <h2 className="text-sm font-bold text-slate-900">Liên kết ký</h2>
          <p className="mt-1 text-sm text-slate-500">
            Gửi liên kết này cho từng bên qua Zalo, SMS hoặc email để họ ký trực tiếp trên điện thoại.
          </p>
          <div className="mt-4 space-y-3">
            {contract.parties.map((party) => (
              <div key={party.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400">
                    {party.role === "LANDLORD" ? "Bên A" : "Bên B"} · {party.name}
                  </p>
                  <p className="truncate font-mono text-xs text-slate-600">
                    {party.signingUrl ? `/sign/${party.signingUrl}` : "Chưa tạo liên kết"}
                  </p>
                </div>
                {party.signedAt ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 size={13} /> Đã ký
                  </span>
                ) : (
                  party.signingUrl && (
                    <button
                      type="button"
                      onClick={() => copySigningLink(party.signingUrl!)}
                      className="btn-secondary shrink-0 text-xs"
                    >
                      <Copy size={13} /> Sao chép
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <PartyCard title="Bên cho thuê (Bên A)" party={landlord} />
        <PartyCard title="Bên thuê (Bên B)" party={tenant} />
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-bold text-slate-900">Thông tin tài sản & điều khoản</h2>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
          <Row label="Địa chỉ" value={property.address ?? "—"} />
          <Row label="Diện tích" value={property.area ? `${property.area} m²` : "—"} />
          <Row label="Thời hạn" value={terms.duration ? `${terms.duration} tháng` : "—"} />
        </dl>
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-bold text-slate-900">Lịch sử hoạt động</h2>
        <div className="mt-4 space-y-4">
          {contract.activities.length === 0 && <p className="text-sm text-slate-400">Chưa có hoạt động nào.</p>}
          {contract.activities.map((activity) => (
            <div key={activity.id} className="flex gap-3 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              <p className="text-slate-600">
                <span className="font-semibold text-slate-900">{activity.actorName ?? "Hệ thống"}</span>{" "}
                {ACTIVITY_LABELS[activity.action] ?? activity.action}
                <br />
                <span className="text-xs text-slate-400">{formatDateVN(activity.createdAt)}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-700">{value}</dd>
    </>
  );
}

function PartyCard({ title, party }: { title: string; party?: ContractParty }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        {party?.signedAt ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
            <CheckCircle2 size={13} /> Đã ký
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
            <Clock size={13} /> Chưa ký
          </span>
        )}
      </div>
      {party ? (
        <dl className="mt-4 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-400">Họ tên</dt>
            <dd className="font-medium text-slate-700">{party.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">CCCD/CMND</dt>
            <dd className="font-medium text-slate-700">{party.cccd ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Điện thoại</dt>
            <dd className="font-medium text-slate-700">{party.phone ?? "—"}</dd>
          </div>
          {party.email && (
            <div className="flex justify-between">
              <dt className="text-slate-400">Email</dt>
              <dd className="font-medium text-slate-700">{party.email}</dd>
            </div>
          )}
        </dl>
      ) : (
        <p className="mt-4 text-sm text-slate-400">Chưa có thông tin.</p>
      )}
    </div>
  );
}
