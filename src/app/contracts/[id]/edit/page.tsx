"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ContractWizard from "@/components/contract/ContractWizard";
import { DEFAULT_CLAUSES, type ContractFormData } from "@/types";

export default function EditContractPage() {
  useAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [initialFormData, setInitialFormData] = useState<ContractFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/contracts/${params.id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        const contract = data.contract;
        if (contract.status !== "DRAFT") {
          toast.error("Chỉ có thể chỉnh sửa hợp đồng ở trạng thái bản nháp");
          router.replace(`/contracts/${params.id}`);
          return;
        }
        const dataJson = contract.dataJson ?? {};
        setInitialFormData({
          templateId: contract.template.id,
          contractNo: contract.contractNo ?? "",
          landlord: dataJson.landlord,
          tenant: dataJson.tenant,
          clauses: dataJson.clauses !== undefined ? dataJson.clauses : DEFAULT_CLAUSES.map((c) => ({ ...c })),
          property: dataJson.property,
          terms: dataJson.terms,
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 size={28} className="animate-spin" />
      </div>
    );
  }

  if (notFound || !initialFormData) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm font-medium text-slate-600">Không tìm thấy hợp đồng này.</p>
        <Link href="/dashboard" className="btn-outline mt-4 inline-flex">
          <ArrowLeft size={16} /> Về trang tổng quan
        </Link>
      </div>
    );
  }

  return <ContractWizard mode="edit" contractId={params.id} initialFormData={initialFormData} key={params.id} />;
}
