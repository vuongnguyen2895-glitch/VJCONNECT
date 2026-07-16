import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

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
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const contract = await db.contract.findUnique({ where: { id: params.id } });
    if (!contract) {
      return NextResponse.json({ error: "Hợp đồng không tồn tại" }, { status: 404 });
    }
    if (contract.ownerId !== user.id) {
      return NextResponse.json({ error: "Không có quyền chỉnh sửa" }, { status: 403 });
    }
    if (contract.status !== "DRAFT") {
      return NextResponse.json({ error: "Chỉ có thể chỉnh sửa hợp đồng ở trạng thái bản nháp" }, { status: 400 });
    }

    const updated = await db.contract.update({
      where: { id: params.id },
      data: {
        dataJson: body.dataJson ?? contract.dataJson,
        title: body.title ?? contract.title,
        rentAmount: body.rentAmount ?? contract.rentAmount,
        deposit: body.deposit ?? contract.deposit,
        startDate: body.startDate ? new Date(body.startDate) : contract.startDate,
        endDate: body.endDate ? new Date(body.endDate) : contract.endDate,
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
