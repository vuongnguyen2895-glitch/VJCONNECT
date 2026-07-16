import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface FormFieldProps {
  label: string;
  icon: LucideIcon;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}

export default function FormField({ label, icon: Icon, error, optional, children }: FormFieldProps) {
  return (
    <div>
      <label className="label">
        {label} {optional && <span className="font-normal text-slate-400">(không bắt buộc)</span>}
      </label>
      <div className="relative">
        <Icon size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        {children}
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
