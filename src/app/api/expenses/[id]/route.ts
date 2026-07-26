import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

/**
 * DELETE /api/expenses/:id — Remove a mistakenly recorded expense
 */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    const expense = await db.expense.findUnique({ where: { id: params.id } });
    if (!expense) {
      return NextResponse.json({ error: "Không tìm thấy khoản chi phí này" }, { status: 404 });
    }
    if (expense.ownerId !== user.id) {
      return NextResponse.json({ error: "Không có quyền xóa" }, { status: 403 });
    }

    await db.expense.delete({ where: { id: params.id } });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
