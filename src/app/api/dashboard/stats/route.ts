import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();

    const [total, signed, pending, draft, expiringSoon] = await Promise.all([
      db.contract.count({ where: { ownerId: user.id } }),
      db.contract.count({ where: { ownerId: user.id, status: "SIGNED" } }),
      db.contract.count({
        where: {
          ownerId: user.id,
          status: { in: ["PENDING_LANDLORD", "PENDING_TENANT"] },
        },
      }),
      db.contract.count({ where: { ownerId: user.id, status: "DRAFT" } }),
      db.contract.count({
        where: {
          ownerId: user.id,
          status: "SIGNED",
          endDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Recent contracts
    const recent = await db.contract.findMany({
      where: { ownerId: user.id },
      include: {
        template: { select: { name: true, icon: true } },
        parties: { select: { name: true, role: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });

    // Recent activities
    const activities = await db.contractActivity.findMany({
      where: { contract: { ownerId: user.id } },
      include: { contract: { select: { contractNo: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      stats: { total, signed, pending, draft, expiringSoon },
      recent,
      activities,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
