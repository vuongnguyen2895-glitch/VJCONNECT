import { db } from "./db";
import { ContractStatus, Plan } from "@prisma/client";

/**
 * Generate contract number: VJC-2026-00001
 */
export async function generateContractNo(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `VJC-${year}-`;

  const lastContract = await db.contract.findFirst({
    where: { contractNo: { startsWith: prefix } },
    orderBy: { contractNo: "desc" },
  });

  let nextNum = 1;
  if (lastContract?.contractNo) {
    const parts = lastContract.contractNo.split("-");
    nextNum = parseInt(parts[2], 10) + 1;
  }

  return `${prefix}${String(nextNum).padStart(5, "0")}`;
}

/**
 * Check if user can create a new contract based on their plan
 */
export async function canCreateContract(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { allowed: false, reason: "Người dùng không tồn tại" };

  if (user.plan === Plan.PRO || user.plan === Plan.ENTERPRISE) {
    return { allowed: true };
  }

  // FREE plan: max 1 contract per month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const contractsThisMonth = await db.contract.count({
    where: {
      ownerId: userId,
      createdAt: { gte: startOfMonth },
    },
  });

  if (contractsThisMonth >= 1) {
    return {
      allowed: false,
      reason: "Gói miễn phí chỉ cho phép tạo 1 hợp đồng/tháng. Nâng cấp gói Pro để tạo không giới hạn.",
    };
  }

  return { allowed: true };
}

/**
 * Get contract status display info
 */
export function getStatusDisplay(status: ContractStatus) {
  const map: Record<ContractStatus, { label: string; color: string; bg: string }> = {
    DRAFT: { label: "Bản nháp", color: "#6B7280", bg: "#F3F4F6" },
    PENDING_LANDLORD: { label: "Chờ chủ nhà ký", color: "#F59E0B", bg: "#FEF3C7" },
    PENDING_TENANT: { label: "Chờ người thuê ký", color: "#F59E0B", bg: "#FEF3C7" },
    SIGNED: { label: "Đã ký", color: "#10B981", bg: "#DCFCE7" },
    EXPIRED: { label: "Hết hạn", color: "#EF4444", bg: "#FEE2E2" },
    TERMINATED: { label: "Đã thanh lý", color: "#6B7280", bg: "#E5E7EB" },
  };
  return map[status];
}

/**
 * Format currency VND
 */
export function formatVND(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0đ";
  return new Intl.NumberFormat("vi-VN").format(num) + "đ";
}

/**
 * Format date to Vietnamese locale
 */
export function formatDateVN(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
