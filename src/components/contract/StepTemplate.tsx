import { Hash, Loader2 } from "lucide-react";
import FormField from "./FormField";
import type { Template } from "@/types";

interface StepTemplateProps {
  templates: Template[];
  loading: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
  contractNo: string;
  contractNoError?: string;
  onContractNoChange: (value: string) => void;
}

export default function StepTemplate({
  templates,
  loading,
  selectedId,
  onSelect,
  contractNo,
  contractNoError,
  onContractNoChange,
}: StepTemplateProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900">Chọn mẫu hợp đồng</h2>
      <p className="mt-1 text-sm text-slate-500">Chọn đúng loại tài sản để áp dụng điều khoản phù hợp.</p>

      <div className="mt-6 max-w-xs">
        <FormField label="Số hợp đồng" icon={Hash} error={contractNoError} optional>
          <input
            value={contractNo}
            onChange={(e) => onContractNoChange(e.target.value)}
            placeholder="VD: 201125/HĐTN"
            className="input pl-10"
          />
        </FormField>
        <p className="mt-1.5 text-xs text-slate-400">Để trống sẽ tự động tạo theo định dạng VJC-2026-00001.</p>
      </div>

      {templates.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">Không có mẫu hợp đồng nào khả dụng.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {templates.map((template) => {
            const selected = template.id === selectedId;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onSelect(template.id)}
                className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                  selected ? "border-brand-500 bg-brand-50/50" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                  {template.icon ?? "📄"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">{template.name}</p>
                    {template.isPremium && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                        Cao cấp
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{template.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
