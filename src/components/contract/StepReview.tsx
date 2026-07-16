import type { ReactNode } from "react";
import { CheckCircle2, Loader2, Pencil } from "lucide-react";
import { formatVND } from "@/lib/contract-utils";
import type { ContractFormData, Template } from "@/types";

interface StepReviewProps {
  data: ContractFormData;
  template?: Template;
  submitting: boolean;
  onEditStep: (step: number) => void;
  onSubmit: () => void;
}

const UTILITY_LABELS: Record<string, string> = {
  tenant: "Bên thuê tự trả theo chỉ số",
  included: "Đã bao gồm trong giá thuê",
  fixed: "Khoán cố định hàng tháng",
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
        </ReviewSection>

        <ReviewSection title="Bên cho thuê (Bên A)" onEdit={() => onEditStep(1)}>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <Row label="Họ tên" value={data.landlord.name} />
            <Row label="CCCD/CMND" value={data.landlord.cccd} />
            <Row label="Điện thoại" value={data.landlord.phone} />
            <Row label="Địa chỉ" value={data.landlord.address || "—"} />
          </dl>
        </ReviewSection>

        <ReviewSection title="Bên thuê (Bên B)" onEdit={() => onEditStep(2)}>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <Row label="Họ tên" value={data.tenant.name} />
            <Row label="CCCD/CMND" value={data.tenant.cccd} />
            <Row label="Điện thoại" value={data.tenant.phone} />
            <Row label="Email" value={data.tenant.email || "—"} />
          </dl>
        </ReviewSection>

        <ReviewSection title="Tài sản & điều khoản" onEdit={() => onEditStep(3)}>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <Row label="Địa chỉ" value={data.property.address} />
            <Row label="Diện tích" value={data.property.area ? `${data.property.area} m²` : "—"} />
            <Row label="Giá thuê" value={data.terms.rentAmount ? formatVND(data.terms.rentAmount) : "—"} />
            <Row label="Đặt cọc" value={data.terms.deposit ? formatVND(data.terms.deposit) : "—"} />
            <Row label="Thời hạn" value={`${data.terms.duration} tháng`} />
            <Row label="Ngày bắt đầu" value={data.terms.startDate || "—"} />
            <Row label="Điện nước" value={UTILITY_LABELS[data.terms.utilities]} />
          </dl>
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
