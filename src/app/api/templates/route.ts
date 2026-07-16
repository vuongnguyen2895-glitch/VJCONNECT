import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const templates = await db.template.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      description: true,
      icon: true,
      isPremium: true,
      contentJson: true,
    },
  });

  return NextResponse.json({ templates });
}
