import { formatVND, formatDateVN } from "@/lib/contract-utils";
import type { ContractClause } from "@/types";

export interface PdfPartyData {
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
 * Escape a value for safe interpolation into HTML — all clause/party/property
 * content below comes from user input, so this must run before every insertion.
 */
function esc(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function partyBlock(label: string, roleLabel: string, party: PdfPartyData): string {
  if (party.partyKind === "COMPANY") {
    return `
  <p><strong>${esc(label)} (${esc(roleLabel)}):</strong></p>
  <table>
    <tr><td>Công ty:</td><td>${esc(party.name)}</td></tr>
    <tr><td>Mã số DN:</td><td>${esc(party.businessRegNo) || "___"}</td></tr>
    <tr><td>Địa chỉ:</td><td>${esc(party.address) || "___"}</td></tr>
    <tr><td>Đại diện bởi:</td><td>${esc(party.representativeName) || "___"}</td></tr>
    <tr><td>Chức vụ:</td><td>${esc(party.representativePosition) || "___"}</td></tr>
    <tr><td>Số điện thoại:</td><td>${esc(party.phone)}</td></tr>
    ${party.email ? `<tr><td>Email:</td><td>${esc(party.email)}</td></tr>` : ""}
  </table>`;
  }

  return `
  <p><strong>${esc(label)} (${esc(roleLabel)}):</strong></p>
  <table>
    <tr><td>Ông/bà:</td><td>${esc(party.name)}</td></tr>
    ${party.dob ? `<tr><td>Sinh năm:</td><td>${esc(party.dob)}</td></tr>` : ""}
    <tr><td>Số CCCD/CMND:</td><td>${esc(party.cccd) || "___"}</td></tr>
    ${party.idIssueDate ? `<tr><td>Cấp ngày:</td><td>${esc(party.idIssueDate)}</td></tr>` : ""}
    ${party.idIssuePlace ? `<tr><td>Tại:</td><td>${esc(party.idIssuePlace)}</td></tr>` : ""}
    <tr><td>Địa chỉ:</td><td>${esc(party.address) || "___"}</td></tr>
    <tr><td>Số điện thoại:</td><td>${esc(party.phone)}</td></tr>
    ${party.email ? `<tr><td>Email:</td><td>${esc(party.email)}</td></tr>` : ""}
  </table>`;
}

function signatureLine(party: PdfPartyData): string {
  if (party.partyKind === "COMPANY") {
    return `${esc(party.representativeName) || esc(party.name)}<br/><span style="font-weight:normal;font-size:12px;">(Đại diện ${esc(party.name)})</span>`;
  }
  return esc(party.name);
}

/** Render a clause's free-text content as one <p class="indent"> per non-empty line. */
function clauseContentHtml(content: string): string {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p class="indent">${esc(line)}</p>`)
    .join("\n");
}

export function generateContractHTML(data: {
  contractNo: string;
  templateName: string;
  landlord: PdfPartyData;
  tenant: PdfPartyData;
  property: any;
  terms: any;
  clauses: ContractClause[];
  startDate: Date | null;
  endDate: Date | null;
  rentAmount: any;
  deposit: any;
}) {
  const today = new Date();
  const costMethodLabel = (method: string): string => {
    const map: Record<string, string> = {
      tenant: "Bên B tự thanh toán theo chỉ số thực tế",
      included: "Đã bao gồm trong giá thuê",
      fixed: "Khoán cố định hàng tháng theo thỏa thuận",
    };
    return map[method] || map.tenant;
  };

  const rentPeriods: RentPeriod[] = Array.isArray(data.terms.rentPeriods) ? data.terms.rentPeriods : [];
  const vatRate = esc(data.terms.vatRate);

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
    data.property.plotNo ? `Thửa đất số: ${esc(data.property.plotNo)}` : "",
    data.property.mapSheetNo ? `Tờ bản đồ số: ${esc(data.property.mapSheetNo)}` : "",
    data.property.landCertNo
      ? `Giấy chứng nhận quyền sử dụng đất số: ${esc(data.property.landCertNo)}${data.property.landCertDate ? `, cấp ngày ${formatDateVN(data.property.landCertDate)}` : ""}${data.property.landCertIssuer ? ` do ${esc(data.property.landCertIssuer)} cấp` : ""}`
      : "",
  ].filter(Boolean);

  const bankInfo =
    data.terms.bankAccountNumber || data.terms.bankAccountName
      ? `<tr><td>Chủ tài khoản:</td><td>${esc(data.terms.bankAccountName) || "___"}</td></tr>
         <tr><td>Số tài khoản:</td><td>${esc(data.terms.bankAccountNumber) || "___"}</td></tr>
         <tr><td>Ngân hàng:</td><td>${esc(data.terms.bankName) || "___"}</td></tr>`
      : "";

  const clauseSections = data.clauses
    .map(
      (clause, index) => `
  <h2>Điều ${5 + index}: ${esc(clause.title)}</h2>
${clauseContentHtml(clause.content)}`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Hợp đồng ${esc(data.contractNo)}</title>
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
    table { width: 100%; border-collapse: collapse; margin: 8px 0; }
    td { padding: 4px 8px; vertical-align: top; }
    td:first-child { width: 220px; font-weight: bold; }
  </style>
</head>
<body>
  <button class="no-print" onclick="window.print()">🖨️ In / Xuất PDF</button>

  <div class="header">
    <p><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong></p>
    <p><strong>Độc lập – Tự do – Hạnh phúc</strong></p>
    <p>---o0o---</p>
  </div>

  <h1>HỢP ĐỒNG THUÊ ${esc(data.templateName.toUpperCase())}</h1>
  <p style="text-align: center; font-style: italic;">Số: ${esc(data.contractNo)}</p>
  <p style="text-align: right; font-style: italic;">Ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}</p>

  <p class="indent">Căn cứ Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015;</p>
  <p class="indent">Căn cứ Luật Nhà ở số 27/2023/QH15 ngày 27/11/2023;</p>
  <p class="indent">Căn cứ Luật Giao dịch điện tử số 20/2023/QH15 ngày 22/06/2023;</p>
  <p class="indent">Căn cứ vào nhu cầu và khả năng thực tế của hai bên, hôm nay tại địa chỉ: ${esc(data.property.address) || "___"}, chúng tôi gồm:</p>

  ${partyBlock("BÊN CHO THUÊ", "Bên A", data.landlord)}
  ${partyBlock("BÊN THUÊ", "Bên B", data.tenant)}

  <h2>Điều 1: Đối tượng hợp đồng</h2>
  <p class="indent">Bên A là chủ sử dụng/sở hữu hợp pháp tài sản cho thuê tại địa chỉ: <strong>${esc(data.property.address) || "___"}</strong>${data.property.area ? `, diện tích ${esc(data.property.area)} m²` : ""}${data.property.floor ? `, ${esc(data.property.floor)}` : ""}${data.property.rooms ? `, ${esc(data.property.rooms)}` : ""}${data.property.furniture ? `, nội thất: ${esc(data.property.furniture)}` : ""}.</p>
  ${legalDocLines.length > 0 ? `<p class="indent">Theo các giấy tờ pháp lý sau: ${legalDocLines.join("; ")}.</p>` : ""}
  <p class="indent">Bằng hợp đồng này, Bên A đồng ý cho Bên B thuê, Bên B đồng ý thuê toàn bộ tài sản nêu trên theo hiện trạng thực tế.</p>
  ${data.property.purpose ? `<p class="indent">Mục đích thuê: ${esc(data.property.purpose)}.</p>` : ""}

  <h2>Điều 2: Thời hạn thuê, giá thuê</h2>
  <table>
    <tr><td>Thời hạn thuê:</td><td>${esc(data.terms.duration) || "12"} tháng, từ ngày ${data.startDate ? formatDateVN(data.startDate) : "___"} đến ngày ${data.endDate ? formatDateVN(data.endDate) : "___"}</td></tr>
    <tr><td>Ngày thanh toán:</td><td>Ngày ${esc(data.terms.paymentDate) || "___"} hàng tháng</td></tr>
    <tr><td>Hình thức thanh toán:</td><td>Chuyển khoản ngân hàng hoặc tiền mặt</td></tr>
  </table>
  <p class="indent">Giá thuê theo từng giai đoạn:</p>
  <table>${rentRows}</table>
  ${vatRate ? `<p class="indent">Giá thuê nêu trên chưa bao gồm thuế VAT. Bên B có trách nhiệm thanh toán thêm ${vatRate}% VAT trên đơn giá thuê tương ứng từng giai đoạn.</p>` : ""}
  <p class="indent">Giá thuê không bao gồm phí quản lý, tiền điện, nước, internet và các chi phí dịch vụ khác phát sinh trong quá trình sử dụng.</p>

  <h2>Điều 3: Chi phí quản lý, điện, nước, internet</h2>
  <table>
    <tr><td>Phí quản lý:</td><td>${costMethodLabel(data.terms.costManagement)}</td></tr>
    <tr><td>Tiền điện:</td><td>${costMethodLabel(data.terms.costElectricity)}</td></tr>
    <tr><td>Tiền nước:</td><td>${costMethodLabel(data.terms.costWater)}</td></tr>
    <tr><td>Internet:</td><td>${costMethodLabel(data.terms.costInternet)}</td></tr>
  </table>
  ${data.terms.otherAgreement ? `<p class="indent">Thỏa thuận khác: ${esc(data.terms.otherAgreement)}.</p>` : ""}
  <p class="indent">Giá thuê nêu trên không bao gồm thuế thu nhập cá nhân (TNCN) từ hoạt động cho thuê tài sản. Thuế TNCN phát sinh (nếu có) do Bên A chịu trách nhiệm kê khai và nộp theo quy định pháp luật.</p>

  <h2>Điều 4: Tiền đặt cọc và phương thức thanh toán</h2>
  <table>
    <tr><td>Tiền đặt cọc:</td><td>${data.deposit ? formatVND(Number(data.deposit)) : "___"}</td></tr>
    ${bankInfo}
  </table>
  <p class="indent">Nếu Bên B đơn phương chấm dứt hợp đồng mà không thực hiện nghĩa vụ báo trước thì Bên A không phải hoàn trả lại tiền đặt cọc này.</p>
  <p class="indent">Nếu Bên A đơn phương chấm dứt hợp đồng mà không thực hiện nghĩa vụ báo trước thì Bên A phải hoàn trả tiền đặt cọc và bồi thường thêm một khoản bằng chính tiền đặt cọc.</p>
  <p class="indent">Tiền đặt cọc không được dùng để thanh toán tiền thuê. Nếu Bên B vi phạm hợp đồng gây thiệt hại cho Bên A, Bên A có quyền khấu trừ tiền đặt cọc để bù đắp chi phí khắc phục thiệt hại.</p>
${clauseSections}

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
