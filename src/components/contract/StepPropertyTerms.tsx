import { Banknote, Calendar, CalendarClock, FileText, Landmark, MapPin, Plus, Ruler, Sofa, Target, Trash2, Wallet } from "lucide-react";
import FormField from "./FormField";
import type { ContractFormData, CostMethod, RentPeriodFormData } from "@/types";

interface StepPropertyTermsProps {
  property: ContractFormData["property"];
  terms: ContractFormData["terms"];
  errors: Partial<Record<string, string>>;
  onPropertyChange: (field: keyof ContractFormData["property"], value: string) => void;
  onTermsChange: (field: keyof ContractFormData["terms"], value: string) => void;
  onAddRentPeriod: () => void;
  onRemoveRentPeriod: (index: number) => void;
  onRentPeriodChange: (index: number, field: keyof RentPeriodFormData, value: string) => void;
}

const COST_METHOD_OPTIONS: { value: CostMethod; label: string }[] = [
  { value: "tenant", label: "Tự trả theo chỉ số" },
  { value: "included", label: "Đã bao gồm giá thuê" },
  { value: "fixed", label: "Khoán cố định" },
];

type CostField = "costManagement" | "costElectricity" | "costWater" | "costInternet";

const COST_CATEGORIES: { field: CostField; label: string }[] = [
  { field: "costManagement", label: "Phí quản lý" },
  { field: "costElectricity", label: "Điện" },
  { field: "costWater", label: "Nước" },
  { field: "costInternet", label: "Internet" },
];

export default function StepPropertyTerms({
  property,
  terms,
  errors,
  onPropertyChange,
  onTermsChange,
  onAddRentPeriod,
  onRemoveRentPeriod,
  onRentPeriodChange,
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
          <div className="sm:col-span-2">
            <FormField label="Mục đích thuê" icon={Target} error={errors.purpose} optional>
              <input
                value={property.purpose}
                onChange={(e) => onPropertyChange("purpose", e.target.value)}
                placeholder="Để ở / Kinh doanh / Văn phòng..."
                className="input pl-10"
              />
            </FormField>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-700">Thông tin pháp lý (không bắt buộc)</p>
          <p className="mt-0.5 text-xs text-slate-400">Theo Giấy chứng nhận quyền sử dụng đất, nếu có.</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Thửa đất số" icon={FileText} error={errors.plotNo} optional>
              <input
                value={property.plotNo}
                onChange={(e) => onPropertyChange("plotNo", e.target.value)}
                placeholder="27"
                className="input pl-10"
              />
            </FormField>
            <FormField label="Tờ bản đồ số" icon={FileText} error={errors.mapSheetNo} optional>
              <input
                value={property.mapSheetNo}
                onChange={(e) => onPropertyChange("mapSheetNo", e.target.value)}
                placeholder="21"
                className="input pl-10"
              />
            </FormField>
            <FormField label="Số giấy chứng nhận QSDĐ" icon={FileText} error={errors.landCertNo} optional>
              <input
                value={property.landCertNo}
                onChange={(e) => onPropertyChange("landCertNo", e.target.value)}
                placeholder="CV605569"
                className="input pl-10"
              />
            </FormField>
            <FormField label="Ngày cấp" icon={Calendar} error={errors.landCertDate} optional>
              <input
                type="date"
                value={property.landCertDate}
                onChange={(e) => onPropertyChange("landCertDate", e.target.value)}
                className="input pl-10"
              />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Nơi cấp" icon={Landmark} error={errors.landCertIssuer} optional>
                <input
                  value={property.landCertIssuer}
                  onChange={(e) => onPropertyChange("landCertIssuer", e.target.value)}
                  placeholder="UBND Quận Bình Thạnh, TP.HCM"
                  className="input pl-10"
                />
              </FormField>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-8">
        <h2 className="text-lg font-bold text-slate-900">Điều khoản cho thuê</h2>
        <p className="mt-1 text-sm text-slate-500">Giá thuê, đặt cọc và thời hạn hợp đồng.</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Giá thuê giai đoạn đầu (đ/tháng)" icon={Banknote} error={errors.rentAmount}>
            <input
              value={terms.rentAmount}
              onChange={(e) => onTermsChange("rentAmount", e.target.value)}
              placeholder="5000000"
              inputMode="numeric"
              className="input pl-10"
            />
          </FormField>
          <FormField label="Thuế VAT (%)" icon={Banknote} error={errors.vatRate} optional>
            <input
              value={terms.vatRate}
              onChange={(e) => onTermsChange("vatRate", e.target.value)}
              placeholder="5"
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

        <div className="mt-6 rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-700">Chi phí quản lý, điện, nước, internet</p>
          <p className="mt-0.5 text-xs text-slate-400">Chọn cách tính cho từng khoản chi phí.</p>

          <div className="mt-4 space-y-4">
            {COST_CATEGORIES.map((category) => (
              <div key={category.field}>
                <p className="text-xs font-semibold text-slate-500">{category.label}</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {COST_METHOD_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onTermsChange(category.field, option.value)}
                      className={`rounded-xl border-2 px-3.5 py-2 text-xs font-medium transition-colors ${
                        terms[category.field] === option.value
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <FormField label="Thỏa thuận khác (nếu có)" icon={FileText} error={errors.otherAgreement} optional>
              <input
                value={terms.otherAgreement}
                onChange={(e) => onTermsChange("otherAgreement", e.target.value)}
                placeholder="VD: Bên B tự lắp đặt và thanh toán chi phí truyền hình cáp"
                className="input pl-10"
              />
            </FormField>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">Điều chỉnh giá theo giai đoạn (không bắt buộc)</p>
              <p className="mt-0.5 text-xs text-slate-400">Thêm nếu giá thuê tăng sau mỗi năm, ví dụ hợp đồng dài hạn.</p>
            </div>
            <button type="button" onClick={onAddRentPeriod} className="btn-secondary shrink-0 text-xs">
              <Plus size={14} /> Thêm giai đoạn
            </button>
          </div>

          {terms.rentPeriods.length > 0 && (
            <div className="mt-4 space-y-3">
              {terms.rentPeriods.map((period, index) => (
                <div key={index} className="grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-4">
                  <input
                    type="date"
                    value={period.fromDate}
                    onChange={(e) => onRentPeriodChange(index, "fromDate", e.target.value)}
                    className="input"
                    aria-label="Từ ngày"
                  />
                  <input
                    type="date"
                    value={period.toDate}
                    onChange={(e) => onRentPeriodChange(index, "toDate", e.target.value)}
                    className="input"
                    aria-label="Đến ngày"
                  />
                  <input
                    value={period.amount}
                    onChange={(e) => onRentPeriodChange(index, "amount", e.target.value)}
                    placeholder="Giá thuê (đ/tháng)"
                    inputMode="numeric"
                    className="input"
                    aria-label="Giá thuê"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveRentPeriod(index)}
                    className="btn-danger justify-center text-xs"
                  >
                    <Trash2 size={14} /> Xoá
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-700">Tài khoản nhận tiền thuê (không bắt buộc)</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="Chủ tài khoản" icon={Landmark} error={errors.bankAccountName} optional>
              <input
                value={terms.bankAccountName}
                onChange={(e) => onTermsChange("bankAccountName", e.target.value)}
                placeholder="Nguyễn Văn A"
                className="input pl-10"
              />
            </FormField>
            <FormField label="Số tài khoản" icon={Landmark} error={errors.bankAccountNumber} optional>
              <input
                value={terms.bankAccountNumber}
                onChange={(e) => onTermsChange("bankAccountNumber", e.target.value)}
                placeholder="0123456789"
                className="input pl-10"
              />
            </FormField>
            <FormField label="Ngân hàng" icon={Landmark} error={errors.bankName} optional>
              <input
                value={terms.bankName}
                onChange={(e) => onTermsChange("bankName", e.target.value)}
                placeholder="Vietcombank"
                className="input pl-10"
              />
            </FormField>
          </div>
        </div>
      </div>
    </div>
  );
}
