import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validations";
import { sendPasswordResetEmail } from "@/lib/email";

const RESET_EXPIRY_MS = 60 * 60 * 1000; // 1 giờ

/**
 * POST /api/auth/forgot-password — Request a password reset link by email.
 * Always returns a generic success message, regardless of whether the email
 * exists, so this endpoint can't be used to enumerate registered accounts.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await db.user.findUnique({ where: { email } });
    if (user) {
      const token = randomBytes(32).toString("hex");
      await db.otpCode.create({
        data: {
          target: email,
          code: token,
          type: "EMAIL",
          expiresAt: new Date(Date.now() + RESET_EXPIRY_MS),
        },
      });

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;
      await sendPasswordResetEmail(email, resetUrl);
    }

    return NextResponse.json({
      ok: true,
      message: "Nếu email này đã đăng ký, chúng tôi đã gửi liên kết đặt lại mật khẩu.",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 });
    }
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi, vui lòng thử lại" }, { status: 500 });
  }
}
