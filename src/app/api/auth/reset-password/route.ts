import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validations";

/**
 * POST /api/auth/reset-password — Consume a reset token and set a new password.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, newPassword } = resetPasswordSchema.parse(body);

    const otp = await db.otpCode.findFirst({
      where: { code: token, type: "EMAIL", usedAt: null },
    });

    if (!otp || otp.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn" },
        { status: 400 },
      );
    }

    const user = await db.user.findUnique({ where: { email: otp.target } });
    if (!user) {
      return NextResponse.json({ error: "Tài khoản không tồn tại" }, { status: 400 });
    }

    const passwordHash = await hashPassword(newPassword);
    await db.$transaction([
      db.user.update({ where: { id: user.id }, data: { passwordHash } }),
      db.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } }),
      db.session.deleteMany({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi, vui lòng thử lại" }, { status: 500 });
  }
}
