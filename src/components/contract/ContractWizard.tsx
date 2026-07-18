"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { clauseSchema, createContractSchema, landlordSchema, propertySchema, tenantSchema, termsSchema } from "@/lib/validations";
import { INITIAL_FORM_DATA, type ContractFormData, type RentPeriodFormData, type Template } from "@/types";
import WizardProgress from "@/components/contract/WizardProgress";
import StepTemplate from "@/components/contract/StepTemplate";
import StepParty from "@/components/contract/StepParty";
import StepPropertyTerms from "@/components/contract/StepPropertyTerms";
import StepClauses from "@/components/contract/StepClauses";
import StepReview from "@/components/contract/StepReview";
import type { BuildingOption } from "@/components/contract/BuildingSelect";

const STEP_LABELS = ["Chọn mẫu", "Bên cho thuê", "Bên thuê", "Tài sản & điều khoản", "Điều khoản", "Xem lại"];
const DRAFT_STORAGE_KEY = "vjconnect_contract_draft";

type ContractWizardProps =
  | { mode: "create"; contractId?: undefined; initialFormData?: undefined }
  | { mode: "edit"; contractId: string; initialFormData: ContractFormData };

export default function ContractWizard({ mode, contractId, initialFormData }: ContractWizardProps) {
  useAuth();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [buildings, setBuildings] = useState<BuildingOption[]>([]);
  const [buildingsLoading, setBuildingsLoading] = useState(true);
  const [formData, setFormData] = useState<ContractFormData>(mode === "edit" ? initialFormData : INITIAL_FORM_DATA);
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

  useEffect(() => {
    fetch("/api/buildings")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setBuildings(data.buildings))
      .catch(() => toast.error("Không thể tải danh sách nhà/căn hộ"))
      .finally(() => setBuildingsLoading(false));
  }, []);

  // Restore an auto-saved draft, if any, once on mount (create mode only — edit mode already
  // has real, persisted data loaded from the server)
  useEffect(() => {
    if (mode !== "create") {
      setDraftRestored(true);
      return;
    }
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { formData: ContractFormData; step: number };
        // Drafts saved before the clauses step existed lack a `clauses` key — backfill it
        // so StepClauses doesn't crash on `clauses.length` of undefined.
        setFormData({ ...INITIAL_FORM_DATA, ...saved.formData, clauses: saved.formData.clauses ?? INITIAL_FORM_DATA.clauses });
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

  // Auto-save the draft as the user fills in the wizard (create mode only)
  useEffect(() => {
    if (mode !== "create" || !draftRestored) return;
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ formData, step }));
  }, [formData, step, draftRestored, mode]);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === formData.templateId),
    [templates, formData.templateId],
  );
  const selectedBuilding = useMemo(
    () => buildings.find((b) => b.id === formData.buildingId),
    [buildings, formData.buildingId],
  );

  const updateContractNo = (value: string) => {
    setFormData((prev) => ({ ...prev, contractNo: value }));
  };
  const updateBuildingId = (value: string) => {
    setFormData((prev) => ({ ...prev, buildingId: value }));
  };
  const updateRoomName = (value: string) => {
    setFormData((prev) => ({ ...prev, roomName: value }));
  };
  const handleBuildingCreated = (building: BuildingOption) => {
    setBuildings((prev) => [building, ...prev]);
    updateBuildingId(building.id);
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

  const addClause = () => {
    setFormData((prev) => ({
      ...prev,
      clauses: [...prev.clauses, { id: crypto.randomUUID(), title: "", content: "" }],
    }));
  };
  const removeClause = (index: number) => {
    setFormData((prev) => ({ ...prev, clauses: prev.clauses.filter((_, i) => i !== index) }));
  };
  const moveClause = (index: number, direction: "up" | "down") => {
    setFormData((prev) => {
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.clauses.length) return prev;
      const clauses = [...prev.clauses];
      [clauses[index], clauses[target]] = [clauses[target], clauses[index]];
      return { ...prev, clauses };
    });
  };
  const updateClause = (index: number, field: "title" | "content", value: string) => {
    setFormData((prev) => ({
      ...prev,
      clauses: prev.clauses.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    }));
  };

  function applyErrors(issues: { path: (string | number)[]; message: string }[]): boolean {
    const next: Record<string, string> = {};
    issues.forEach((issue) => {
      next[issue.path.join(".")] = issue.message;
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
    if (index === 4) {
      let ok = true;
      const next: Record<string, string> = {};
      formData.clauses.forEach((clause, i) => {
        const result = clauseSchema.safeParse(clause);
        if (!result.success) {
          ok = false;
          result.error.issues.forEach((issue) => {
            next[`clauses.${i}.${issue.path.join(".")}`] = issue.message;
          });
        }
      });
      if (!ok) setErrors((prev) => ({ ...prev, ...next }));
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
      const url = mode === "create" ? "/api/contracts" : `/api/contracts/${contractId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || (mode === "create" ? "Không thể tạo hợp đồng" : "Không thể lưu thay đổi"));
        return;
      }
      toast.success(mode === "create" ? "Đã tạo hợp đồng thành công!" : "Đã lưu thay đổi hợp đồng!");
      if (mode === "create") localStorage.removeItem(DRAFT_STORAGE_KEY);
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
            buildingId={formData.buildingId}
            roomName={formData.roomName}
            buildings={buildings}
            buildingsLoading={buildingsLoading}
            property={formData.property}
            terms={formData.terms}
            errors={errors}
            onBuildingIdChange={updateBuildingId}
            onBuildingCreated={handleBuildingCreated}
            onRoomNameChange={updateRoomName}
            onPropertyChange={updateProperty}
            onTermsChange={updateTerms}
            onAddRentPeriod={addRentPeriod}
            onRemoveRentPeriod={removeRentPeriod}
            onRentPeriodChange={updateRentPeriod}
          />
        )}
        {step === 4 && (
          <StepClauses
            clauses={formData.clauses}
            errors={errors}
            onAdd={addClause}
            onRemove={removeClause}
            onMove={moveClause}
            onChange={updateClause}
          />
        )}
        {step === 5 && (
          <StepReview
            data={formData}
            template={selectedTemplate}
            buildingName={selectedBuilding?.name}
            submitting={submitting}
            submitLabel={mode === "create" ? "Tạo hợp đồng" : "Lưu thay đổi"}
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
