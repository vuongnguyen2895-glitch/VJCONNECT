import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const updateInvoiceStatusSchema = z.object({
  status: z.enum(["PAID", "UNPAID"]),
});

async function loadOwnedInvoice(invoiceId: string, userId: string) {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { contract: { select: { ownerId: true } } },
  });
  if (!invoice) return { error: NextResponse.json({ error: "Không tìm thấy phiếu tính tiền" }, { status: 404 }) };
  if (invoice.contract.ownerId !== userId) {
    return { error: NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 }) };
  }
  return { invoice };
}

/**
 * GET /api/invoices/:id — Invoice detail
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const { invoice, error } = await loadOwnedInvoice(params.id, user.id);
    if (error) return error;

    return NextResponse.json({ invoice });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}

/**
 * PATCH /api/invoices/:id — Toggle paid/unpaid status
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = updateInvoiceStatusSchema.parse(body);

    const { error } = await loadOwnedInvoice(params.id, user.id);
    if (error) return error;

    const updated = await db.invoice.update({
      where: { id: params.id },
      data: {
        status: data.status,
        paidAt: data.status === "PAID" ? new Date() : null,
      },
    });

    return NextResponse.json({ invoice: updated });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}

/**
 * DELETE /api/invoices/:id — Delete a mistakenly created invoice
 */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const { error } = await loadOwnedInvoice(params.id, user.id);
    if (error) return error;

    await db.invoice.delete({ where: { id: params.id } });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
