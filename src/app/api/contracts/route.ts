import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { createContractSchema } from "@/lib/validations";
import { generateContractNo, canCreateContract } from "@/lib/contract-utils";
import { ContractStatus, PartyRole } from "@prisma/client";

/**
 * GET /api/contracts — List user's contracts
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as ContractStatus | null;
    const search = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = { ownerId: user.id };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { contractNo: { contains: search, mode: "insensitive" } },
        { parties: { some: { name: { contains: search, mode: "insensitive" } } } },
      ];
    }

    const [contracts, total] = await Promise.all([
      db.contract.findMany({
        where,
        include: {
          template: { select: { name: true, icon: true, category: true } },
          parties: { select: { name: true, role: true, signedAt: true } },
          _count: { select: { files: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.contract.count({ where }),
    ]);

    return NextResponse.json({
      contracts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    console.error("List contracts error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}

/**
 * POST /api/contracts — Create new contract
 */
export async function POST(req: Request) {
  try {
    const user = await requireAuth();

    // Check plan limits
    const { allowed, reason } = await canCreateContract(user.id);
    if (!allowed) {
      return NextResponse.json({ error: reason }, { status: 403 });
    }

    const body = await req.json();
    const data = createContractSchema.parse(body);

    // Verify template exists
    const template = await db.template.findUnique({ where: { id: data.templateId } });
    if (!template || !template.isActive) {
      return NextResponse.json({ error: "Mẫu hợp đồng không hợp lệ" }, { status: 400 });
    }

    // Generate contract number
    const contractNo = await generateContractNo();

    // Calculate dates
    const startDate = new Date(data.terms.startDate);
    const durationMonths = parseInt(data.terms.duration);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    // Create contract with parties
    const contract = await db.contract.create({
      data: {
        contractNo,
        templateId: data.templateId,
        ownerId: user.id,
        status: ContractStatus.DRAFT,
        title: `HĐ thuê ${template.name} - ${data.property.address}`,
        dataJson: {
          landlord: data.landlord,
          tenant: data.tenant,
          property: data.property,
          terms: data.terms,
        },
        startDate,
        endDate,
        rentAmount: parseFloat(data.terms.rentAmount) || 0,
        deposit: data.terms.deposit ? parseFloat(data.terms.deposit) : null,
        parties: {
          createMany: {
            data: [
              {
                role: PartyRole.LANDLORD,
                partyKind: data.landlord.partyKind,
                name: data.landlord.name,
                cccd: data.landlord.cccd || null,
                phone: data.landlord.phone,
                email: data.landlord.email || null,
                address: data.landlord.address || null,
                dob: data.landlord.dob || null,
                idIssueDate: data.landlord.idIssueDate ? new Date(data.landlord.idIssueDate) : null,
                idIssuePlace: data.landlord.idIssuePlace || null,
                businessRegNo: data.landlord.businessRegNo || null,
                representativeName: data.landlord.representativeName || null,
                representativePosition: data.landlord.representativePosition || null,
              },
              {
                role: PartyRole.TENANT,
                partyKind: data.tenant.partyKind,
                name: data.tenant.name,
                cccd: data.tenant.cccd || null,
                phone: data.tenant.phone,
                email: data.tenant.email || null,
                address: data.tenant.address || null,
                dob: data.tenant.dob || null,
                idIssueDate: data.tenant.idIssueDate ? new Date(data.tenant.idIssueDate) : null,
                idIssuePlace: data.tenant.idIssuePlace || null,
                businessRegNo: data.tenant.businessRegNo || null,
                representativeName: data.tenant.representativeName || null,
                representativePosition: data.tenant.representativePosition || null,
              },
            ],
          },
        },
        activities: {
          create: {
            action: "created",
            actorId: user.id,
            actorName: user.name,
            metadata: { templateName: template.name },
          },
        },
      },
      include: {
        template: { select: { name: true, icon: true } },
        parties: true,
      },
    });

    return NextResponse.json({ contract }, { status: 201 });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Create contract error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
