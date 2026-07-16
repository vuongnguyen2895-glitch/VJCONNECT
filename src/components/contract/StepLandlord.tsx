import { CreditCard, MapPin, Phone, User as UserIcon } from "lucide-react";
import FormField from "./FormField";
import type { ContractFormData } from "@/types";

interface StepLandlordProps {
  value: ContractFormData["landlord"];
  errors: Partial<Record<keyof ContractFormData["landlord"], string>>;
  onChange: (field: keyof ContractFormData["landlord"], value: string) => void;
}

export default function StepLandlord({ value, errors, onChange }: StepLandlordProps) {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900">Thông tin bên cho thuê (Bên A)</h2>
      <p className="mt-1 text-sm text-slate-500">Thông tin chủ nhà hoặc người đại diện cho thuê.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Họ và tên" icon={UserIcon} error={errors.name}>
          <input
            value={value.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Nguyễn Văn A"
            className="input pl-10"
          />
        </FormField>
        <FormField label="Số CCCD/CMND" icon={CreditCard} error={errors.cccd}>
          <input
            value={value.cccd}
            onChange={(e) => onChange("cccd", e.target.value)}
            placeholder="079123456789"
            className="input pl-10"
          />
        </FormField>
        <FormField label="Số điện thoại" icon={Phone} error={errors.phone}>
          <input
            value={value.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="0912345678"
            className="input pl-10"
          />
        </FormField>
        <FormField label="Địa chỉ thường trú" icon={MapPin} error={errors.address} optional>
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
