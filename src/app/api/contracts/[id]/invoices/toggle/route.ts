import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const toggleSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
  status: z.enum(["PAID", "UNPAID"]),
});

/**
 * PATCH /api/contracts/:id/invoices/toggle — Quick paid/unpaid mark for a given month from
 * the rent-roll grid. Creates a rent-only invoice for that month if none exists yet
 * ("tự động liên kết"), or just flips the status of the existing one.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { year, month, status } = toggleSchema.parse(body);

    const contract = await db.contract.findUnique({ where: { id: params.id } });
    if (!contract) {
      return NextResponse.json({ error: "Hợp đồng không tồn tại" }, { status: 404 });
    }
    if (contract.ownerId !== user.id) {
      return NextResponse.json({ error: "Không có quyền chỉnh sửa" }, { status: 403 });
    }

    const rentAmount = contract.rentAmount ? Number(contract.rentAmount) : 0;

    const invoice = await db.invoice.upsert({
      where: { contractId_year_month: { contractId: params.id, year, month } },
      update: { status, paidAt: status === "PAID" ? new Date() : null },
      create: {
        contractId: params.id,
        year,
        month,
        rentAmount,
        totalAmount: rentAmount,
        status,
        paidAt: status === "PAID" ? new Date() : null,
      },
    });

    return NextResponse.json({ invoice });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }
    console.error("Toggle invoice error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
