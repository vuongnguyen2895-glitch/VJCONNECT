import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validations";

/**
 * GET /api/account — Full editable profile for the logged-in user
 */
export async function GET() {
  try {
    const authUser = await requireAuth();
    const user = await db.user.findUnique({ where: { id: authUser.id } });
    if (!user) {
      return NextResponse.json({ error: "Người dùng không tồn tại" }, { status: 404 });
    }
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        cccd: user.cccd,
        plan: user.plan,
        planExpiresAt: user.planExpiresAt,
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    console.error("Get account error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}

/**
 * PATCH /api/account — Update profile info
 */
export async function PATCH(req: Request) {
  try {
    const authUser = await requireAuth();
    const body = await req.json();
    const data = updateProfileSchema.parse(body);

    if (data.email !== authUser.email) {
      const existing = await db.user.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== authUser.id) {
        return NextResponse.json({ error: "Email này đã được sử dụng bởi tài khoản khác" }, { status: 400 });
      }
    }

    const user = await db.user.update({
      where: { id: authUser.id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        cccd: data.cccd || null,
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        cccd: user.cccd,
        plan: user.plan,
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ", details: error.errors }, { status: 400 });
    }
    console.error("Update account error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi" }, { status: 500 });
  }
}
