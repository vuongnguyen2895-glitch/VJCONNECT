import { ArrowDown, ArrowUp, FileText, Plus, Trash2 } from "lucide-react";
import type { ContractClause } from "@/types";

interface StepClausesProps {
  clauses: ContractClause[];
  errors: Partial<Record<string, string>>;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: "up" | "down") => void;
  onChange: (index: number, field: "title" | "content", value: string) => void;
}

export default function StepClauses({ clauses, errors, onAdd, onRemove, onMove, onChange }: StepClausesProps) {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900">Điều khoản chi tiết</h2>
      <p className="mt-1 text-sm text-slate-500">
        Đây là các điều khoản pháp lý (quyền và nghĩa vụ, chấm dứt hợp đồng, bất khả kháng...) đã được soạn sẵn theo
        mẫu chuẩn. Bạn có thể sửa nội dung, xoá bớt hoặc thêm điều khoản riêng cho hợp đồng này.
      </p>

      {clauses.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <FileText size={20} />
          </span>
          <p className="text-sm text-slate-500">Chưa có điều khoản nào.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {clauses.map((clause, index) => (
            <div key={clause.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-2.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    value={clause.title}
                    onChange={(e) => onChange(index, "title", e.target.value)}
                    placeholder="Tiêu đề điều khoản (VD: Quyền và nghĩa vụ của Bên A)"
                    className="input text-sm font-semibold"
                  />
                  {errors[`clauses.${index}.title`] && (
                    <p className="text-xs font-medium text-red-600">{errors[`clauses.${index}.title`]}</p>
                  )}
                  <textarea
                    value={clause.content}
                    onChange={(e) => onChange(index, "content", e.target.value)}
                    placeholder="Nội dung điều khoản..."
                    rows={5}
                    className="input resize-y text-sm leading-relaxed"
                  />
                  {errors[`clauses.${index}.content`] && (
                    <p className="text-xs font-medium text-red-600">{errors[`clauses.${index}.content`]}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => onMove(index, "up")}
                    disabled={index === 0}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:invisible"
                    aria-label="Di chuyển lên"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(index, "down")}
                    disabled={index === clauses.length - 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:invisible"
                    aria-label="Di chuyển xuống"
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Xoá điều khoản"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button type="button" onClick={onAdd} className="btn-secondary mt-4 text-sm">
        <Plus size={16} /> Thêm điều khoản mới
      </button>
    </div>
  );
}
