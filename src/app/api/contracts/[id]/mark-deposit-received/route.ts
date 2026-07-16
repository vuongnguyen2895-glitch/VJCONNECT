import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

/**
 * POST /api/contracts/:id/mark-deposit-received — Log that the deposit has been received
 *
 * Lightweight tracking via the activity log — no dedicated payment schema yet.
 */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    const contract = await db.contract.findUnique({ where: { id: params.id } });
    if (!contract) {
      return NextResponse.json({ error: "Hợp đồng không tồn tại" }, { status: 404 });
    }
    if (contract.ownerId !== user.id) {
      return NextResponse.json({ error: "Không có quyền thực hiện" }, { status: 403 });
    }

    await db.contractActivity.create({
      data: {
        contractId: contract.id,
        action: "deposit_received",
        actorId: user.id,
        actorName: user.name,
        metadata: { amount: contract.deposit ? contract.deposit.toString() : null },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    console.error("Mark deposit received error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
