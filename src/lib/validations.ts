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
// CONTRACT
// ============================================================

export const landlordSchema = z.object({
  name: z.string().min(2, "Vui lòng nhập họ tên"),
  cccd: z.string().min(9, "Số CCCD/CMND không hợp lệ"),
  phone: z.string().regex(PHONE_REGEX, "Số điện thoại không hợp lệ"),
  address: z.string().optional(),
});

export const tenantSchema = z.object({
  name: z.string().min(2, "Vui lòng nhập họ tên"),
  cccd: z.string().min(9, "Số CCCD/CMND không hợp lệ"),
  phone: z.string().regex(PHONE_REGEX, "Số điện thoại không hợp lệ"),
  email: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().email("Email không hợp lệ").optional(),
  ),
});

export const propertySchema = z.object({
  address: z.string().min(5, "Vui lòng nhập địa chỉ"),
  area: z.string().optional(),
  floor: z.string().optional(),
  rooms: z.string().optional(),
  furniture: z.string().optional(),
});

export const termsSchema = z.object({
  rentAmount: z.string().min(1, "Vui lòng nhập giá thuê"),
  deposit: z.string().optional(),
  paymentDate: z.string().optional(),
  duration: z.string().default("12"),
  startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  utilities: z.enum(["tenant", "included", "fixed"]).default("tenant"),
});

export const createContractSchema = z.object({
  templateId: z.string().min(1, "Vui lòng chọn mẫu hợp đồng"),
  landlord: landlordSchema,
  tenant: tenantSchema,
  property: propertySchema,
  terms: termsSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateContractInput = z.infer<typeof createContractSchema>;
