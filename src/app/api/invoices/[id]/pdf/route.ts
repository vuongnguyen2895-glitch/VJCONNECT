import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { formatVND, formatDateVN } from "@/lib/contract-utils";

function esc(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * GET /api/invoices/:id/pdf — Printable HTML slip (phiếu tính tiền) for one month
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    const invoice = await db.invoice.findUnique({
      where: { id: params.id },
      include: {
        contract: {
          include: { building: true, parties: true },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Không tìm thấy phiếu tính tiền" }, { status: 404 });
    }
    if (invoice.contract.ownerId !== user.id) {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const data = invoice.contract.dataJson as any;
    const landlordParty = invoice.contract.parties.find((p) => p.role === "LANDLORD");
    const tenantParty = invoice.contract.parties.find((p) => p.role === "TENANT");
    const landlordName = landlordParty?.name || data?.landlord?.name || "";
    const tenantName = tenantParty?.name || data?.tenant?.name || "";
    const tenantPhone = tenantParty?.phone || data?.tenant?.phone || "";
    const address = data?.property?.address || "";

    const roomLabel = [invoice.contract.building?.name, invoice.contract.roomName].filter(Boolean).join(" — ");

    const row = (label: string, value: string, bold = false) => `
    <tr>
      <td>${esc(label)}</td>
      <td style="text-align:right;${bold ? "font-weight:bold;" : ""}">${esc(value)}</td>
    </tr>`;

    const meterRow = (label: string, oldReading: any, newReading: any, unitPrice: any, amount: any) => {
      if (oldReading === null || newReading === null) return "";
      const consumed = Number(newReading) - Number(oldReading);
      return `
    <tr>
      <td>${esc(label)} (${esc(oldReading)} → ${esc(newReading)}, ${esc(consumed)} × ${esc(formatVND(unitPrice ?? 0))})</td>
      <td style="text-align:right;">${esc(formatVND(amount))}</td>
    </tr>`;
    };

    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Phiếu tính tiền tháng ${esc(invoice.month)}/${esc(invoice.year)}</title>
  <style>
    @page { size: A5; margin: 1.5cm; }
    body { font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.7; color: #000; max-width: 600px; margin: 0 auto; padding: 32px; }
    h1 { text-align: center; font-size: 18px; text-transform: uppercase; margin-bottom: 4px; }
    .header { text-align: center; margin-bottom: 24px; }
    .header p { margin: 2px 0; font-size: 13px; }
    .no-print { background: #814775; color: white; padding: 10px 24px; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; position: fixed; top: 20px; right: 20px; }
    @media print { .no-print { display: none; } }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    td { padding: 6px 4px; vertical-align: top; border-bottom: 1px solid #eee; }
    .total-row td { border-top: 2px solid #000; border-bottom: none; font-size: 16px; padding-top: 10px; }
    .status { display: inline-block; margin-top: 16px; padding: 6px 16px; border-radius: 999px; font-weight: bold; font-size: 13px; }
    .status.paid { background: #dcfce7; color: #10b981; }
    .status.unpaid { background: #fef3c7; color: #f59e0b; }
  </style>
</head>
<body>
  <button class="no-print" onclick="window.print()">🖨️ In / Xuất PDF</button>

  <div class="header">
    <p><strong>PHIẾU TÍNH TIỀN</strong></p>
    <p>Tháng ${esc(invoice.month)}/${esc(invoice.year)}</p>
  </div>

  <table>
    ${roomLabel ? row("Nhà/Phòng", roomLabel) : ""}
    ${address ? row("Địa chỉ", address) : ""}
    ${landlordName ? row("Bên cho thuê", landlordName) : ""}
    ${tenantName ? row("Bên thuê", `${tenantName}${tenantPhone ? " — " + tenantPhone : ""}`) : ""}
  </table>

  <table>
    ${row("Tiền thuê nhà", formatVND(invoice.rentAmount as any))}
    ${meterRow("Tiền điện", invoice.electricityOldReading, invoice.electricityNewReading, invoice.electricityUnitPrice, invoice.electricityAmount) || row("Tiền điện", formatVND(invoice.electricityAmount as any))}
    ${meterRow("Tiền nước", invoice.waterOldReading, invoice.waterNewReading, invoice.waterUnitPrice, invoice.waterAmount) || row("Tiền nước", formatVND(invoice.waterAmount as any))}
    ${Number(invoice.internetAmount) > 0 ? row("Internet", formatVND(invoice.internetAmount as any)) : ""}
    ${Number(invoice.serviceFeeAmount) > 0 ? row("Phí dịch vụ", formatVND(invoice.serviceFeeAmount as any)) : ""}
    ${Number(invoice.otherAmount) > 0 ? row(invoice.otherNote || "Khác", formatVND(invoice.otherAmount as any)) : ""}
    <tr class="total-row">
      <td><strong>TỔNG CỘNG</strong></td>
      <td style="text-align:right;"><strong>${esc(formatVND(invoice.totalAmount as any))}</strong></td>
    </tr>
  </table>

  <div style="text-align:center;">
    <span class="status ${invoice.status === "PAID" ? "paid" : "unpaid"}">
      ${invoice.status === "PAID" ? `Đã thanh toán${invoice.paidAt ? " ngày " + esc(formatDateVN(invoice.paidAt)) : ""}` : "Chưa thanh toán"}
    </span>
  </div>

  ${invoice.note ? `<p style="margin-top:20px;font-style:italic;">Ghi chú: ${esc(invoice.note)}</p>` : ""}

  <p style="text-align: center; margin-top: 40px; font-size: 11px; color: #999;">
    Phiếu được tạo trên VJConnect.com
  </p>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
