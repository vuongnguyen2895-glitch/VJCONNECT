import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/dashboard/tenant-invoices — Rent-roll grid data: one row per contract that is
 * currently active (SIGNED and not yet past its end date), with every invoice (phiếu tính
 * tiền) it has, so the client can render a month-by-month paid/unpaid grid. A tenant whose
 * contract has ended (naturally expired or marked "không còn ở") drops off this list on its own.
 */
export async function GET() {
  try {
    const user = await requireAuth();

    const contracts = await db.contract.findMany({
      where: { ownerId: user.id, status: "SIGNED", endDate: { gte: new Date() } },
      include: {
        building: { select: { name: true } },
        parties: { where: { role: "TENANT" }, select: { name: true } },
        invoices: { select: { id: true, year: true, month: true, status: true, totalAmount: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const rows = contracts.map((c) => ({
      contractId: c.id,
      roomName: c.roomName,
      buildingName: c.building?.name ?? null,
      tenantName: c.parties[0]?.name ?? null,
      rentAmount: c.rentAmount,
      signedAt: c.signedAt,
      startDate: c.startDate,
      endDate: c.endDate,
      status: c.status,
      invoices: c.invoices,
    }));

    return NextResponse.json({ rows });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    console.error("Tenant invoices grid error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
