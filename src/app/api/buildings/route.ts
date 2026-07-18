import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { buildingSchema } from "@/lib/validations";

/**
 * GET /api/buildings — List current user's buildings, with room (contract) counts
 */
export async function GET() {
  try {
    const user = await requireAuth();

    const buildings = await db.building.findMany({
      where: { ownerId: user.id },
      include: { _count: { select: { contracts: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ buildings });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}

/**
 * POST /api/buildings — Create a new building (nhà/căn hộ)
 */
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = buildingSchema.parse(body);

    const building = await db.building.create({
      data: {
        ownerId: user.id,
        name: data.name,
        address: data.address || null,
        electricityPrice: data.electricityPrice ? parseFloat(data.electricityPrice) : null,
        waterPrice: data.waterPrice ? parseFloat(data.waterPrice) : null,
      },
    });

    return NextResponse.json({ building }, { status: 201 });
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
