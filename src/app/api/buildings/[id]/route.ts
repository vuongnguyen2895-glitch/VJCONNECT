import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { buildingSchema } from "@/lib/validations";

/**
 * GET /api/buildings/:id — Building detail, including its rooms (contracts)
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    const building = await db.building.findUnique({
      where: { id: params.id },
      include: {
        contracts: {
          select: {
            id: true,
            contractNo: true,
            roomName: true,
            status: true,
            rentAmount: true,
            parties: { select: { name: true, role: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!building) {
      return NextResponse.json({ error: "Không tìm thấy nhà/căn hộ này" }, { status: 404 });
    }
    if (building.ownerId !== user.id) {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    return NextResponse.json({ building });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}

/**
 * PATCH /api/buildings/:id — Update building info / prices
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = buildingSchema.parse(body);

    const building = await db.building.findUnique({ where: { id: params.id } });
    if (!building) {
      return NextResponse.json({ error: "Không tìm thấy nhà/căn hộ này" }, { status: 404 });
    }
    if (building.ownerId !== user.id) {
      return NextResponse.json({ error: "Không có quyền chỉnh sửa" }, { status: 403 });
    }

    const updated = await db.building.update({
      where: { id: params.id },
      data: {
        name: data.name,
        address: data.address || null,
        electricityPrice: data.electricityPrice ? parseFloat(data.electricityPrice) : null,
        waterPrice: data.waterPrice ? parseFloat(data.waterPrice) : null,
      },
    });

    return NextResponse.json({ building: updated });
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
 * DELETE /api/buildings/:id — Delete a building (only if no rooms/contracts attached)
 */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    const building = await db.building.findUnique({
      where: { id: params.id },
      include: { _count: { select: { contracts: true } } },
    });
    if (!building) {
      return NextResponse.json({ error: "Không tìm thấy nhà/căn hộ này" }, { status: 404 });
    }
    if (building.ownerId !== user.id) {
      return NextResponse.json({ error: "Không có quyền xóa" }, { status: 403 });
    }
    if (building._count.contracts > 0) {
      return NextResponse.json(
        { error: "Không thể xóa nhà đang có hợp đồng/phòng liên kết" },
        { status: 400 },
      );
    }

    await db.building.delete({ where: { id: params.id } });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
