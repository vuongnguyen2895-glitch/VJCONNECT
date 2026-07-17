"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createContractSchema, landlordSchema, propertySchema, tenantSchema, termsSchema } from "@/lib/validations";
import { INITIAL_FORM_DATA, type ContractFormData, type RentPeriodFormData, type Template } from "@/types";
import WizardProgress from "@/components/contract/WizardProgress";
import StepTemplate from "@/components/contract/StepTemplate";
import StepParty from "@/components/contract/StepParty";
import StepPropertyTerms from "@/components/contract/StepPropertyTerms";
import StepReview from "@/components/contract/StepReview";

const STEP_LABELS = ["Chọn mẫu", "Bên cho thuê", "Bên thuê", "Tài sản & điều khoản", "Xem lại"];
const DRAFT_STORAGE_KEY = "vjconnect_contract_draft";

export default function NewContractPage() {
  useAuth();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [formData, setFormData] = useState<ContractFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setTemplates(data.templates))
      .catch(() => toast.error("Không thể tải danh sách mẫu hợp đồng"))
      .finally(() => setTemplatesLoading(false));
  }, []);

  // Restore an auto-saved draft, if any, once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { formData: ContractFormData; step: number };
        setFormData(saved.formData);
        setStep(saved.step);
        toast.success("Đã khôi phục bản nháp đang nhập dở");
      }
    } catch {
      // Ignore corrupt/unreadable draft data
    } finally {
      setDraftRestored(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save the draft as the user fills in the wizard
  useEffect(() => {
    if (!draftRestored) return; // avoid overwriting the saved draft before it's restored
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ formData, step }));
  }, [formData, step, draftRestored]);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === formData.templateId),
    [templates, formData.templateId],
  );

  const updateContractNo = (value: string) => {
    setFormData((prev) => ({ ...prev, contractNo: value }));
  };
  const updateLandlord = (field: keyof ContractFormData["landlord"], value: string) => {
    setFormData((prev) => ({ ...prev, landlord: { ...prev.landlord, [field]: value } }));
  };
  const updateTenant = (field: keyof ContractFormData["tenant"], value: string) => {
    setFormData((prev) => ({ ...prev, tenant: { ...prev.tenant, [field]: value } }));
  };
  const updateProperty = (field: keyof ContractFormData["property"], value: string) => {
    setFormData((prev) => ({ ...prev, property: { ...prev.property, [field]: value } }));
  };
  const updateTerms = (field: keyof ContractFormData["terms"], value: string) => {
    setFormData((prev) => ({ ...prev, terms: { ...prev.terms, [field]: value } as ContractFormData["terms"] }));
  };
  const addRentPeriod = () => {
    setFormData((prev) => ({
      ...prev,
      terms: { ...prev.terms, rentPeriods: [...prev.terms.rentPeriods, { fromDate: "", toDate: "", amount: "" }] },
    }));
  };
  const removeRentPeriod = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      terms: { ...prev.terms, rentPeriods: prev.terms.rentPeriods.filter((_, i) => i !== index) },
    }));
  };
  const updateRentPeriod = (index: number, field: keyof RentPeriodFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      terms: {
        ...prev.terms,
        rentPeriods: prev.terms.rentPeriods.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
      },
    }));
  };

  function applyErrors(issues: { path: (string | number)[]; message: string }[]): boolean {
    const next: Record<string, string> = {};
    issues.forEach((issue) => {
      next[String(issue.path[0])] = issue.message;
    });
    setErrors((prev) => ({ ...prev, ...next }));
    return false;
  }

  function validateStep(index: number): boolean {
    setErrors({});

    if (index === 0) {
      if (!formData.templateId) {
        toast.error("Vui lòng chọn mẫu hợp đồng");
        return false;
      }
      return true;
    }
    if (index === 1) {
      const result = landlordSchema.safeParse(formData.landlord);
      return result.success || applyErrors(result.error.issues);
    }
    if (index === 2) {
      const result = tenantSchema.safeParse(formData.tenant);
      return result.success || applyErrors(result.error.issues);
    }
    if (index === 3) {
      const propertyResult = propertySchema.safeParse(formData.property);
      const termsResult = termsSchema.safeParse(formData.terms);
      let ok = true;
      if (!propertyResult.success) ok = applyErrors(propertyResult.error.issues) && ok;
      if (!termsResult.success) ok = applyErrors(termsResult.error.issues) && ok;
      return ok;
    }
    return true;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    const parsed = createContractSchema.safeParse(formData);
    if (!parsed.success) {
      toast.error("Vui lòng kiểm tra lại thông tin đã nhập");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Không thể tạo hợp đồng");
        return;
      }
      toast.success("Đã tạo hợp đồng thành công!");
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      router.push(`/contracts/${result.contract.id}`);
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card p-6 sm:p-8">
      <WizardProgress steps={STEP_LABELS} currentStep={step} onStepClick={setStep} />

      <div className="mt-8">
        {step === 0 && (
          <StepTemplate
            templates={templates}
            loading={templatesLoading}
            selectedId={formData.templateId}
            onSelect={(id) => setFormData((prev) => ({ ...prev, templateId: id }))}
            contractNo={formData.contractNo}
            contractNoError={errors.contractNo}
            onContractNoChange={updateContractNo}
          />
        )}
        {step === 1 && (
          <StepParty
            title="Thông tin bên cho thuê (Bên A)"
            subtitle="Chủ nhà hoặc công ty đại diện cho thuê."
            value={formData.landlord}
            errors={errors}
            onChange={updateLandlord}
          />
        )}
        {step === 2 && (
          <StepParty
            title="Thông tin bên thuê (Bên B)"
            subtitle="Người hoặc công ty sẽ thuê tài sản."
            value={formData.tenant}
            errors={errors}
            onChange={updateTenant}
          />
        )}
        {step === 3 && (
          <StepPropertyTerms
            property={formData.property}
            terms={formData.terms}
            errors={errors}
            onPropertyChange={updateProperty}
            onTermsChange={updateTerms}
            onAddRentPeriod={addRentPeriod}
            onRemoveRentPeriod={removeRentPeriod}
            onRentPeriodChange={updateRentPeriod}
          />
        )}
        {step === 4 && (
          <StepReview
            data={formData}
            template={selectedTemplate}
            submitting={submitting}
            onEditStep={setStep}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      {step < STEP_LABELS.length - 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
          <button type="button" onClick={goBack} disabled={step === 0} className="btn-secondary disabled:invisible">
            <ArrowLeft size={16} /> Quay lại
          </button>
          <button type="button" onClick={goNext} className="btn-primary">
            Tiếp theo <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
