import type { ReactNode } from "react";
import { CheckCircle2, Loader2, Pencil } from "lucide-react";
import { formatVND } from "@/lib/contract-utils";
import type { ContractFormData, PartyFormData, Template } from "@/types";

interface StepReviewProps {
  data: ContractFormData;
  template?: Template;
  submitting: boolean;
  onEditStep: (step: number) => void;
  onSubmit: () => void;
}

const COST_METHOD_LABELS: Record<string, string> = {
  tenant: "Tự trả theo chỉ số",
  included: "Đã bao gồm giá thuê",
  fixed: "Khoán cố định",
};

export default function StepReview({ data, template, submitting, onEditStep, onSubmit }: StepReviewProps) {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900">Xem lại & xác nhận</h2>
      <p className="mt-1 text-sm text-slate-500">Kiểm tra kỹ thông tin trước khi tạo hợp đồng.</p>

      <div className="mt-6 space-y-4">
        <ReviewSection title="Mẫu hợp đồng" onEdit={() => onEditStep(0)}>
          <p className="text-sm text-slate-700">
            {template?.icon} {template?.name}
          </p>
          {data.contractNo && <p className="mt-1 font-mono text-xs text-slate-500">Số hợp đồng: {data.contractNo}</p>}
        </ReviewSection>

        <ReviewSection title="Bên cho thuê (Bên A)" onEdit={() => onEditStep(1)}>
          <PartyRows party={data.landlord} />
        </ReviewSection>

        <ReviewSection title="Bên thuê (Bên B)" onEdit={() => onEditStep(2)}>
          <PartyRows party={data.tenant} />
        </ReviewSection>

        <ReviewSection title="Tài sản & điều khoản" onEdit={() => onEditStep(3)}>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <Row label="Địa chỉ" value={data.property.address} />
            <Row label="Diện tích" value={data.property.area ? `${data.property.area} m²` : "—"} />
            {data.property.purpose && <Row label="Mục đích thuê" value={data.property.purpose} />}
            {data.property.landCertNo && <Row label="Giấy CNQSDĐ" value={data.property.landCertNo} />}
            <Row label="Giá thuê giai đoạn đầu" value={data.terms.rentAmount ? formatVND(data.terms.rentAmount) : "—"} />
            {data.terms.vatRate && <Row label="VAT" value={`${data.terms.vatRate}%`} />}
            <Row label="Đặt cọc" value={data.terms.deposit ? formatVND(data.terms.deposit) : "—"} />
            <Row label="Thời hạn" value={`${data.terms.duration} tháng`} />
            <Row label="Ngày bắt đầu" value={data.terms.startDate || "—"} />
            {data.terms.bankAccountNumber && (
              <Row label="Tài khoản nhận tiền" value={`${data.terms.bankAccountNumber} (${data.terms.bankName || "—"})`} />
            )}
          </dl>

          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-xs font-semibold text-slate-500">Chi phí quản lý, điện, nước, internet</p>
            <dl className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <Row label="Quản lý" value={COST_METHOD_LABELS[data.terms.costManagement]} />
              <Row label="Điện" value={COST_METHOD_LABELS[data.terms.costElectricity]} />
              <Row label="Nước" value={COST_METHOD_LABELS[data.terms.costWater]} />
              <Row label="Internet" value={COST_METHOD_LABELS[data.terms.costInternet]} />
            </dl>
            {data.terms.otherAgreement && (
              <p className="mt-1.5 text-sm text-slate-600">Thỏa thuận khác: {data.terms.otherAgreement}</p>
            )}
          </div>

          {data.terms.rentPeriods.length > 0 && (
            <div className="mt-3 border-t border-slate-100 pt-3">
              <p className="text-xs font-semibold text-slate-500">Điều chỉnh giá theo giai đoạn</p>
              <ul className="mt-1.5 space-y-1">
                {data.terms.rentPeriods.map((period, index) => (
                  <li key={index} className="text-sm text-slate-600">
                    {period.fromDate || "—"} → {period.toDate || "—"}: {period.amount ? formatVND(period.amount) : "—"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ReviewSection>

        <ReviewSection title="Điều khoản chi tiết" onEdit={() => onEditStep(4)}>
          {data.clauses.length === 0 ? (
            <p className="text-sm text-slate-400">Không có điều khoản nào.</p>
          ) : (
            <ol className="list-decimal space-y-1 pl-4 text-sm text-slate-700">
              {data.clauses.map((clause) => (
                <li key={clause.id}>{clause.title || "(chưa đặt tiêu đề)"}</li>
              ))}
            </ol>
          )}
        </ReviewSection>
      </div>

      <button type="button" onClick={onSubmit} disabled={submitting} className="btn-primary mt-8 w-full justify-center">
        {submitting ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            <CheckCircle2 size={18} /> Tạo hợp đồng
          </>
        )}
      </button>
    </div>
  );
}

function PartyRows({ party }: { party: PartyFormData }) {
  if (party.partyKind === "COMPANY") {
    return (
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        <Row label="Tên công ty" value={party.name} />
        <Row label="Mã số DN" value={party.businessRegNo || "—"} />
        <Row label="Người đại diện" value={party.representativeName || "—"} />
        <Row label="Chức vụ" value={party.representativePosition || "—"} />
        <Row label="Điện thoại" value={party.phone} />
        <Row label="Địa chỉ" value={party.address || "—"} />
      </dl>
    );
  }

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
      <Row label="Họ tên" value={party.name} />
      <Row label="CCCD/CMND" value={party.cccd || "—"} />
      {party.idIssuePlace && <Row label="Nơi cấp" value={party.idIssuePlace} />}
      <Row label="Điện thoại" value={party.phone} />
      <Row label="Địa chỉ" value={party.address || "—"} />
    </dl>
  );
}

function ReviewSection({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          <Pencil size={13} /> Sửa
        </button>
      </div>
      <div className="mt-3">{children}</div>
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
