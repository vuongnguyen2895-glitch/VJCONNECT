import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { formatDateVN } from "@/lib/contract-utils";
import { generateContractHTML, type PdfPartyData } from "@/lib/contract-pdf";
import { DEFAULT_CLAUSES, type ContractClause } from "@/types";

/**
 * GET /api/contracts/:id/pdf — Generate PDF for contract (owner-only)
 *
 * Approach: Generate HTML → convert to PDF
 * In production, use Puppeteer or a PDF service
 * For MVP, we return HTML that can be printed to PDF
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    const contract = await db.contract.findUnique({
      where: { id: params.id },
      include: { template: true, parties: true },
    });

    if (!contract) {
      return NextResponse.json({ error: "Hợp đồng không tồn tại" }, { status: 404 });
    }
    if (contract.ownerId !== user.id) {
      return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
    }

    const data = contract.dataJson as any;
    const landlordParty = contract.parties.find((p) => p.role === "LANDLORD");
    const tenantParty = contract.parties.find((p) => p.role === "TENANT");

    const buildParty = (party: typeof landlordParty, fallback: any): PdfPartyData => ({
      partyKind: party?.partyKind || fallback?.partyKind || "INDIVIDUAL",
      name: party?.name || fallback?.name || "",
      cccd: party?.cccd || fallback?.cccd || "",
      dob: party?.dob || fallback?.dob || "",
      idIssueDate: party?.idIssueDate ? formatDateVN(party.idIssueDate) : fallback?.idIssueDate || "",
      idIssuePlace: party?.idIssuePlace || fallback?.idIssuePlace || "",
      phone: party?.phone || fallback?.phone || "",
      email: party?.email || fallback?.email || "",
      address: party?.address || fallback?.address || "",
      businessRegNo: party?.businessRegNo || fallback?.businessRegNo || "",
      representativeName: party?.representativeName || fallback?.representativeName || "",
      representativePosition: party?.representativePosition || fallback?.representativePosition || "",
    });

    // Contracts created before the custom-clauses feature have no `clauses` key at all —
    // fall back to the same default legal articles so their PDF is unchanged.
    // Contracts created after always have a real (possibly empty, if the user cleared it) array.
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
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
