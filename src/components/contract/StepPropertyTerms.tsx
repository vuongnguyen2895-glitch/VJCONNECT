import { Banknote, Calendar, CalendarClock, MapPin, Ruler, Sofa, Wallet } from "lucide-react";
import FormField from "./FormField";
import type { ContractFormData } from "@/types";

interface StepPropertyTermsProps {
  property: ContractFormData["property"];
  terms: ContractFormData["terms"];
  errors: Partial<Record<string, string>>;
  onPropertyChange: (field: keyof ContractFormData["property"], value: string) => void;
  onTermsChange: (field: keyof ContractFormData["terms"], value: string) => void;
}

const UTILITY_OPTIONS: { value: ContractFormData["terms"]["utilities"]; label: string }[] = [
  { value: "tenant", label: "Bên thuê tự trả theo chỉ số" },
  { value: "included", label: "Đã bao gồm trong giá thuê" },
  { value: "fixed", label: "Khoán cố định hàng tháng" },
];

export default function StepPropertyTerms({
  property,
  terms,
  errors,
  onPropertyChange,
  onTermsChange,
}: StepPropertyTermsProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Thông tin tài sản</h2>
        <p className="mt-1 text-sm text-slate-500">Địa chỉ và đặc điểm của nhà/căn hộ cho thuê.</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField label="Địa chỉ" icon={MapPin} error={errors.address}>
              <input
                value={property.address}
                onChange={(e) => onPropertyChange("address", e.target.value)}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                className="input pl-10"
              />
            </FormField>
          </div>
          <FormField label="Diện tích (m²)" icon={Ruler} error={errors.area} optional>
            <input
              value={property.area}
              onChange={(e) => onPropertyChange("area", e.target.value)}
              placeholder="45"
              inputMode="decimal"
              className="input pl-10"
            />
          </FormField>
          <FormField label="Tầng" icon={Ruler} error={errors.floor} optional>
            <input
              value={property.floor}
              onChange={(e) => onPropertyChange("floor", e.target.value)}
              placeholder="Tầng 3"
              className="input pl-10"
            />
          </FormField>
          <FormField label="Số phòng" icon={Ruler} error={errors.rooms} optional>
            <input
              value={property.rooms}
              onChange={(e) => onPropertyChange("rooms", e.target.value)}
              placeholder="2 phòng ngủ, 1 phòng khách"
              className="input pl-10"
            />
          </FormField>
          <FormField label="Nội thất" icon={Sofa} error={errors.furniture} optional>
            <input
              value={property.furniture}
              onChange={(e) => onPropertyChange("furniture", e.target.value)}
              placeholder="Đầy đủ / Cơ bản / Không"
              className="input pl-10"
            />
          </FormField>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-8">
        <h2 className="text-lg font-bold text-slate-900">Điều khoản cho thuê</h2>
        <p className="mt-1 text-sm text-slate-500">Giá thuê, đặt cọc và thời hạn hợp đồng.</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Giá thuê / tháng (đ)" icon={Banknote} error={errors.rentAmount}>
            <input
              value={terms.rentAmount}
              onChange={(e) => onTermsChange("rentAmount", e.target.value)}
              placeholder="5000000"
              inputMode="numeric"
              className="input pl-10"
            />
          </FormField>
          <FormField label="Tiền đặt cọc (đ)" icon={Wallet} error={errors.deposit} optional>
            <input
              value={terms.deposit}
              onChange={(e) => onTermsChange("deposit", e.target.value)}
              placeholder="10000000"
              inputMode="numeric"
              className="input pl-10"
            />
          </FormField>
          <FormField label="Ngày thanh toán hàng tháng" icon={CalendarClock} error={errors.paymentDate} optional>
            <input
              value={terms.paymentDate}
              onChange={(e) => onTermsChange("paymentDate", e.target.value)}
              placeholder="5"
              inputMode="numeric"
              className="input pl-10"
            />
          </FormField>
          <FormField label="Thời hạn thuê (tháng)" icon={Calendar} error={errors.duration}>
            <input
              value={terms.duration}
              onChange={(e) => onTermsChange("duration", e.target.value)}
              placeholder="12"
              inputMode="numeric"
              className="input pl-10"
            />
          </FormField>
          <FormField label="Ngày bắt đầu" icon={Calendar} error={errors.startDate}>
            <input
              type="date"
              value={terms.startDate}
              onChange={(e) => onTermsChange("startDate", e.target.value)}
              className="input pl-10"
            />
          </FormField>
        </div>

        <div className="mt-4">
          <label className="label">Chi phí điện, nước</label>
          <div className="flex flex-wrap gap-2">
            {UTILITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onTermsChange("utilities", option.value)}
                className={`rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  terms.utilities === option.value
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
