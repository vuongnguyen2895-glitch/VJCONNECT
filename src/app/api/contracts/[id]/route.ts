import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { createContractSchema } from "@/lib/validations";

/**
 * GET /api/contracts/:id — Get contract details
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    const contract = await db.contract.findUnique({
      where: { id: params.id },
      include: {
        template: true,
        building: true,
        parties: true,
        files: { orderBy: { createdAt: "desc" } },
        activities: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Hợp đồng không tồn tại" }, { status: 404 });
    }

    // Only owner or party can view
    const isOwner = contract.ownerId === user.id;
    const isParty = contract.parties.some((p) => p.userId === user.id);
    if (!isOwner && !isParty) {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    return NextResponse.json({ contract });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}

/**
 * PATCH /api/contracts/:id — Update contract (draft only)
 *
 * Accepts the same shape as POST /api/contracts (the full wizard form data),
 * so a draft can be re-opened in the wizard and re-submitted step by step.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = createContractSchema.parse(body);

    const contract = await db.contract.findUnique({
      where: { id: params.id },
      include: { parties: true },
    });
    if (!contract) {
      return NextResponse.json({ error: "Hợp đồng không tồn tại" }, { status: 404 });
    }
    if (contract.ownerId !== user.id) {
      return NextResponse.json({ error: "Không có quyền chỉnh sửa" }, { status: 403 });
    }
    if (contract.status !== "DRAFT") {
      return NextResponse.json({ error: "Chỉ có thể chỉnh sửa hợp đồng ở trạng thái bản nháp" }, { status: 400 });
    }

    const template = await db.template.findUnique({ where: { id: data.templateId } });
    if (!template || !template.isActive) {
      return NextResponse.json({ error: "Mẫu hợp đồng không hợp lệ" }, { status: 400 });
    }

    if (data.buildingId) {
      const building = await db.building.findUnique({ where: { id: data.buildingId } });
      if (!building || building.ownerId !== user.id) {
        return NextResponse.json({ error: "Nhà/căn hộ không hợp lệ" }, { status: 400 });
      }
    }

    let contractNo = contract.contractNo;
    if (data.contractNo && data.contractNo !== contract.contractNo) {
      const existing = await db.contract.findUnique({ where: { contractNo: data.contractNo } });
      if (existing) {
        return NextResponse.json({ error: "Số hợp đồng này đã được sử dụng" }, { status: 400 });
      }
      contractNo = data.contractNo;
    }

    const startDate = new Date(data.terms.startDate);
    const durationMonths = parseInt(data.terms.duration);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const landlordParty = contract.parties.find((p) => p.role === "LANDLORD");
    const tenantParty = contract.parties.find((p) => p.role === "TENANT");

    const partyUpdateData = (party: typeof data.landlord) => ({
      partyKind: party.partyKind,
      name: party.name,
      cccd: party.cccd || null,
      phone: party.phone,
      email: party.email || null,
      address: party.address || null,
      dob: party.dob || null,
      idIssueDate: party.idIssueDate ? new Date(party.idIssueDate) : null,
      idIssuePlace: party.idIssuePlace || null,
      businessRegNo: party.businessRegNo || null,
      representativeName: party.representativeName || null,
      representativePosition: party.representativePosition || null,
    });

    const updated = await db.contract.update({
      where: { id: params.id },
      data: {
        contractNo,
        templateId: data.templateId,
        title: `HĐ thuê ${template.name} - ${data.property.address}`,
        buildingId: data.buildingId || null,
        roomName: data.roomName || null,
        dataJson: {
          landlord: data.landlord,
          tenant: data.tenant,
          property: data.property,
          terms: data.terms,
          clauses: data.clauses ?? [],
        },
        startDate,
        endDate,
        rentAmount: parseFloat(data.terms.rentAmount) || 0,
        deposit: data.terms.deposit ? parseFloat(data.terms.deposit) : null,
        parties: {
          update: [
            ...(landlordParty ? [{ where: { id: landlordParty.id }, data: partyUpdateData(data.landlord) }] : []),
            ...(tenantParty ? [{ where: { id: tenantParty.id }, data: partyUpdateData(data.tenant) }] : []),
          ],
        },
        activities: {
          create: {
            action: "updated",
            actorId: user.id,
            actorName: user.name,
          },
        },
      },
      include: { template: true, parties: true },
    });

    return NextResponse.json({ contract: updated });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}

/**
 * DELETE /api/contracts/:id — Delete contract (draft only)
 */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    const contract = await db.contract.findUnique({ where: { id: params.id } });
    if (!contract) {
      return NextResponse.json({ error: "Hợp đồng không tồn tại" }, { status: 404 });
    }
    if (contract.ownerId !== user.id) {
      return NextResponse.json({ error: "Không có quyền xóa" }, { status: 403 });
    }
    if (contract.status !== "DRAFT") {
      return NextResponse.json({ error: "Chỉ có thể xóa hợp đồng bản nháp" }, { status: 400 });
    }

    await db.contract.delete({ where: { id: params.id } });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
