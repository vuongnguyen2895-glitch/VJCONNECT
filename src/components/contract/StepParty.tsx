import { Building2, Calendar, CreditCard, Landmark, Mail, MapPin, Phone, User as UserIcon } from "lucide-react";
import FormField from "./FormField";
import type { PartyFormData } from "@/types";

interface StepPartyProps {
  title: string;
  subtitle: string;
  value: PartyFormData;
  errors: Partial<Record<keyof PartyFormData, string>>;
  onChange: (field: keyof PartyFormData, value: string) => void;
}

export default function StepParty({ title, subtitle, value, errors, onChange }: StepPartyProps) {
  const isCompany = value.partyKind === "COMPANY";

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={() => onChange("partyKind", "INDIVIDUAL")}
          className={`rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            !isCompany ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
          }`}
        >
          Cá nhân
        </button>
        <button
          type="button"
          onClick={() => onChange("partyKind", "COMPANY")}
          className={`rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            isCompany ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
          }`}
        >
          Công ty
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={isCompany ? "Tên công ty" : "Họ và tên"} icon={isCompany ? Building2 : UserIcon} error={errors.name}>
          <input
            value={value.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder={isCompany ? "Công ty TNHH ABC" : "Nguyễn Văn A"}
            className="input pl-10"
          />
        </FormField>

        {!isCompany && (
          <>
            <FormField label="Số CCCD/CMND" icon={CreditCard} error={errors.cccd}>
              <input
                value={value.cccd}
                onChange={(e) => onChange("cccd", e.target.value)}
                placeholder="079123456789"
                className="input pl-10"
              />
            </FormField>
            <FormField label="Sinh năm" icon={Calendar} error={errors.dob} optional>
              <input
                value={value.dob}
                onChange={(e) => onChange("dob", e.target.value)}
                placeholder="1990"
                className="input pl-10"
              />
            </FormField>
            <FormField label="Ngày cấp CCCD" icon={Calendar} error={errors.idIssueDate} optional>
              <input
                type="date"
                value={value.idIssueDate}
                onChange={(e) => onChange("idIssueDate", e.target.value)}
                className="input pl-10"
              />
            </FormField>
            <FormField label="Nơi cấp CCCD" icon={MapPin} error={errors.idIssuePlace} optional>
              <input
                value={value.idIssuePlace}
                onChange={(e) => onChange("idIssuePlace", e.target.value)}
                placeholder="Cục Cảnh sát QLHC về TTXH"
                className="input pl-10"
              />
            </FormField>
          </>
        )}

        {isCompany && (
          <>
            <FormField label="Mã số doanh nghiệp" icon={CreditCard} error={errors.businessRegNo}>
              <input
                value={value.businessRegNo}
                onChange={(e) => onChange("businessRegNo", e.target.value)}
                placeholder="0312345678"
                className="input pl-10"
              />
            </FormField>
            <FormField label="Người đại diện" icon={UserIcon} error={errors.representativeName}>
              <input
                value={value.representativeName}
                onChange={(e) => onChange("representativeName", e.target.value)}
                placeholder="Nguyễn Văn A"
                className="input pl-10"
              />
            </FormField>
            <FormField label="Chức vụ" icon={Landmark} error={errors.representativePosition} optional>
              <input
                value={value.representativePosition}
                onChange={(e) => onChange("representativePosition", e.target.value)}
                placeholder="Giám đốc"
                className="input pl-10"
              />
            </FormField>
          </>
        )}

        <FormField label="Số điện thoại" icon={Phone} error={errors.phone}>
          <input
            value={value.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="0912345678"
            className="input pl-10"
          />
        </FormField>
        <FormField label="Email" icon={Mail} error={errors.email} optional>
          <input
            value={value.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="email@example.com"
            className="input pl-10"
          />
        </FormField>
        <FormField label="Địa chỉ" icon={MapPin} error={errors.address} optional>
          <input
            value={value.address}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="Số nhà, đường, phường/xã..."
            className="input pl-10"
          />
        </FormField>
      </div>
    </div>
  );
}
