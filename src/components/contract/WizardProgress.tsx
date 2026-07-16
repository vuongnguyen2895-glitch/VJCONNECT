import { Check } from "lucide-react";

interface WizardProgressProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

export default function WizardProgress({ steps, currentStep, onStepClick }: WizardProgressProps) {
  return (
    <ol className="flex items-center">
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const clickable = Boolean(onStepClick) && isCompleted;

        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick?.(index)}
              className="flex flex-col items-center gap-2 disabled:cursor-default"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  isCompleted
                    ? "bg-brand-600 text-white"
                    : isCurrent
                      ? "bg-brand-50 text-brand-700 ring-2 ring-brand-500"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {isCompleted ? <Check size={16} /> : index + 1}
              </span>
              <span className={`hidden text-xs font-medium sm:block ${isCurrent ? "text-brand-700" : "text-slate-400"}`}>
                {label}
              </span>
            </button>
            {index < steps.length - 1 && (
              <span className={`mx-2 h-px flex-1 ${isCompleted ? "bg-brand-500" : "bg-slate-200"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
