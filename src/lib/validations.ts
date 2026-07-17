import { z } from "zod";

// ============================================================
// AUTH
// ============================================================

const PHONE_REGEX = /^(0[3|5|7|8|9])+([0-9]{8})$/;

export const registerSchema = z.object({
  name: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().regex(PHONE_REGEX, "Số điện thoại không hợp lệ").optional(),
  ),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

// ============================================================
// CONTRACT — PARTIES (individual or company)
// ============================================================

const emailOptional = z.preprocess(
  (val) => (val === "" ? undefined : val),
  z.string().email("Email không hợp lệ").optional(),
);

const partyBaseSchema = z.object({
  partyKind: z.enum(["INDIVIDUAL", "COMPANY"]).default("INDIVIDUAL"),
  name: z.string().min(2, "Vui lòng nhập họ tên / tên công ty"),
  phone: z.string().regex(PHONE_REGEX, "Số điện thoại không hợp lệ"),
  email: emailOptional,
  address: z.string().optional(),
  // Individual-only
  cccd: z.string().optional(),
  dob: z.string().optional(),
  idIssueDate: z.string().optional(),
  idIssuePlace: z.string().optional(),
  // Company-only
  businessRegNo: z.string().optional(),
  representativeName: z.string().optional(),
  representativePosition: z.string().optional(),
});

function withPartyKindRefinement(schema: typeof partyBaseSchema) {
  return schema.superRefine((data, ctx) => {
    if (data.partyKind === "INDIVIDUAL") {
      if (!data.cccd || data.cccd.trim().length < 9) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["cccd"], message: "Số CCCD/CMND không hợp lệ" });
      }
    } else {
      if (!data.businessRegNo || data.businessRegNo.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["businessRegNo"],
          message: "Vui lòng nhập mã số doanh nghiệp",
        });
      }
      if (!data.representativeName || data.representativeName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["representativeName"],
          message: "Vui lòng nhập người đại diện",
        });
      }
    }
  });
}

export const landlordSchema = withPartyKindRefinement(partyBaseSchema);
export const tenantSchema = withPartyKindRefinement(partyBaseSchema);

// ============================================================
// CONTRACT — PROPERTY
// ============================================================

export const propertySchema = z.object({
  address: z.string().min(5, "Vui lòng nhập địa chỉ"),
  area: z.string().optional(),
  floor: z.string().optional(),
  rooms: z.string().optional(),
  furniture: z.string().optional(),
  purpose: z.string().optional(), // Mục đích thuê
  // Legal property description (optional — matches a formal land-use document if available)
  plotNo: z.string().optional(), // Thửa đất số
  mapSheetNo: z.string().optional(), // Tờ bản đồ số
  landCertNo: z.string().optional(), // Số giấy chứng nhận QSDĐ
  landCertDate: z.string().optional(), // Ngày cấp
  landCertIssuer: z.string().optional(), // Nơi cấp
});

// ============================================================
// CONTRACT — TERMS (tiered rent, deposit, bank info)
// ============================================================

export const rentPeriodSchema = z.object({
  fromDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu giai đoạn"),
  toDate: z.string().optional(),
  amount: z.string().min(1, "Vui lòng nhập giá thuê"),
});

const costMethodSchema = z.enum(["tenant", "included", "fixed"]).default("tenant");

export const termsSchema = z.object({
  rentAmount: z.string().min(1, "Vui lòng nhập giá thuê"),
  rentPeriods: z.array(rentPeriodSchema).optional(),
  vatRate: z.string().optional(), // e.g. "5" for 5% VAT, blank = not applicable
  deposit: z.string().optional(),
  paymentDate: z.string().optional(),
  duration: z.string().default("12"),
  startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  costManagement: costMethodSchema,
  costElectricity: costMethodSchema,
  costWater: costMethodSchema,
  costInternet: costMethodSchema,
  otherAgreement: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional(),
});

// ============================================================
// CONTRACT — CUSTOM CLAUSES (add/remove/edit legal articles)
// ============================================================

export const clauseSchema = z.object({
  id: z.string(),
  title: z.string().min(2, "Vui lòng nhập tiêu đề điều khoản"),
  content: z.string().min(5, "Vui lòng nhập nội dung điều khoản"),
});

export const createContractSchema = z.object({
  templateId: z.string().min(1, "Vui lòng chọn mẫu hợp đồng"),
  contractNo: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z
      .string()
      .regex(/^[A-Za-z0-9/_-]+$/, "Số hợp đồng chỉ gồm chữ, số, dấu / _ -")
      .optional(),
  ),
  landlord: landlordSchema,
  tenant: tenantSchema,
  clauses: z.array(clauseSchema).optional(),
  property: propertySchema,
  terms: termsSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateContractInput = z.infer<typeof createContractSchema>;
