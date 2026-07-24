import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

const ALLOWED = ["SIGNED", "TERMINATED"] as const;

/**
 * PATCH /api/contracts/:id/status — Toggle occupancy status between "còn ở" (SIGNED)
 * and "không còn ở" (TERMINATED) for an already-signed contract, from the tenant directory.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const { status } = await req.json();

    if (!ALLOWED.includes(status)) {
      return NextResponse.json({ error: "Trạng thái không hợp lệ" }, { status: 400 });
    }

    const contract = await db.contract.findUnique({ where: { id: params.id } });
    if (!contract) {
      return NextResponse.json({ error: "Hợp đồng không tồn tại" }, { status: 404 });
    }
    if (contract.ownerId !== user.id) {
      return NextResponse.json({ error: "Không có quyền chỉnh sửa" }, { status: 403 });
    }
    if (contract.status !== "SIGNED" && contract.status !== "TERMINATED") {
      return NextResponse.json({ error: "Chỉ áp dụng cho hợp đồng đã ký" }, { status: 400 });
    }

    const updated = await db.contract.update({
      where: { id: params.id },
      data: {
        status,
        activities: {
          create: {
            action: status === "TERMINATED" ? "marked_moved_out" : "marked_still_renting",
            actorId: user.id,
            actorName: user.name,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, status: updated.status });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    console.error("Update contract status error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
