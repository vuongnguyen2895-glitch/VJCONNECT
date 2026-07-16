import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { formatVND, formatDateVN } from "@/lib/contract-utils";

/**
 * GET /api/contracts/:id/pdf — Generate PDF for contract
 *
 * Approach: Generate HTML → convert to PDF
 * In production, use Puppeteer or a PDF service
 * For MVP, we return HTML that can be printed to PDF
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    const contract = await db.contract.findUnique({
      where: { id: params.id },
      include: { template: true, parties: true },
    });

    if (!contract) {
      return NextResponse.json({ error: "Hợp đồng không tồn tại" }, { status: 404 });
    }
    if (contract.ownerId !== user.id) {
      return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
    }

    const data = contract.dataJson as any;
    const landlord = contract.parties.find((p) => p.role === "LANDLORD");
    const tenant = contract.parties.find((p) => p.role === "TENANT");

    // Generate contract HTML
    const html = generateContractHTML({
      contractNo: contract.contractNo || "",
      templateName: contract.template.name,
      landlord: {
        name: landlord?.name || data.landlord?.name || "",
        cccd: landlord?.cccd || data.landlord?.cccd || "",
        phone: landlord?.phone || data.landlord?.phone || "",
        address: landlord?.address || data.landlord?.address || "",
      },
      tenant: {
        name: tenant?.name || data.tenant?.name || "",
        cccd: tenant?.cccd || data.tenant?.cccd || "",
        phone: tenant?.phone || data.tenant?.phone || "",
        email: tenant?.email || data.tenant?.email || "",
      },
      property: data.property || {},
      terms: data.terms || {},
      startDate: contract.startDate,
      endDate: contract.endDate,
      rentAmount: contract.rentAmount,
      deposit: contract.deposit,
    });

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}

function generateContractHTML(data: {
  contractNo: string;
  templateName: string;
  landlord: { name: string; cccd: string; phone: string; address: string };
  tenant: { name: string; cccd: string; phone: string; email: string };
  property: any;
  terms: any;
  startDate: Date | null;
  endDate: Date | null;
  rentAmount: any;
  deposit: any;
}) {
  const today = new Date();
  const utilitiesMap: Record<string, string> = {
    tenant: "Bên B tự thanh toán theo chỉ số đồng hồ thực tế",
    included: "Đã bao gồm trong giá thuê",
    fixed: "Khoán cố định hàng tháng theo thỏa thuận",
  };

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Hợp đồng ${data.contractNo}</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.8; color: #000; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1 { text-align: center; font-size: 18px; text-transform: uppercase; margin-bottom: 4px; }
    h2 { font-size: 15px; margin: 24px 0 8px; text-transform: uppercase; }
    .header { text-align: center; margin-bottom: 30px; }
    .header p { margin: 2px 0; font-size: 13px; }
    .no-print { background: #0EA5E9; color: white; padding: 10px 24px; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; position: fixed; top: 20px; right: 20px; }
    @media print { .no-print { display: none; } }
    .indent { text-indent: 40px; }
    .signature-area { display: flex; justify-content: space-between; margin-top: 60px; }
    .signature-box { text-align: center; width: 45%; }
    .signature-box p { margin: 4px 0; }
    .signature-space { height: 80px; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 60px; color: rgba(14, 165, 233, 0.08); pointer-events: none; z-index: -1; white-space: nowrap; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0; }
    td { padding: 4px 8px; vertical-align: top; }
    td:first-child { width: 200px; font-weight: bold; }
  </style>
</head>
<body>
  <button class="no-print" onclick="window.print()">🖨️ In / Xuất PDF</button>
  <div class="watermark">VJConnect.com</div>

  <div class="header">
    <p><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong></p>
    <p><strong>Độc lập – Tự do – Hạnh phúc</strong></p>
    <p>---oOo---</p>
  </div>

  <h1>HỢP ĐỒNG CHO THUÊ ${data.templateName.toUpperCase()}</h1>
  <p style="text-align: center; font-style: italic;">Số: ${data.contractNo}</p>
  <p style="text-align: right; font-style: italic;">Ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}</p>

  <p class="indent">Căn cứ Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015;</p>
  <p class="indent">Căn cứ Luật Nhà ở số 27/2023/QH15 ngày 27/11/2023;</p>
  <p class="indent">Căn cứ vào nhu cầu và khả năng thực tế của hai bên;</p>
  <p class="indent">Hôm nay, chúng tôi gồm:</p>

  <h2>Điều 1: Các bên</h2>
  <p><strong>BÊN CHO THUÊ (BÊN A):</strong></p>
  <table>
    <tr><td>Họ và tên:</td><td>${data.landlord.name}</td></tr>
    <tr><td>Số CCCD/CMND:</td><td>${data.landlord.cccd}</td></tr>
    <tr><td>Số điện thoại:</td><td>${data.landlord.phone}</td></tr>
    <tr><td>Địa chỉ:</td><td>${data.landlord.address}</td></tr>
  </table>

  <p><strong>BÊN THUÊ (BÊN B):</strong></p>
  <table>
    <tr><td>Họ và tên:</td><td>${data.tenant.name}</td></tr>
    <tr><td>Số CCCD/CMND:</td><td>${data.tenant.cccd}</td></tr>
    <tr><td>Số điện thoại:</td><td>${data.tenant.phone}</td></tr>
    ${data.tenant.email ? `<tr><td>Email:</td><td>${data.tenant.email}</td></tr>` : ""}
  </table>

  <h2>Điều 2: Tài sản cho thuê</h2>
  <table>
    <tr><td>Địa chỉ:</td><td>${data.property.address || "___"}</td></tr>
    ${data.property.area ? `<tr><td>Diện tích:</td><td>${data.property.area} m²</td></tr>` : ""}
    ${data.property.floor ? `<tr><td>Số tầng/Tầng:</td><td>${data.property.floor}</td></tr>` : ""}
  </table>

  <h2>Điều 3: Giá thuê và phương thức thanh toán</h2>
  <table>
    <tr><td>Giá thuê hàng tháng:</td><td>${data.rentAmount ? formatVND(Number(data.rentAmount)) : "___"}</td></tr>
    <tr><td>Tiền đặt cọc:</td><td>${data.deposit ? formatVND(Number(data.deposit)) : "___"}</td></tr>
    <tr><td>Ngày thanh toán:</td><td>Ngày ${data.terms.paymentDate || "___"} hàng tháng</td></tr>
    <tr><td>Hình thức:</td><td>Chuyển khoản ngân hàng hoặc tiền mặt</td></tr>
  </table>

  <h2>Điều 4: Thời hạn thuê</h2>
  <table>
    <tr><td>Thời hạn:</td><td>${data.terms.duration || "12"} tháng</td></tr>
    <tr><td>Từ ngày:</td><td>${data.startDate ? formatDateVN(data.startDate) : "___"}</td></tr>
    <tr><td>Đến ngày:</td><td>${data.endDate ? formatDateVN(data.endDate) : "___"}</td></tr>
  </table>

  <h2>Điều 5: Chi phí điện, nước và dịch vụ</h2>
  <p class="indent">${utilitiesMap[data.terms.utilities] || utilitiesMap.tenant}</p>

  <h2>Điều 6: Quyền và nghĩa vụ của Bên A</h2>
  <p class="indent">1. Giao nhà và trang thiết bị cho Bên B đúng thời hạn và tình trạng đã thỏa thuận.</p>
  <p class="indent">2. Đảm bảo quyền sử dụng nhà ổn định cho Bên B trong suốt thời hạn thuê.</p>
  <p class="indent">3. Bảo trì, sửa chữa những hư hỏng lớn không do lỗi của Bên B gây ra.</p>

  <h2>Điều 7: Quyền và nghĩa vụ của Bên B</h2>
  <p class="indent">1. Thanh toán tiền thuê đầy đủ, đúng hạn theo thỏa thuận.</p>
  <p class="indent">2. Sử dụng nhà đúng mục đích, giữ gìn tài sản và trang thiết bị.</p>
  <p class="indent">3. Không được cho thuê lại, chuyển nhượng nếu không có sự đồng ý bằng văn bản của Bên A.</p>
  <p class="indent">4. Trả lại nhà đúng thời hạn và trong tình trạng ban đầu (trừ hao mòn tự nhiên).</p>

  <h2>Điều 8: Chấm dứt hợp đồng</h2>
  <p class="indent">1. Hợp đồng chấm dứt khi hết thời hạn thuê mà không được gia hạn.</p>
  <p class="indent">2. Một bên muốn chấm dứt trước hạn phải thông báo bằng văn bản cho bên kia ít nhất 30 ngày.</p>
  <p class="indent">3. Bên vi phạm phải bồi thường thiệt hại theo quy định của pháp luật.</p>

  <h2>Điều 9: Điều khoản chung</h2>
  <p class="indent">1. Hợp đồng này có hiệu lực kể từ ngày ký.</p>
  <p class="indent">2. Hợp đồng được lập thành 02 bản, mỗi bên giữ 01 bản có giá trị pháp lý như nhau.</p>
  <p class="indent">3. Mọi tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng. Nếu không đạt được thỏa thuận, tranh chấp sẽ được đưa ra Tòa án có thẩm quyền giải quyết.</p>

  <div class="signature-area">
    <div class="signature-box">
      <p><strong>BÊN CHO THUÊ (BÊN A)</strong></p>
      <p><em>(Ký và ghi rõ họ tên)</em></p>
      <div class="signature-space"></div>
      <p><strong>${data.landlord.name}</strong></p>
    </div>
    <div class="signature-box">
      <p><strong>BÊN THUÊ (BÊN B)</strong></p>
      <p><em>(Ký và ghi rõ họ tên)</em></p>
      <div class="signature-space"></div>
      <p><strong>${data.tenant.name}</strong></p>
    </div>
  </div>

  <p style="text-align: center; margin-top: 40px; font-size: 11px; color: #999;">
    Hợp đồng được tạo trên VJConnect.com — Nền tảng hợp đồng thuê nhà điện tử
  </p>
</body>
</html>`;
}
