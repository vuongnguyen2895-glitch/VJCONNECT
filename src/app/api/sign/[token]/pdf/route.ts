import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatDateVN } from "@/lib/contract-utils";
import { generateContractHTML, type PdfPartyData } from "@/lib/contract-pdf";
import { DEFAULT_CLAUSES, type ContractClause } from "@/types";

/**
 * GET /api/sign/:token/pdf — Public: view the full contract text before signing.
 * No auth required — access is gated by the unguessable signing token itself,
 * same trust model as GET /api/sign/:token.
 */
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const party = await db.contractParty.findFirst({
    where: { signingUrl: params.token },
    include: { contract: { include: { template: true, parties: true } } },
  });

  if (!party) {
    return NextResponse.json({ error: "Liên kết ký không hợp lệ hoặc đã hết hạn" }, { status: 404 });
  }

  const contract = party.contract;
  const data = contract.dataJson as any;
  const landlordParty = contract.parties.find((p) => p.role === "LANDLORD");
  const tenantParty = contract.parties.find((p) => p.role === "TENANT");

  const buildParty = (p: typeof landlordParty, fallback: any): PdfPartyData => ({
    partyKind: p?.partyKind || fallback?.partyKind || "INDIVIDUAL",
    name: p?.name || fallback?.name || "",
    cccd: p?.cccd || fallback?.cccd || "",
    dob: p?.dob || fallback?.dob || "",
    idIssueDate: p?.idIssueDate ? formatDateVN(p.idIssueDate) : fallback?.idIssueDate || "",
    idIssuePlace: p?.idIssuePlace || fallback?.idIssuePlace || "",
    phone: p?.phone || fallback?.phone || "",
    email: p?.email || fallback?.email || "",
    address: p?.address || fallback?.address || "",
    businessRegNo: p?.businessRegNo || fallback?.businessRegNo || "",
    representativeName: p?.representativeName || fallback?.representativeName || "",
    representativePosition: p?.representativePosition || fallback?.representativePosition || "",
  });

  const clauses: ContractClause[] = data.clauses !== undefined ? data.clauses : DEFAULT_CLAUSES;

  const html = generateContractHTML({
    contractNo: contract.contractNo || "",
    templateName: contract.template.name,
    landlord: buildParty(landlordParty, data.landlord),
    tenant: buildParty(tenantParty, data.tenant),
    property: data.property || {},
    terms: data.terms || {},
    clauses,
    startDate: contract.startDate,
    endDate: contract.endDate,
    rentAmount: contract.rentAmount,
    deposit: contract.deposit,
  });

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
