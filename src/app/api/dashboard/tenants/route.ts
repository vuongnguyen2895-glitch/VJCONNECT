import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/dashboard/tenants — Rooms currently rented out (SIGNED contracts), grouped by
 * building, each annotated with this month's invoice status (if a bill has been created yet).
 */
export async function GET() {
  try {
    const user = await requireAuth();

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const contracts = await db.contract.findMany({
      where: { ownerId: user.id, status: "SIGNED" },
      include: {
        building: { select: { id: true, name: true } },
        parties: { select: { name: true, phone: true, role: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const contractIds = contracts.map((c) => c.id);
    const currentMonthInvoices = await db.invoice.findMany({
      where: { contractId: { in: contractIds }, year, month },
      select: { id: true, contractId: true, status: true, totalAmount: true },
    });
    const invoiceByContract = new Map(currentMonthInvoices.map((inv) => [inv.contractId, inv]));

    const rooms = contracts.map((c) => {
      const tenant = c.parties.find((p) => p.role === "TENANT");
      const invoice = invoiceByContract.get(c.id) ?? null;
      return {
        contractId: c.id,
        contractNo: c.contractNo,
        roomName: c.roomName,
        buildingId: c.buildingId,
        buildingName: c.building?.name ?? null,
        tenantName: tenant?.name ?? null,
        tenantPhone: tenant?.phone ?? null,
        rentAmount: c.rentAmount,
        currentMonthInvoice: invoice,
      };
    });

    const buildingsMap = new Map<string, { id: string; name: string; rooms: typeof rooms }>();
    const unassigned: typeof rooms = [];

    for (const room of rooms) {
      if (room.buildingId && room.buildingName) {
        if (!buildingsMap.has(room.buildingId)) {
          buildingsMap.set(room.buildingId, { id: room.buildingId, name: room.buildingName, rooms: [] });
        }
        buildingsMap.get(room.buildingId)!.rooms.push(room);
      } else {
        unassigned.push(room);
      }
    }

    return NextResponse.json({
      year,
      month,
      buildings: Array.from(buildingsMap.values()),
      unassigned,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
