import { CreditCard, Mail, Phone, User as UserIcon } from "lucide-react";
import FormField from "./FormField";
import type { ContractFormData } from "@/types";

interface StepTenantProps {
  value: ContractFormData["tenant"];
  errors: Partial<Record<keyof ContractFormData["tenant"], string>>;
  onChange: (field: keyof ContractFormData["tenant"], value: string) => void;
}

export default function StepTenant({ value, errors, onChange }: StepTenantProps) {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900">Thông tin bên thuê (Bên B)</h2>
      <p className="mt-1 text-sm text-slate-500">Thông tin người sẽ thuê tài sản.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Họ và tên" icon={UserIcon} error={errors.name}>
          <input
            value={value.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Trần Thị B"
            className="input pl-10"
          />
        </FormField>
        <FormField label="Số CCCD/CMND" icon={CreditCard} error={errors.cccd}>
          <input
            value={value.cccd}
            onChange={(e) => onChange("cccd", e.target.value)}
            placeholder="079987654321"
            className="input pl-10"
          />
        </FormField>
        <FormField label="Số điện thoại" icon={Phone} error={errors.phone}>
          <input
            value={value.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="0987654321"
            className="input pl-10"
          />
        </FormField>
        <FormField label="Email" icon={Mail} error={errors.email} optional>
          <input
            value={value.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="tenant@email.com"
            className="input pl-10"
          />
        </FormField>
      </div>
    </div>
  );
}
