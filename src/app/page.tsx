import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  Cloud,
  DoorOpen,
  FileCheck2,
  FileText,
  Home,
  LayoutDashboard,
  Lock,
  PenLine,
  ShieldCheck,
  User,
  X,
  Zap,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Faq from "@/components/marketing/Faq";

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Chuẩn theo quy định pháp luật hiện hành" },
  { icon: FileCheck2, label: "Ký số hợp lệ qua VNPT SmartCA" },
  { icon: Lock, label: "Mã hoá dữ liệu SSL 256-bit" },
  { icon: Cloud, label: "Sao lưu tự động trên đám mây" },
];

const STEPS = [
  {
    icon: FileText,
    title: "Chọn mẫu hợp đồng",
    description: "Nhà nguyên căn, căn hộ, phòng trọ hay mặt bằng kinh doanh — chọn đúng mẫu cho tài sản của bạn.",
  },
  {
    icon: PenLine,
    title: "Điền thông tin các bên",
    description: "Nhập thông tin bên cho thuê, bên thuê và điều khoản hợp đồng theo từng bước hướng dẫn.",
  },
  {
    icon: CheckCircle2,
    title: "Xem lại & ký số",
    description: "Kiểm tra bản xem trước, gửi cho bên thuê ký số qua VNPT SmartCA ngay trên điện thoại.",
  },
  {
    icon: LayoutDashboard,
    title: "Lưu trữ & quản lý",
    description: "Hợp đồng đã ký được lưu trữ an toàn, tự động nhắc hạn trước khi hết hiệu lực.",
  },
];

const TEMPLATES = [
  {
    icon: Home,
    name: "Nhà nguyên căn",
    description: "Hợp đồng cho thuê nhà riêng, biệt thự, nhà phố nguyên căn.",
    premium: false,
  },
  {
    icon: Building2,
    name: "Chung cư / Căn hộ",
    description: "Hợp đồng cho thuê căn hộ chung cư, kèm nội quy toà nhà.",
    premium: false,
  },
  {
    icon: DoorOpen,
    name: "Phòng trọ",
    description: "Hợp đồng cho thuê phòng trọ, nhà trọ với điều khoản điện nước.",
    premium: false,
  },
  {
    icon: Briefcase,
    name: "Mặt bằng kinh doanh",
    description: "Hợp đồng cho thuê văn phòng, cửa hàng, showroom.",
    premium: true,
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Tạo hợp đồng trong 5 phút",
    description: "Wizard 5 bước dẫn dắt từng phần, không cần hiểu biết pháp lý chuyên sâu.",
  },
  {
    icon: ShieldCheck,
    title: "Chuẩn pháp lý",
    description: "Mẫu hợp đồng được soạn theo quy định hiện hành, cập nhật khi luật thay đổi.",
  },
  {
    icon: PenLine,
    title: "Ký số hợp lệ",
    description: "Tích hợp VNPT SmartCA — chữ ký điện tử có giá trị pháp lý như ký tay.",
  },
  {
    icon: FileText,
    title: "Xuất PDF tức thì",
    description: "Tải về hoặc gửi thẳng bản PDF cho bên thuê ngay sau khi hoàn tất.",
  },
  {
    icon: Bell,
    title: "Nhắc hạn hợp đồng",
    description: "Nhận thông báo trước khi hợp đồng hết hạn để gia hạn kịp thời.",
  },
  {
    icon: LayoutDashboard,
    title: "Quản lý tập trung",
    description: "Theo dõi trạng thái ký, thời hạn và toàn bộ hợp đồng trên một dashboard.",
  },
];

const PLANS = [
  {
    name: "Miễn phí",
    price: "0₫",
    period: "mãi mãi",
    description: "Dùng thử để trải nghiệm quy trình tạo hợp đồng điện tử.",
    features: ["1 hợp đồng / tháng", "Mẫu cơ bản (nhà, căn hộ, phòng trọ)", "Xuất PDF không giới hạn", "Lưu trữ 3 tháng"],
    cta: "Bắt đầu miễn phí",
    highlighted: false,
  },
  {
    name: "Chuyên nghiệp",
    price: "Liên hệ",
    period: "để nhận báo giá",
    description: "Cho chủ nhà và môi giới quản lý nhiều hợp đồng thường xuyên.",
    features: [
      "Hợp đồng không giới hạn",
      "Toàn bộ mẫu, kể cả mẫu cao cấp",
      "Ký số VNPT SmartCA",
      "Nhắc hạn hợp đồng tự động",
      "Lưu trữ không giới hạn",
    ],
    cta: "Nâng cấp lên Pro",
    highlighted: true,
  },
  {
    name: "Doanh nghiệp",
    price: "Liên hệ",
    period: "tuỳ quy mô",
    description: "Cho công ty quản lý bất động sản với nhiều nhân sự.",
    features: ["Tất cả tính năng Pro", "Nhiều người dùng & phân quyền", "Tuỳ chỉnh mẫu hợp đồng riêng", "Hỗ trợ ưu tiên"],
    cta: "Liên hệ tư vấn",
    highlighted: false,
  },
];

const ROLES = [
  {
    icon: Briefcase,
    name: "Môi giới BĐS",
    headline: "Soạn hợp đồng ngay khi chốt khách",
    benefits: [
      "Soạn hợp đồng từ mẫu chuẩn pháp lý chỉ trong vài phút",
      "Theo dõi trạng thái từng hợp đồng — bản nháp, chờ ký, đã ký — trên một dashboard",
      "Không còn hợp đồng thất lạc trong file Word hay tin nhắn Zalo",
    ],
  },
  {
    icon: Home,
    name: "Chủ nhà",
    headline: "Quản lý hợp đồng cho thuê từ xa",
    benefits: [
      "Tạo hợp đồng cho thuê chuẩn pháp lý mà không cần rành luật",
      "Quản lý toàn bộ hợp đồng, thời hạn và giá thuê ở một nơi duy nhất",
      "Xuất PDF và tải về ngay khi cần, không phải in giấy",
    ],
  },
  {
    icon: User,
    name: "Người thuê",
    headline: "Minh bạch điều khoản ngay từ đầu",
    benefits: [
      "Điều khoản thuê nhà, giá thuê và đặt cọc rõ ràng ngay từ bản đầu tiên",
      "Xem lại hợp đồng mọi lúc, không lo thất lạc giấy tờ",
      "Biết chính xác ngày thanh toán và ngày hết hạn hợp đồng",
    ],
  },
];

const OLD_WAY = [
  "Hợp đồng viết tay hoặc file Word rời rạc, dễ thất lạc",
  "Mỗi lần cần hợp đồng phải lục lại email, Zalo, hoặc ổ cứng",
  "Không nhớ chính xác ngày hết hạn, bị động khi khách báo trả nhà",
  "Không biết hợp đồng nào là bản mới nhất đã thống nhất",
];

const NEW_WAY = [
  "Mọi hợp đồng lưu tập trung trên một dashboard, tìm kiếm tức thì",
  "Soạn hợp đồng chuẩn pháp lý chỉ trong 5 phút, không cần hiểu luật",
  "Theo dõi trạng thái từng hợp đồng: bản nháp, chờ ký, đã ký, sắp hết hạn",
  "Xuất PDF ngay khi cần, gửi cho đối tác không mất công in ấn",
];

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-white to-white">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,#cbd5e1_1px,transparent_0)] [background-size:32px_32px] opacity-40 [mask-image:radial-gradient(ellipse_65%_50%_at_50%_0%,black,transparent)]"
          />
          <div
            aria-hidden
            className="absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-brand-300/30 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -left-24 top-40 -z-10 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl"
          />

          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-2 lg:px-8">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-700 ring-1 ring-inset ring-brand-200">
                <ShieldCheck size={14} /> Chuẩn pháp lý · Ký số VNPT SmartCA
              </span>

              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                Hợp đồng thuê nhà điện tử,
                <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent"> xong trong 5 phút</span>
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
                Tạo, ký và quản lý hợp đồng cho thuê nhà trực tuyến — không cần rành luật, không cần in giấy.
                Chuẩn pháp lý, có giá trị chữ ký điện tử ngay từ bản đầu tiên.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="btn-primary text-base">
                  Tạo hợp đồng miễn phí <ArrowRight size={18} />
                </Link>
                <a href="#how-it-works" className="btn-outline text-base">
                  Xem cách hoạt động
                </a>
              </div>

              <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-200 pt-6 sm:max-w-md">
                <div>
                  <dt className="text-xs font-medium text-slate-500">Thời gian</dt>
                  <dd className="mt-1 text-lg font-bold text-slate-900">~5 phút</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Mẫu hợp đồng</dt>
                  <dd className="mt-1 text-lg font-bold text-slate-900">4+ loại</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">Chi phí bắt đầu</dt>
                  <dd className="mt-1 text-lg font-bold text-slate-900">0₫</dd>
                </div>
              </dl>
            </div>

            {/* Contract preview mockup */}
            <div className="relative mx-auto w-full max-w-md lg:mx-0">
              <div
                aria-hidden
                className="absolute -right-4 -top-4 h-full w-full rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 opacity-90 sm:-right-6 sm:-top-6"
              />
              <div className="card relative p-6 shadow-xl shadow-slate-900/10 sm:p-7">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-xs font-medium text-slate-400">Hợp đồng số</p>
                    <p className="font-mono text-sm font-semibold text-slate-800">VJC-2026-00001</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 size={13} /> Đã ký
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Bên cho thuê</span>
                    <span className="h-3 w-24 rounded-full bg-slate-100" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Bên thuê</span>
                    <span className="h-3 w-20 rounded-full bg-slate-100" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Giá thuê / tháng</span>
                    <span className="h-3 w-16 rounded-full bg-slate-100" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Thời hạn</span>
                    <span className="h-3 w-16 rounded-full bg-slate-100" />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-medium text-slate-400">Bên A</p>
                    <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <PenLine size={12} /> Đã ký số
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-medium text-slate-400">Bên B</p>
                    <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <PenLine size={12} /> Đã ký số
                    </p>
                  </div>
                </div>
              </div>

              <div className="card absolute -bottom-6 -left-6 hidden items-center gap-2.5 px-4 py-3 shadow-lg shadow-slate-900/10 sm:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <Zap size={16} />
                </span>
                <div>
                  <p className="text-xs font-medium text-slate-400">Hoàn tất trong</p>
                  <p className="text-sm font-bold text-slate-800">4 phút 12 giây</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust bar */}
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-6 sm:px-6 md:grid-cols-4 lg:px-8">
            {TRUST_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5">
                <item.icon size={18} className="shrink-0 text-brand-600" />
                <span className="text-sm font-medium text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Cách hoạt động</h2>
            <p className="mt-4 text-lg text-slate-600">Bốn bước đơn giản, từ chọn mẫu đến hợp đồng có hiệu lực pháp lý.</p>
          </div>

          <div className="relative mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            <div
              aria-hidden
              className="absolute left-0 right-0 top-6 hidden h-px bg-slate-200 lg:block"
              style={{ marginInline: "12.5%" }}
            />
            {STEPS.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/25">
                  <step.icon size={22} />
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-brand-600">Bước {index + 1}</p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Templates */}
        <section id="templates" className="bg-slate-50 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Mẫu hợp đồng cho mọi loại tài sản</h2>
              <p className="mt-4 text-lg text-slate-600">Chọn đúng mẫu, các điều khoản pháp lý cần thiết đã được soạn sẵn.</p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {TEMPLATES.map((template) => (
                <div
                  key={template.name}
                  className="card group flex flex-col p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <template.icon size={22} />
                    </span>
                    {template.premium && (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-600">
                        Cao cấp
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">{template.name}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">{template.description}</p>
                  <Link
                    href="/register"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition-transform group-hover:gap-2"
                  >
                    Dùng mẫu này <ArrowRight size={15} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Mọi thứ bạn cần để cho thuê an tâm</h2>
            <p className="mt-4 text-lg text-slate-600">Từ soạn thảo đến ký số và lưu trữ, tất cả trong một nền tảng.</p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <feature.icon size={22} />
                </span>
                <h3 className="mt-4 text-base font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Roles */}
        <section id="for-you" className="bg-slate-50 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Thiết kế cho mọi vai trò trong giao dịch thuê nhà
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Môi giới chốt deal nhanh hơn. Chủ nhà quản lý từ xa. Người thuê yên tâm về điều khoản ngay từ đầu.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {ROLES.map((role) => (
                <div key={role.name} className="card p-7">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <role.icon size={22} />
                  </span>
                  <p className="mt-4 text-xs font-bold uppercase tracking-wide text-brand-600">{role.name}</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">{role.headline}</h3>
                  <ul className="mt-4 space-y-2.5">
                    {role.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600">
                        <Check size={15} className="mt-0.5 shrink-0 text-brand-600" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Old way vs VJConnect */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Vẫn là cách bạn cho thuê — chỉ chuyên nghiệp hơn
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Không yêu cầu bạn thay đổi thói quen. Chỉ chuyển những gì đang rời rạc thành hợp đồng có tổ chức, có thể tra cứu bất cứ lúc nào.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Cách cũ</p>
              <ul className="mt-4 space-y-3.5">
                {OLD_WAY.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600">
                    <X size={15} className="mt-0.5 shrink-0 text-slate-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-brand-500 bg-white p-7 shadow-lg shadow-brand-500/10">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Với VJConnect</p>
              <ul className="mt-4 space-y-3.5">
                {NEW_WAY.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-brand-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="bg-slate-50 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Bảng giá đơn giản, minh bạch</h2>
              <p className="mt-4 text-lg text-slate-600">Bắt đầu miễn phí, nâng cấp khi bạn cần nhiều hợp đồng hơn.</p>
            </div>

            <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-2xl border p-7 ${
                    plan.highlighted
                      ? "border-brand-500 bg-white shadow-xl shadow-brand-500/10 lg:-translate-y-3"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-1 text-xs font-semibold text-white">
                      Phổ biến nhất
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
                  <div className="mt-5">
                    <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
                    <span className="ml-1.5 text-sm text-slate-500">{plan.period}</span>
                  </div>
                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check size={16} className="mt-0.5 shrink-0 text-brand-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register"
                    className={plan.highlighted ? "btn-primary mt-7 justify-center" : "btn-outline mt-7 justify-center"}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Câu hỏi thường gặp</h2>
            <p className="mt-4 text-lg text-slate-600">Câu trả lời cho những thắc mắc phổ biến nhất.</p>
          </div>
          <Faq />
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-16 text-center sm:px-16">
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:28px_28px]"
            />
            <div className="relative">
              <Clock3 className="mx-auto text-white/70" size={32} />
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Sẵn sàng cho thuê nhà không giấy tờ rườm rà?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-brand-50">
                Tạo hợp đồng đầu tiên miễn phí ngay hôm nay — không cần thẻ tín dụng.
              </p>
              <Link
                href="/register"
                className="btn mt-8 bg-white px-7 py-3.5 text-base text-brand-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
              >
                Tạo hợp đồng miễn phí <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
