import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/dashboard/tenant-directory — Flat tenant registry: one row per contract that has
 * ever been signed (SIGNED = còn ở, TERMINATED = không còn ở), with the profile/lease fields
 * needed for a rent-roll style table (CCCD, DOB, rent, deposit, sign/end dates, occupancy).
 */
export async function GET() {
  try {
    const user = await requireAuth();

    const contracts = await db.contract.findMany({
      where: { ownerId: user.id, status: { in: ["SIGNED", "TERMINATED"] } },
      include: {
        building: { select: { id: true, name: true } },
        parties: { where: { role: "TENANT" }, select: { name: true, cccd: true, dob: true, phone: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const rows = contracts.map((c) => {
      const tenant = c.parties[0];
      return {
        contractId: c.id,
        roomName: c.roomName,
        buildingName: c.building?.name ?? null,
        tenantName: tenant?.name ?? null,
        cccd: tenant?.cccd ?? null,
        dob: tenant?.dob ?? null,
        phone: tenant?.phone ?? null,
        rentAmount: c.rentAmount,
        deposit: c.deposit,
        signedAt: c.signedAt,
        endDate: c.endDate,
        status: c.status,
      };
    });

    return NextResponse.json({ rows });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    console.error("Tenant directory error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
