import { ContractStatus, PartyKind, PartyRole, Plan, TemplateCategory } from "@prisma/client";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  plan: Plan;
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  category: TemplateCategory;
  description: string | null;
  icon: string | null;
  isPremium: boolean;
  contentJson: any;
}

export interface ContractParty {
  id: string;
  role: PartyRole;
  partyKind: PartyKind;
  name: string;
  cccd: string | null;
  phone: string | null;
  email: string | null;
  dob: string | null;
  idIssueDate: string | null;
  idIssuePlace: string | null;
  businessRegNo: string | null;
  representativeName: string | null;
  representativePosition: string | null;
  signedAt: string | null;
}

export interface Contract {
  id: string;
  contractNo: string | null;
  status: ContractStatus;
  title: string | null;
  dataJson: any;
  startDate: string | null;
  endDate: string | null;
  rentAmount: string | null;
  deposit: string | null;
  createdAt: string;
  updatedAt: string;
  template: { name: string; icon: string | null; category: TemplateCategory };
  parties: ContractParty[];
}

export interface DashboardStats {
  total: number;
  signed: number;
  pending: number;
  draft: number;
  expiringSoon: number;
}

// Contract form wizard steps
export interface PartyFormData {
  partyKind: "INDIVIDUAL" | "COMPANY";
  name: string;
  phone: string;
  email: string;
  address: string;
  // Individual-only
  cccd: string;
  dob: string;
  idIssueDate: string;
  idIssuePlace: string;
  // Company-only
  businessRegNo: string;
  representativeName: string;
  representativePosition: string;
}

export interface RentPeriodFormData {
  fromDate: string;
  toDate: string;
  amount: string;
}

export type CostMethod = "tenant" | "included" | "fixed";

export interface ContractClause {
  id: string;
  title: string;
  content: string;
}

export interface ContractFormData {
  templateId: string;
  contractNo: string;
  buildingId: string;
  roomName: string;
  landlord: PartyFormData;
  tenant: PartyFormData;
  clauses: ContractClause[];
  property: {
    address: string;
    area: string;
    floor: string;
    rooms: string;
    furniture: string;
    purpose: string;
    plotNo: string;
    mapSheetNo: string;
    landCertNo: string;
    landCertDate: string;
    landCertIssuer: string;
  };
  terms: {
    rentAmount: string;
    rentPeriods: RentPeriodFormData[];
    vatRate: string;
    deposit: string;
    paymentDate: string;
    duration: string;
    startDate: string;
    costManagement: CostMethod;
    costElectricity: CostMethod;
    costWater: CostMethod;
    costInternet: CostMethod;
    otherAgreement: string;
    bankAccountName: string;
    bankAccountNumber: string;
    bankName: string;
  };
}

export const DEFAULT_CLAUSES: ContractClause[] = [
  {
    id: "rights-obligations-a",
    title: "Quyền và nghĩa vụ của Bên A",
    content: [
      "1. Bàn giao tài sản thuê cho Bên B đúng thời hạn và tình trạng đã thỏa thuận.",
      "2. Đảm bảo quyền sử dụng ổn định cho Bên B trong suốt thời hạn thuê, không đơn phương chấm dứt trước hạn trừ trường hợp bất khả kháng.",
      "3. Bảo trì, sửa chữa những hư hỏng lớn không do lỗi của Bên B gây ra.",
      "4. Có quyền yêu cầu Bên B thanh toán tiền thuê đầy đủ, đúng hạn.",
      "5. Có quyền đơn phương chấm dứt hợp đồng và yêu cầu bồi thường thiệt hại nếu Bên B có một trong các hành vi sau:",
      "   a) Không trả tiền thuê liên tiếp từ 3 tháng trở lên mà không có lý do chính đáng;",
      "   b) Sử dụng tài sản không đúng mục đích thuê đã thỏa thuận;",
      "   c) Tự ý đục phá, cơi nới, cải tạo, phá dỡ tài sản đang thuê khi chưa được Bên A đồng ý;",
      "   d) Gây mất trật tự, ảnh hưởng nghiêm trọng đến sinh hoạt của những người xung quanh dù đã được nhắc nhở;",
      "   đ) Có hành vi vi phạm pháp luật nghiêm trọng tại tài sản thuê — trường hợp này Bên A có quyền chấm dứt hợp đồng ngay lập tức, không cần báo trước, đồng thời yêu cầu Bên B chịu trách nhiệm trước cơ quan nhà nước có thẩm quyền.",
    ].join("\n"),
  },
  {
    id: "rights-obligations-b",
    title: "Quyền và nghĩa vụ của Bên B",
    content: [
      "1. Thanh toán tiền thuê đầy đủ, đúng hạn theo thỏa thuận.",
      "2. Sử dụng tài sản đúng mục đích, giữ gìn và có trách nhiệm sửa chữa hư hỏng do mình gây ra.",
      "3. Không được cho thuê lại, chuyển nhượng nếu không có sự đồng ý bằng văn bản của Bên A; không tự ý cải tạo, phá dỡ khi chưa được đồng ý.",
      "4. Trả lại tài sản đúng thời hạn và trong tình trạng ban đầu (trừ hao mòn tự nhiên) khi hết hạn hoặc chấm dứt hợp đồng.",
      "5. Tự chịu trách nhiệm tuân thủ các quy định pháp luật hiện hành liên quan đến việc sử dụng tài sản thuê.",
      "6. Được ưu tiên ký hợp đồng thuê tiếp nếu hết hạn thuê mà tài sản vẫn tiếp tục được cho thuê.",
      "7. Được tháo dỡ và mang đi các tài sản, trang thiết bị do Bên B tự lắp đặt khi hết hạn hoặc chấm dứt hợp đồng, miễn không làm ảnh hưởng đến kết cấu tài sản thuê.",
    ].join("\n"),
  },
  {
    id: "termination",
    title: "Chấm dứt hợp đồng",
    content: [
      "1. Hợp đồng chấm dứt khi hết thời hạn thuê mà không được gia hạn.",
      "2. Một bên muốn chấm dứt trước hạn phải thông báo bằng văn bản cho bên kia ít nhất 30 ngày, trừ trường hợp bất khả kháng.",
      "3. Bên vi phạm phải bồi thường thiệt hại theo quy định của pháp luật.",
    ].join("\n"),
  },
  {
    id: "force-majeure",
    title: "Bất khả kháng",
    content: [
      "Các trường hợp bất khả kháng không do lỗi của Bên A hoặc Bên B, bao gồm: thiên tai, hỏa hoạn, dịch bệnh, chiến tranh; tài sản bị giải tỏa theo chính sách/dự án nhà nước; thay đổi quy hoạch đô thị ảnh hưởng nghiêm trọng đến việc sử dụng tài sản thuê.",
      "Nếu các trường hợp trên xảy ra và hai bên không thống nhất được phương án xử lý, bên bị ảnh hưởng có quyền thanh lý hợp đồng và thông báo trước cho bên còn lại ít nhất 15 ngày làm việc. Khi thanh lý, Bên A hoàn trả tiền đặt cọc và các khoản đã thanh toán trước sau khi trừ thời gian đã sử dụng thực tế (nếu có).",
    ].join("\n"),
  },
  {
    id: "general-terms",
    title: "Điều khoản chung",
    content: [
      "1. Hợp đồng này có hiệu lực kể từ ngày ký và là căn cứ duy nhất để giải quyết tranh chấp (nếu có).",
      "2. Mọi điều chỉnh, bổ sung phải được lập thành phụ lục có chữ ký của cả hai bên và là một phần không thể tách rời của hợp đồng này.",
      "3. Tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng, hòa giải. Nếu không đạt được thỏa thuận, tranh chấp sẽ được đưa ra Tòa án có thẩm quyền giải quyết.",
      "4. Hợp đồng được lập thành 02 (hai) bản có giá trị pháp lý như nhau, mỗi bên giữ 01 (một) bản.",
    ].join("\n"),
  },
];

const INITIAL_PARTY_DATA: PartyFormData = {
  partyKind: "INDIVIDUAL",
  name: "",
  phone: "",
  email: "",
  address: "",
  cccd: "",
  dob: "",
  idIssueDate: "",
  idIssuePlace: "",
  businessRegNo: "",
  representativeName: "",
  representativePosition: "",
};

export const INITIAL_FORM_DATA: ContractFormData = {
  templateId: "",
  contractNo: "",
  buildingId: "",
  roomName: "",
  landlord: { ...INITIAL_PARTY_DATA },
  tenant: { ...INITIAL_PARTY_DATA },
  clauses: DEFAULT_CLAUSES.map((c) => ({ ...c })),
  property: {
    address: "",
    area: "",
    floor: "",
    rooms: "",
    furniture: "",
    purpose: "",
    plotNo: "",
    mapSheetNo: "",
    landCertNo: "",
    landCertDate: "",
    landCertIssuer: "",
  },
  terms: {
    rentAmount: "",
    rentPeriods: [],
    vatRate: "",
    deposit: "",
    paymentDate: "5",
    duration: "12",
    startDate: "",
    costManagement: "tenant",
    costElectricity: "tenant",
    costWater: "tenant",
    costInternet: "tenant",
    otherAgreement: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankName: "",
  },
};
