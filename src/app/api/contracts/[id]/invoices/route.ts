import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { createInvoiceSchema } from "@/lib/validations";

/**
 * GET /api/contracts/:id/invoices — List invoices (phiếu tính tiền) for a contract
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    const contract = await db.contract.findUnique({ where: { id: params.id } });
    if (!contract) {
      return NextResponse.json({ error: "Hợp đồng không tồn tại" }, { status: 404 });
    }
    if (contract.ownerId !== user.id) {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const invoices = await db.invoice.findMany({
      where: { contractId: params.id },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return NextResponse.json({ invoices });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}

/**
 * POST /api/contracts/:id/invoices — Create a monthly bill (phiếu tính tiền) for a contract
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = createInvoiceSchema.parse(body);

    const contract = await db.contract.findUnique({ where: { id: params.id } });
    if (!contract) {
      return NextResponse.json({ error: "Hợp đồng không tồn tại" }, { status: 404 });
    }
    if (contract.ownerId !== user.id) {
      return NextResponse.json({ error: "Không có quyền tạo phiếu" }, { status: 403 });
    }

    const existing = await db.invoice.findUnique({
      where: { contractId_year_month: { contractId: params.id, year: data.year, month: data.month } },
    });
    if (existing) {
      return NextResponse.json({ error: "Đã có phiếu tính tiền cho tháng này" }, { status: 400 });
    }

    // Recompute meter-based amounts server-side from readings × unit price when provided,
    // so a tampered/incorrect client-sent amount can never diverge from the readings on record.
    const computeMeterAmount = (oldReading?: string, newReading?: string, unitPrice?: string, fallback?: string) => {
      const oldNum = oldReading ? parseFloat(oldReading) : NaN;
      const newNum = newReading ? parseFloat(newReading) : NaN;
      const priceNum = unitPrice ? parseFloat(unitPrice) : NaN;
      if (!isNaN(oldNum) && !isNaN(newNum) && !isNaN(priceNum)) {
        return Math.max(0, newNum - oldNum) * priceNum;
      }
      return parseFloat(fallback || "0") || 0;
    };

    const electricityAmount = computeMeterAmount(
      data.electricityOldReading,
      data.electricityNewReading,
      data.electricityUnitPrice,
      data.electricityAmount,
    );
    const waterAmount = computeMeterAmount(
      data.waterOldReading,
      data.waterNewReading,
      data.waterUnitPrice,
      data.waterAmount,
    );

    const rentAmount = parseFloat(data.rentAmount) || 0;
    const internetAmount = parseFloat(data.internetAmount) || 0;
    const serviceFeeAmount = parseFloat(data.serviceFeeAmount) || 0;
    const otherAmount = data.otherAmount ? parseFloat(data.otherAmount) || 0 : 0;
    const totalAmount = rentAmount + electricityAmount + waterAmount + internetAmount + serviceFeeAmount + otherAmount;

    const invoice = await db.invoice.create({
      data: {
        contractId: params.id,
        year: data.year,
        month: data.month,
        rentAmount,
        electricityOldReading: data.electricityOldReading ? parseFloat(data.electricityOldReading) : null,
        electricityNewReading: data.electricityNewReading ? parseFloat(data.electricityNewReading) : null,
        electricityUnitPrice: data.electricityUnitPrice ? parseFloat(data.electricityUnitPrice) : null,
        electricityAmount,
        waterOldReading: data.waterOldReading ? parseFloat(data.waterOldReading) : null,
        waterNewReading: data.waterNewReading ? parseFloat(data.waterNewReading) : null,
        waterUnitPrice: data.waterUnitPrice ? parseFloat(data.waterUnitPrice) : null,
        waterAmount,
        internetAmount,
        serviceFeeAmount,
        otherAmount,
        otherNote: data.otherNote || null,
        totalAmount,
        note: data.note || null,
      },
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
