import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

interface Bucket {
  revenue: number;
  collected: number;
  expenses: number;
}

function emptyBucket(): Bucket {
  return { revenue: 0, collected: 0, expenses: 0 };
}

/**
 * GET /api/reports?year=2026 — Revenue/expense/profit rollups: by month (for the given
 * year), by year (all years with data), and by building (for the given year).
 */
export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const selectedYear = parseInt(searchParams.get("year") || "") || now.getFullYear();

    const invoices = await db.invoice.findMany({
      where: { contract: { ownerId: user.id } },
      select: {
        year: true,
        month: true,
        totalAmount: true,
        status: true,
        contract: { select: { buildingId: true, building: { select: { name: true } } } },
      },
    });

    const expenses = await db.expense.findMany({
      where: { ownerId: user.id },
      select: { date: true, amount: true, buildingId: true, building: { select: { name: true } } },
    });

    // --- Monthly (selected year) ---
    const monthlyBuckets: Bucket[] = Array.from({ length: 12 }, emptyBucket);
    for (const inv of invoices) {
      if (inv.year !== selectedYear) continue;
      const b = monthlyBuckets[inv.month - 1];
      const amount = Number(inv.totalAmount);
      b.revenue += amount;
      if (inv.status === "PAID") b.collected += amount;
    }
    for (const exp of expenses) {
      const d = new Date(exp.date);
      if (d.getFullYear() !== selectedYear) continue;
      monthlyBuckets[d.getMonth()].expenses += Number(exp.amount);
    }
    const monthly = monthlyBuckets.map((b, i) => ({
      month: i + 1,
      revenue: b.revenue,
      collected: b.collected,
      expenses: b.expenses,
      profit: b.collected - b.expenses,
    }));

    // --- Yearly (all years with any data) ---
    const yearSet = new Set<number>([now.getFullYear()]);
    invoices.forEach((inv) => yearSet.add(inv.year));
    expenses.forEach((exp) => yearSet.add(new Date(exp.date).getFullYear()));
    const years = Array.from(yearSet).sort((a, b) => b - a);

    const yearlyBuckets = new Map<number, Bucket>(years.map((y) => [y, emptyBucket()]));
    for (const inv of invoices) {
      const b = yearlyBuckets.get(inv.year);
      if (!b) continue;
      const amount = Number(inv.totalAmount);
      b.revenue += amount;
      if (inv.status === "PAID") b.collected += amount;
    }
    for (const exp of expenses) {
      const y = new Date(exp.date).getFullYear();
      const b = yearlyBuckets.get(y);
      if (b) b.expenses += Number(exp.amount);
    }
    const yearly = years.map((y) => {
      const b = yearlyBuckets.get(y)!;
      return { year: y, revenue: b.revenue, collected: b.collected, expenses: b.expenses, profit: b.collected - b.expenses };
    });

    // --- By building (selected year) ---
    const buildingBuckets = new Map<string, { name: string } & Bucket>();
    const UNASSIGNED_KEY = "__unassigned__";
    const getBucket = (id: string | null, name: string) => {
      const key = id ?? UNASSIGNED_KEY;
      if (!buildingBuckets.has(key)) buildingBuckets.set(key, { name, ...emptyBucket() });
      return buildingBuckets.get(key)!;
    };
    for (const inv of invoices) {
      if (inv.year !== selectedYear) continue;
      const bucket = getBucket(inv.contract.buildingId, inv.contract.building?.name ?? "Chưa gán nhà");
      const amount = Number(inv.totalAmount);
      bucket.revenue += amount;
      if (inv.status === "PAID") bucket.collected += amount;
    }
    for (const exp of expenses) {
      const d = new Date(exp.date);
      if (d.getFullYear() !== selectedYear) continue;
      const bucket = getBucket(exp.buildingId, exp.building?.name ?? "Chi phí chung");
      bucket.expenses += Number(exp.amount);
    }
    const byBuilding = Array.from(buildingBuckets.entries()).map(([id, b]) => ({
      buildingId: id === UNASSIGNED_KEY ? null : id,
      buildingName: b.name,
      revenue: b.revenue,
      collected: b.collected,
      expenses: b.expenses,
      profit: b.collected - b.expenses,
    }));

    return NextResponse.json({ selectedYear, availableYears: years, monthly, yearly, byBuilding });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    console.error("Reports error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
