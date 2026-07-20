import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/tenants/saved — Distinct tenants this user has entered on past contracts,
 * so they can be picked again instead of retyped from scratch.
 */
export async function GET() {
  try {
    const user = await requireAuth();

    const parties = await db.contractParty.findMany({
      where: { role: "TENANT", contract: { ownerId: user.id } },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        partyKind: true,
        name: true,
        cccd: true,
        phone: true,
        email: true,
        address: true,
        dob: true,
        idIssueDate: true,
        idIssuePlace: true,
        businessRegNo: true,
        representativeName: true,
        representativePosition: true,
      },
    });

    const seen = new Set<string>();
    const tenants = [];
    for (const p of parties) {
      const key = p.cccd || p.businessRegNo || `${p.name}|${p.phone ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      tenants.push(p);
      if (tenants.length >= 20) break;
    }

    return NextResponse.json({ tenants });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    console.error("List saved tenants error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
