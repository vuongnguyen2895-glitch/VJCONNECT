import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { formatVND, formatDateVN } from "@/lib/contract-utils";

interface PartyData {
  partyKind: string;
  name: string;
  cccd: string;
  dob: string;
  idIssueDate: string;
  idIssuePlace: string;
  phone: string;
  email: string;
  address: string;
  businessRegNo: string;
  representativeName: string;
  representativePosition: string;
}

interface RentPeriod {
  fromDate: string;
  toDate: string;
  amount: string;
}

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
    const landlordParty = contract.parties.find((p) => p.role === "LANDLORD");
    const tenantParty = contract.parties.find((p) => p.role === "TENANT");

    const buildParty = (party: typeof landlordParty, fallback: any): PartyData => ({
      partyKind: party?.partyKind || fallback?.partyKind || "INDIVIDUAL",
      name: party?.name || fallback?.name || "",
      cccd: party?.cccd || fallback?.cccd || "",
      dob: party?.dob || fallback?.dob || "",
      idIssueDate: party?.idIssueDate ? formatDateVN(party.idIssueDate) : fallback?.idIssueDate || "",
      idIssuePlace: party?.idIssuePlace || fallback?.idIssuePlace || "",
      phone: party?.phone || fallback?.phone || "",
      email: party?.email || fallback?.email || "",
      address: party?.address || fallback?.address || "",
      businessRegNo: party?.businessRegNo || fallback?.businessRegNo || "",
      representativeName: party?.representativeName || fallback?.representativeName || "",
      representativePosition: party?.representativePosition || fallback?.representativePosition || "",
    });

    const html = generateContractHTML({
      contractNo: contract.contractNo || "",
      templateName: contract.template.name,
      landlord: buildParty(landlordParty, data.landlord),
      tenant: buildParty(tenantParty, data.tenant),
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

function partyBlock(label: string, roleLabel: string, party: PartyData): string {
  if (party.partyKind === "COMPANY") {
    return `
  <p><strong>${label} (${roleLabel}):</strong></p>
  <table>
    <tr><td>Công ty:</td><td>${party.name}</td></tr>
    <tr><td>Mã số DN:</td><td>${party.businessRegNo || "___"}</td></tr>
    <tr><td>Địa chỉ:</td><td>${party.address || "___"}</td></tr>
    <tr><td>Đại diện bởi:</td><td>${party.representativeName || "___"}</td></tr>
    <tr><td>Chức vụ:</td><td>${party.representativePosition || "___"}</td></tr>
    <tr><td>Số điện thoại:</td><td>${party.phone}</td></tr>
    ${party.email ? `<tr><td>Email:</td><td>${party.email}</td></tr>` : ""}
  </table>`;
  }

  return `
  <p><strong>${label} (${roleLabel}):</strong></p>
  <table>
    <tr><td>Ông/bà:</td><td>${party.name}</td></tr>
    ${party.dob ? `<tr><td>Sinh năm:</td><td>${party.dob}</td></tr>` : ""}
    <tr><td>Số CCCD/CMND:</td><td>${party.cccd || "___"}</td></tr>
    ${party.idIssueDate ? `<tr><td>Cấp ngày:</td><td>${party.idIssueDate}</td></tr>` : ""}
    ${party.idIssuePlace ? `<tr><td>Tại:</td><td>${party.idIssuePlace}</td></tr>` : ""}
    <tr><td>Địa chỉ:</td><td>${party.address || "___"}</td></tr>
    <tr><td>Số điện thoại:</td><td>${party.phone}</td></tr>
    ${party.email ? `<tr><td>Email:</td><td>${party.email}</td></tr>` : ""}
  </table>`;
}

function signatureLine(party: PartyData): string {
  if (party.partyKind === "COMPANY") {
    return `${party.representativeName || party.name}<br/><span style="font-weight:normal;font-size:12px;">(Đại diện ${party.name})</span>`;
  }
  return party.name;
}

function generateContractHTML(data: {
  contractNo: string;
  templateName: string;
  landlord: PartyData;
  tenant: PartyData;
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

  const rentPeriods: RentPeriod[] = Array.isArray(data.terms.rentPeriods) ? data.terms.rentPeriods : [];
  const vatRate = data.terms.vatRate;

  const fmtPeriodDate = (d: Date | string | null | undefined) => (d ? formatDateVN(d) : "___");
  const firstPeriodEnd = rentPeriods[0]?.fromDate ? fmtPeriodDate(rentPeriods[0].fromDate) : fmtPeriodDate(data.endDate);

  const rentRows = [
    `<tr><td>${fmtPeriodDate(data.startDate)} – ${firstPeriodEnd}</td><td>${data.rentAmount ? formatVND(Number(data.rentAmount)) : "___"}/tháng${vatRate ? ` (chưa gồm VAT ${vatRate}%)` : ""}</td></tr>`,
    ...rentPeriods.map(
      (p) =>
        `<tr><td>${fmtPeriodDate(p.fromDate)} – ${fmtPeriodDate(p.toDate)}</td><td>${p.amount ? formatVND(p.amount) : "___"}/tháng${vatRate ? ` (chưa gồm VAT ${vatRate}%)` : ""}</td></tr>`,
    ),
  ].join("");

  const legalDocLines = [
    data.property.plotNo ? `Thửa đất số: ${data.property.plotNo}` : "",
    data.property.mapSheetNo ? `Tờ bản đồ số: ${data.property.mapSheetNo}` : "",
    data.property.landCertNo
      ? `Giấy chứng nhận quyền sử dụng đất số: ${data.property.landCertNo}${data.property.landCertDate ? `, cấp ngày ${formatDateVN(data.property.landCertDate)}` : ""}${data.property.landCertIssuer ? ` do ${data.property.landCertIssuer} cấp` : ""}`
      : "",
  ].filter(Boolean);

  const bankInfo =
    data.terms.bankAccountNumber || data.terms.bankAccountName
      ? `<tr><td>Chủ tài khoản:</td><td>${data.terms.bankAccountName || "___"}</td></tr>
         <tr><td>Số tài khoản:</td><td>${data.terms.bankAccountNumber || "___"}</td></tr>
         <tr><td>Ngân hàng:</td><td>${data.terms.bankName || "___"}</td></tr>`
      : "";

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
    .no-print { background: #814775; color: white; padding: 10px 24px; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; position: fixed; top: 20px; right: 20px; }
    @media print { .no-print { display: none; } }
    .indent { text-indent: 40px; }
    .signature-area { display: flex; justify-content: space-between; margin-top: 60px; }
    .signature-box { text-align: center; width: 45%; }
    .signature-box p { margin: 4px 0; }
    .signature-space { height: 80px; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 60px; color: rgba(129, 71, 117, 0.08); pointer-events: none; z-index: -1; white-space: nowrap; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0; }
    td { padding: 4px 8px; vertical-align: top; }
    td:first-child { width: 220px; font-weight: bold; }
  </style>
</head>
<body>
  <button class="no-print" onclick="window.print()">🖨️ In / Xuất PDF</button>
  <div class="watermark">VJConnect.com</div>

  <div class="header">
    <p><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong></p>
    <p><strong>Độc lập – Tự do – Hạnh phúc</strong></p>
    <p>---o0o---</p>
  </div>

  <h1>HỢP ĐỒNG THUÊ ${data.templateName.toUpperCase()}</h1>
  <p style="text-align: center; font-style: italic;">Số: ${data.contractNo}</p>
  <p style="text-align: right; font-style: italic;">Ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}</p>

  <p class="indent">Căn cứ Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015;</p>
  <p class="indent">Căn cứ Luật Nhà ở số 27/2023/QH15 ngày 27/11/2023;</p>
  <p class="indent">Căn cứ Luật Giao dịch điện tử số 20/2023/QH15 ngày 22/06/2023;</p>
  <p class="indent">Căn cứ vào nhu cầu và khả năng thực tế của hai bên, hôm nay tại địa chỉ: ${data.property.address || "___"}, chúng tôi gồm:</p>

  ${partyBlock("BÊN CHO THUÊ", "Bên A", data.landlord)}
  ${partyBlock("BÊN THUÊ", "Bên B", data.tenant)}

  <h2>Điều 1: Đối tượng hợp đồng</h2>
  <p class="indent">Bên A là chủ sử dụng/sở hữu hợp pháp tài sản cho thuê tại địa chỉ: <strong>${data.property.address || "___"}</strong>${data.property.area ? `, diện tích ${data.property.area} m²` : ""}${data.property.floor ? `, ${data.property.floor}` : ""}${data.property.rooms ? `, ${data.property.rooms}` : ""}${data.property.furniture ? `, nội thất: ${data.property.furniture}` : ""}.</p>
  ${legalDocLines.length > 0 ? `<p class="indent">Theo các giấy tờ pháp lý sau: ${legalDocLines.join("; ")}.</p>` : ""}
  <p class="indent">Bằng hợp đồng này, Bên A đồng ý cho Bên B thuê, Bên B đồng ý thuê toàn bộ tài sản nêu trên theo hiện trạng thực tế.</p>

  <h2>Điều 2: Thời hạn thuê, giá thuê</h2>
  <table>
    <tr><td>Thời hạn thuê:</td><td>${data.terms.duration || "12"} tháng, từ ngày ${data.startDate ? formatDateVN(data.startDate) : "___"} đến ngày ${data.endDate ? formatDateVN(data.endDate) : "___"}</td></tr>
    <tr><td>Ngày thanh toán:</td><td>Ngày ${data.terms.paymentDate || "___"} hàng tháng</td></tr>
    <tr><td>Hình thức thanh toán:</td><td>Chuyển khoản ngân hàng hoặc tiền mặt</td></tr>
  </table>
  <p class="indent">Giá thuê theo từng giai đoạn:</p>
  <table>${rentRows}</table>
  ${vatRate ? `<p class="indent">Giá thuê nêu trên chưa bao gồm thuế VAT. Bên B có trách nhiệm thanh toán thêm ${vatRate}% VAT trên đơn giá thuê tương ứng từng giai đoạn.</p>` : ""}
  <p class="indent">Giá thuê không bao gồm phí quản lý, tiền điện, nước, internet và các chi phí dịch vụ khác phát sinh trong quá trình sử dụng.</p>

  <h2>Điều 3: Chi phí điện, nước và dịch vụ</h2>
  <p class="indent">${utilitiesMap[data.terms.utilities] || utilitiesMap.tenant}</p>

  <h2>Điều 4: Tiền đặt cọc và phương thức thanh toán</h2>
  <table>
    <tr><td>Tiền đặt cọc:</td><td>${data.deposit ? formatVND(Number(data.deposit)) : "___"}</td></tr>
    ${bankInfo}
  </table>
  <p class="indent">Nếu Bên B đơn phương chấm dứt hợp đồng mà không thực hiện nghĩa vụ báo trước thì Bên A không phải hoàn trả lại tiền đặt cọc này.</p>
  <p class="indent">Nếu Bên A đơn phương chấm dứt hợp đồng mà không thực hiện nghĩa vụ báo trước thì Bên A phải hoàn trả tiền đặt cọc và bồi thường thêm một khoản bằng chính tiền đặt cọc.</p>
  <p class="indent">Tiền đặt cọc không được dùng để thanh toán tiền thuê. Nếu Bên B vi phạm hợp đồng gây thiệt hại cho Bên A, Bên A có quyền khấu trừ tiền đặt cọc để bù đắp chi phí khắc phục thiệt hại.</p>

  <h2>Điều 5: Quyền và nghĩa vụ của Bên A</h2>
  <p class="indent">1. Bàn giao tài sản thuê cho Bên B đúng thời hạn và tình trạng đã thỏa thuận.</p>
  <p class="indent">2. Đảm bảo quyền sử dụng ổn định cho Bên B trong suốt thời hạn thuê, không đơn phương chấm dứt trước hạn trừ trường hợp bất khả kháng.</p>
  <p class="indent">3. Bảo trì, sửa chữa những hư hỏng lớn không do lỗi của Bên B gây ra.</p>
  <p class="indent">4. Có quyền yêu cầu Bên B thanh toán tiền thuê đầy đủ, đúng hạn; đơn phương chấm dứt hợp đồng và yêu cầu bồi thường nếu Bên B không trả tiền thuê liên tiếp từ 3 tháng trở lên, sử dụng sai mục đích, hoặc có hành vi vi phạm pháp luật nghiêm trọng tại tài sản thuê.</p>

  <h2>Điều 6: Quyền và nghĩa vụ của Bên B</h2>
  <p class="indent">1. Thanh toán tiền thuê đầy đủ, đúng hạn theo thỏa thuận.</p>
  <p class="indent">2. Sử dụng tài sản đúng mục đích, giữ gìn và có trách nhiệm sửa chữa hư hỏng do mình gây ra.</p>
  <p class="indent">3. Không được cho thuê lại, chuyển nhượng nếu không có sự đồng ý bằng văn bản của Bên A; không tự ý cải tạo, phá dỡ khi chưa được đồng ý.</p>
  <p class="indent">4. Trả lại tài sản đúng thời hạn và trong tình trạng ban đầu (trừ hao mòn tự nhiên) khi hết hạn hoặc chấm dứt hợp đồng.</p>
  <p class="indent">5. Tự chịu trách nhiệm tuân thủ các quy định pháp luật hiện hành liên quan đến việc sử dụng tài sản thuê.</p>

  <h2>Điều 7: Chấm dứt hợp đồng</h2>
  <p class="indent">1. Hợp đồng chấm dứt khi hết thời hạn thuê mà không được gia hạn.</p>
  <p class="indent">2. Một bên muốn chấm dứt trước hạn phải thông báo bằng văn bản cho bên kia ít nhất 30 ngày, trừ trường hợp bất khả kháng.</p>
  <p class="indent">3. Bên vi phạm phải bồi thường thiệt hại theo quy định của pháp luật.</p>

  <h2>Điều 8: Bất khả kháng</h2>
  <p class="indent">Các trường hợp bất khả kháng không do lỗi của Bên A hoặc Bên B, bao gồm: thiên tai, hỏa hoạn, dịch bệnh, chiến tranh; tài sản bị giải tỏa theo chính sách/dự án nhà nước; thay đổi quy hoạch đô thị ảnh hưởng nghiêm trọng đến việc sử dụng tài sản thuê.</p>
  <p class="indent">Nếu các trường hợp trên xảy ra và hai bên không thống nhất được phương án xử lý, bên bị ảnh hưởng có quyền thanh lý hợp đồng và thông báo trước cho bên còn lại ít nhất 15 ngày làm việc. Khi thanh lý, Bên A hoàn trả tiền đặt cọc và các khoản đã thanh toán trước sau khi trừ thời gian đã sử dụng thực tế (nếu có).</p>

  <h2>Điều 9: Điều khoản chung</h2>
  <p class="indent">1. Hợp đồng này có hiệu lực kể từ ngày ký và là căn cứ duy nhất để giải quyết tranh chấp (nếu có).</p>
  <p class="indent">2. Mọi điều chỉnh, bổ sung phải được lập thành phụ lục có chữ ký của cả hai bên và là một phần không thể tách rời của hợp đồng này.</p>
  <p class="indent">3. Tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng, hòa giải. Nếu không đạt được thỏa thuận, tranh chấp sẽ được đưa ra Tòa án có thẩm quyền giải quyết.</p>
  <p class="indent">4. Hợp đồng được lập thành 02 (hai) bản có giá trị pháp lý như nhau, mỗi bên giữ 01 (một) bản.</p>

  <div class="signature-area">
    <div class="signature-box">
      <p><strong>BÊN CHO THUÊ (BÊN A)</strong></p>
      <p><em>(Ký và ghi rõ họ tên)</em></p>
      <div class="signature-space"></div>
      <p><strong>${signatureLine(data.landlord)}</strong></p>
    </div>
    <div class="signature-box">
      <p><strong>BÊN THUÊ (BÊN B)</strong></p>
      <p><em>(Ký và ghi rõ họ tên)</em></p>
      <div class="signature-space"></div>
      <p><strong>${signatureLine(data.tenant)}</strong></p>
    </div>
  </div>

  <p style="text-align: center; margin-top: 40px; font-size: 11px; color: #999;">
    Hợp đồng được tạo trên VJConnect.com — Nền tảng hợp đồng thuê nhà điện tử
  </p>
</body>
</html>`;
}
