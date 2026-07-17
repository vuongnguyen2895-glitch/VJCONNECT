import { ContractStatus, PartyKind, PartyRole, Plan, TemplateCategory } from "@prisma/client";

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
  partyKind: PartyKind;
  name: string;
  cccd: string | null;
  phone: string | null;
  email: string | null;
  dob: string | null;
  idIssueDate: string | null;
  idIssuePlace: string | null;
  businessRegNo: string | null;
  representativeName: string | null;
  representativePosition: string | null;
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
export interface PartyFormData {
  partyKind: "INDIVIDUAL" | "COMPANY";
  name: string;
  phone: string;
  email: string;
  address: string;
  // Individual-only
  cccd: string;
  dob: string;
  idIssueDate: string;
  idIssuePlace: string;
  // Company-only
  businessRegNo: string;
  representativeName: string;
  representativePosition: string;
}

export interface RentPeriodFormData {
  fromDate: string;
  toDate: string;
  amount: string;
}

export type CostMethod = "tenant" | "included" | "fixed";

export interface ContractFormData {
  templateId: string;
  contractNo: string;
  landlord: PartyFormData;
  tenant: PartyFormData;
  property: {
    address: string;
    area: string;
    floor: string;
    rooms: string;
    furniture: string;
    purpose: string;
    plotNo: string;
    mapSheetNo: string;
    landCertNo: string;
    landCertDate: string;
    landCertIssuer: string;
  };
  terms: {
    rentAmount: string;
    rentPeriods: RentPeriodFormData[];
    vatRate: string;
    deposit: string;
    paymentDate: string;
    duration: string;
    startDate: string;
    costManagement: CostMethod;
    costElectricity: CostMethod;
    costWater: CostMethod;
    costInternet: CostMethod;
    otherAgreement: string;
    bankAccountName: string;
    bankAccountNumber: string;
    bankName: string;
  };
}

const INITIAL_PARTY_DATA: PartyFormData = {
  partyKind: "INDIVIDUAL",
  name: "",
  phone: "",
  email: "",
  address: "",
  cccd: "",
  dob: "",
  idIssueDate: "",
  idIssuePlace: "",
  businessRegNo: "",
  representativeName: "",
  representativePosition: "",
};

export const INITIAL_FORM_DATA: ContractFormData = {
  templateId: "",
  contractNo: "",
  landlord: { ...INITIAL_PARTY_DATA },
  tenant: { ...INITIAL_PARTY_DATA },
  property: {
    address: "",
    area: "",
    floor: "",
    rooms: "",
    furniture: "",
    purpose: "",
    plotNo: "",
    mapSheetNo: "",
    landCertNo: "",
    landCertDate: "",
    landCertIssuer: "",
  },
  terms: {
    rentAmount: "",
    rentPeriods: [],
    vatRate: "",
    deposit: "",
    paymentDate: "5",
    duration: "12",
    startDate: "",
    costManagement: "tenant",
    costElectricity: "tenant",
    costWater: "tenant",
    costInternet: "tenant",
    otherAgreement: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankName: "",
  },
};
