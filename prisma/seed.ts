import { PrismaClient, TemplateCategory } from "@prisma/client";

const prisma = new PrismaClient();

const templates = [
  {
    name: "Nhà nguyên căn",
    slug: "nha-nguyen-can",
    category: TemplateCategory.HOUSE,
    description: "Hợp đồng cho thuê nhà riêng, biệt thự, nhà phố",
    icon: "🏠",
    isPremium: false,
    sortOrder: 1,
    contentJson: {
      sections: [
        { id: "header", title: "Tiêu đề hợp đồng", type: "header" },
        { id: "landlord", title: "Bên cho thuê (Bên A)", type: "party" },
        { id: "tenant", title: "Bên thuê (Bên B)", type: "party" },
        { id: "property", title: "Thông tin nhà cho thuê", type: "property", fields: ["address", "area", "floors", "rooms", "furniture"] },
        { id: "terms", title: "Điều khoản cho thuê", type: "terms", fields: ["rent", "deposit", "payment_date", "duration", "start_date", "utilities"] },
        { id: "rights", title: "Quyền và nghĩa vụ các bên", type: "static" },
        { id: "termination", title: "Chấm dứt hợp đồng", type: "static" },
        { id: "dispute", title: "Giải quyết tranh chấp", type: "static" },
        { id: "signatures", title: "Chữ ký", type: "signatures" },
      ],
    },
  },
  {
    name: "Chung cư / Căn hộ",
    slug: "chung-cu-can-ho",
    category: TemplateCategory.APARTMENT,
    description: "Hợp đồng cho thuê căn hộ chung cư",
    icon: "🏢",
    isPremium: false,
    sortOrder: 2,
    contentJson: {
      sections: [
        { id: "header", title: "Tiêu đề hợp đồng", type: "header" },
        { id: "landlord", title: "Bên cho thuê (Bên A)", type: "party" },
        { id: "tenant", title: "Bên thuê (Bên B)", type: "party" },
        { id: "property", title: "Thông tin căn hộ", type: "property", fields: ["address", "block", "floor", "area", "rooms", "furniture"] },
        { id: "terms", title: "Điều khoản cho thuê", type: "terms", fields: ["rent", "deposit", "management_fee", "payment_date", "duration", "start_date", "utilities"] },
        { id: "rules", title: "Nội quy chung cư", type: "static" },
        { id: "rights", title: "Quyền và nghĩa vụ các bên", type: "static" },
        { id: "termination", title: "Chấm dứt hợp đồng", type: "static" },
        { id: "signatures", title: "Chữ ký", type: "signatures" },
      ],
    },
  },
  {
    name: "Phòng trọ",
    slug: "phong-tro",
    category: TemplateCategory.ROOM,
    description: "Hợp đồng cho thuê phòng trọ, nhà trọ",
    icon: "🚪",
    isPremium: false,
    sortOrder: 3,
    contentJson: {
      sections: [
        { id: "header", title: "Tiêu đề hợp đồng", type: "header" },
        { id: "landlord", title: "Bên cho thuê (Bên A)", type: "party" },
        { id: "tenant", title: "Bên thuê (Bên B)", type: "party" },
        { id: "property", title: "Thông tin phòng trọ", type: "property", fields: ["address", "room_number", "area", "furniture"] },
        { id: "terms", title: "Điều khoản cho thuê", type: "terms", fields: ["rent", "deposit", "electric_rate", "water_rate", "payment_date", "duration", "start_date"] },
        { id: "rules", title: "Nội quy nhà trọ", type: "static" },
        { id: "rights", title: "Quyền và nghĩa vụ các bên", type: "static" },
        { id: "termination", title: "Chấm dứt hợp đồng", type: "static" },
        { id: "signatures", title: "Chữ ký", type: "signatures" },
      ],
    },
  },
  {
    name: "Mặt bằng kinh doanh",
    slug: "mat-bang-kinh-doanh",
    category: TemplateCategory.COMMERCIAL,
    description: "Hợp đồng cho thuê văn phòng, cửa hàng, showroom",
    icon: "💼",
    isPremium: true,
    sortOrder: 4,
    contentJson: {
      sections: [
        { id: "header", title: "Tiêu đề hợp đồng", type: "header" },
        { id: "landlord", title: "Bên cho thuê (Bên A)", type: "party" },
        { id: "tenant", title: "Bên thuê (Bên B)", type: "party" },
        { id: "property", title: "Thông tin mặt bằng", type: "property", fields: ["address", "area", "floors", "purpose"] },
        { id: "terms", title: "Điều khoản cho thuê", type: "terms", fields: ["rent", "deposit", "payment_date", "duration", "start_date", "utilities", "renovation"] },
        { id: "rights", title: "Quyền và nghĩa vụ các bên", type: "static" },
        { id: "termination", title: "Chấm dứt hợp đồng", type: "static" },
        { id: "dispute", title: "Giải quyết tranh chấp", type: "static" },
        { id: "signatures", title: "Chữ ký", type: "signatures" },
      ],
    },
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  for (const tpl of templates) {
    await prisma.template.upsert({
      where: { slug: tpl.slug },
      update: tpl,
      create: tpl,
    });
    console.log(`  ✓ Template: ${tpl.name}`);
  }

  console.log("✅ Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
