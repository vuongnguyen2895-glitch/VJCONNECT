import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { createExpenseSchema } from "@/lib/validations";

/**
 * GET /api/expenses — List this user's expenses, most recent first
 */
export async function GET() {
  try {
    const user = await requireAuth();

    const expenses = await db.expense.findMany({
      where: { ownerId: user.id },
      include: { building: { select: { id: true, name: true } } },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ expenses });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    console.error("List expenses error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}

/**
 * POST /api/expenses — Record a new operating expense
 */
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = createExpenseSchema.parse(body);

    if (data.buildingId) {
      const building = await db.building.findUnique({ where: { id: data.buildingId } });
      if (!building || building.ownerId !== user.id) {
        return NextResponse.json({ error: "Nhà/căn hộ không hợp lệ" }, { status: 400 });
      }
    }

    const expense = await db.expense.create({
      data: {
        ownerId: user.id,
        buildingId: data.buildingId || null,
        category: data.category,
        amount: parseFloat(data.amount) || 0,
        date: new Date(data.date),
        note: data.note || null,
      },
      include: { building: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ", details: error.errors }, { status: 400 });
    }
    console.error("Create expense error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
