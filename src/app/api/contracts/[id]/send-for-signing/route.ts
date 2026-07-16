import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { generateSigningToken } from "@/lib/contract-utils";
import { ContractStatus } from "@prisma/client";

/**
 * POST /api/contracts/:id/send-for-signing — Generate signing links for both parties
 */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    const contract = await db.contract.findUnique({
      where: { id: params.id },
      include: { parties: true },
    });

    if (!contract) {
      return NextResponse.json({ error: "Hợp đồng không tồn tại" }, { status: 404 });
    }
    if (contract.ownerId !== user.id) {
      return NextResponse.json({ error: "Không có quyền thực hiện" }, { status: 403 });
    }
    if (contract.status !== "DRAFT") {
      return NextResponse.json({ error: "Chỉ có thể gửi ký hợp đồng ở trạng thái bản nháp" }, { status: 400 });
    }

    await Promise.all(
      contract.parties.map((party) =>
        db.contractParty.update({
          where: { id: party.id },
          data: { signingUrl: party.signingUrl ?? generateSigningToken() },
        }),
      ),
    );

    const updated = await db.contract.update({
      where: { id: params.id },
      data: {
        status: ContractStatus.PENDING_LANDLORD,
        activities: {
          create: {
            action: "sent_for_signing",
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
    console.error("Send for signing error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
