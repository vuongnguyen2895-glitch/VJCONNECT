# VJConnect.com — Nền tảng hợp đồng thuê nhà điện tử

## 🚀 Quick Start (Phase 1 MVP)

### Yêu cầu hệ thống
- Node.js 18+
- PostgreSQL 14+ (hoặc dùng Supabase/Neon miễn phí)
- npm hoặc yarn

### Bước 1: Cài đặt dependencies
```bash
cd vjconnect
npm install
```

### Bước 2: Cấu hình environment
```bash
cp .env.example .env
# Mở .env và điền thông tin database, JWT secret, etc.
```

#### Tạo database PostgreSQL nhanh (Supabase - miễn phí):
1. Truy cập https://supabase.com → New Project
2. Copy connection string vào `DATABASE_URL` trong `.env`
3. Format: `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`

### Bước 3: Setup database
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed dữ liệu mẫu (templates)
npx tsx prisma/seed.ts

# (Optional) Mở Prisma Studio để xem database
npx prisma studio
```

### Bước 4: Chạy development server
```bash
npm run dev
```
→ Mở http://localhost:3000

---

## 📁 Cấu trúc project

```
vjconnect/
├── prisma/
│   ├── schema.prisma          # Database schema (đã hoàn chỉnh)
│   └── seed.ts                # Seed templates
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── register/route.ts   # POST /api/auth/register
│   │   │   │   ├── login/route.ts      # POST /api/auth/login
│   │   │   │   ├── logout/route.ts     # POST /api/auth/logout
│   │   │   │   └── me/route.ts         # GET  /api/auth/me
│   │   │   ├── contracts/
│   │   │   │   ├── route.ts            # GET+POST /api/contracts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts        # GET+PATCH+DELETE /api/contracts/:id
│   │   │   │       └── pdf/route.ts    # GET /api/contracts/:id/pdf
│   │   │   ├── templates/route.ts      # GET /api/templates
│   │   │   └── dashboard/stats/route.ts # GET /api/dashboard/stats
│   │   ├── dashboard/                  # → CẦN TẠO: trang dashboard
│   │   ├── contracts/new/              # → CẦN TẠO: wizard tạo hợp đồng
│   │   ├── (auth)/login/              # → CẦN TẠO: trang đăng nhập
│   │   ├── (auth)/register/           # → CẦN TẠO: trang đăng ký
│   │   ├── layout.tsx                 # Root layout
│   │   ├── globals.css                # Tailwind CSS
│   │   └── page.tsx                   # → CẦN TẠO: landing page
│   ├── components/
│   │   ├── ui/                        # → CẦN TẠO: Button, Input, Modal...
│   │   ├── contract/                  # → CẦN TẠO: ContractWizard, Preview...
│   │   └── layout/                    # → CẦN TẠO: Navbar, Sidebar...
│   ├── lib/
│   │   ├── db.ts                      # Prisma client singleton
│   │   ├── auth.ts                    # Auth utilities (JWT, session)
│   │   ├── validations.ts            # Zod schemas
│   │   └── contract-utils.ts         # Contract helpers
│   ├── hooks/                         # → CẦN TẠO: useAuth, useContracts...
│   └── types/index.ts                 # TypeScript types
├── .env.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## ✅ Đã hoàn thành (backend + core)

- [x] Database schema (Prisma) — 10 models đầy đủ
- [x] Auth API (register, login, logout, session)
- [x] Contracts CRUD API (list, create, get, update, delete)
- [x] PDF generation API (HTML → print to PDF)
- [x] Templates API (list templates)
- [x] Dashboard stats API
- [x] Validation schemas (Zod)
- [x] Contract number generator (VJC-2026-00001)
- [x] Plan-based access control (free: 1 HĐ/tháng)
- [x] TypeScript types
- [x] Tailwind CSS setup

## 📋 Cần tiếp tục (frontend pages)

Sử dụng Claude Code để tạo các trang frontend:

### Priority 1 — Core pages
```
Prompt: "Tạo trang landing page cho VJConnect tại src/app/page.tsx 
dùng Tailwind CSS, dựa trên prototype đã có"
```
```
Prompt: "Tạo trang login tại src/app/(auth)/login/page.tsx 
gọi API POST /api/auth/login"
```
```
Prompt: "Tạo trang register tại src/app/(auth)/register/page.tsx"
```

### Priority 2 — Dashboard
```
Prompt: "Tạo trang dashboard tại src/app/dashboard/page.tsx,
gọi GET /api/dashboard/stats và GET /api/contracts,
hiển thị stats cards + danh sách hợp đồng"
```

### Priority 3 — Contract wizard
```
Prompt: "Tạo wizard tạo hợp đồng tại src/app/contracts/new/page.tsx,
5 bước: chọn mẫu → bên cho thuê → bên thuê → tài sản → điều khoản → xem lại,
gọi POST /api/contracts khi hoàn tất"
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | /api/auth/register | {name, email, password, phone?} | {user} |
| POST | /api/auth/login | {email, password} | {user} |
| POST | /api/auth/logout | — | {ok} |
| GET | /api/auth/me | — | {user} |

### Contracts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/contracts?status=&q=&page= | List contracts |
| POST | /api/contracts | Create contract |
| GET | /api/contracts/:id | Get contract detail |
| PATCH | /api/contracts/:id | Update draft contract |
| DELETE | /api/contracts/:id | Delete draft contract |
| GET | /api/contracts/:id/pdf | Generate PDF preview |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/templates | List contract templates |
| GET | /api/dashboard/stats | Dashboard statistics |

---

## 🛠 Development Tips

### Thêm migration mới
```bash
npx prisma migrate dev --name add_new_field
```

### Reset database
```bash
npx prisma migrate reset
npx tsx prisma/seed.ts
```

### Test API với curl
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"123456"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# List templates
curl http://localhost:3000/api/templates
```
