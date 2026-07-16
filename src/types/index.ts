import { ContractStatus, PartyRole, Plan, TemplateCategory } from "@prisma/client";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  plan: Plan;
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  category: TemplateCategory;
  description: string | null;
  icon: string | null;
  isPremium: boolean;
  contentJson: any;
}

export interface ContractParty {
  id: string;
  role: PartyRole;
  name: string;
  cccd: string | null;
  phone: string | null;
  email: string | null;
  signedAt: string | null;
}

export interface Contract {
  id: string;
  contractNo: string | null;
  status: ContractStatus;
  title: string | null;
  dataJson: any;
  startDate: string | null;
  endDate: string | null;
  rentAmount: string | null;
  deposit: string | null;
  createdAt: string;
  updatedAt: string;
  template: { name: string; icon: string | null; category: TemplateCategory };
  parties: ContractParty[];
}

export interface DashboardStats {
  total: number;
  signed: number;
  pending: number;
  draft: number;
  expiringSoon: number;
}

// Contract form wizard steps
export interface ContractFormData {
  templateId: string;
  landlord: {
    name: string;
    cccd: string;
    phone: string;
    address: string;
  };
  tenant: {
    name: string;
    cccd: string;
    phone: string;
    email: string;
  };
  property: {
    address: string;
    area: string;
    floor: string;
    rooms: string;
    furniture: string;
  };
  terms: {
    rentAmount: string;
    deposit: string;
    paymentDate: string;
    duration: string;
    startDate: string;
    utilities: "tenant" | "included" | "fixed";
  };
}

export const INITIAL_FORM_DATA: ContractFormData = {
  templateId: "",
  landlord: { name: "", cccd: "", phone: "", address: "" },
  tenant: { name: "", cccd: "", phone: "", email: "" },
  property: { address: "", area: "", floor: "", rooms: "", furniture: "" },
  terms: { rentAmount: "", deposit: "", paymentDate: "5", duration: "12", startDate: "", utilities: "tenant" },
};
