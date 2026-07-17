import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Heart,
  LayoutDashboard,
  Lock,
  Mail,
  PenLine,
  ShieldCheck,
  Target,
  Zap,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const VALUES = [
  {
    icon: Target,
    title: "Sứ mệnh",
    description:
      "Số hóa quy trình cho thuê nhà tại Việt Nam, giúp mọi giao dịch thuê nhà trở nên minh bạch, nhanh chóng và đúng quy định pháp luật.",
  },
  {
    icon: Building2,
    title: "Tầm nhìn",
    description:
      "Trở thành nền tảng công nghệ bất động sản được tin dùng hàng đầu tại Việt Nam trong lĩnh vực hợp đồng thuê nhà điện tử.",
  },
  {
    icon: Heart,
    title: "Cam kết",
    description:
      "Đặt lợi ích người dùng lên hàng đầu — mẫu hợp đồng cập nhật theo quy định pháp luật hiện hành, dữ liệu được mã hoá và lưu trữ an toàn.",
  },
];

const WHY_ITEMS = [
  {
    icon: Building2,
    title: "Hậu thuẫn tài chính vững vàng",
    description:
      "Là đơn vị trực thuộc Công ty TNHH VJ Việt Nam và được hậu thuẫn bởi quỹ đầu tư nước ngoài, VJConnect có nguồn lực để đầu tư dài hạn vào sản phẩm.",
  },
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
    title: "Ký hợp đồng từ xa",
    description: "Gửi liên kết ký cho các bên, ký ngay trên điện thoại mà không cần gặp mặt trực tiếp.",
  },
  {
    icon: LayoutDashboard,
    title: "Quản lý tập trung",
    description: "Theo dõi trạng thái ký, thời hạn và toàn bộ hợp đồng trên một dashboard.",
  },
  {
    icon: Lock,
    title: "Bảo mật dữ liệu",
    description: "Dữ liệu được mã hoá SSL 256-bit và sao lưu tự động trên đám mây.",
  },
];

const COMPANY_INFO = [
  { label: "Tên công ty", value: "Công ty TNHH VJ Việt Nam" },
  { label: "Tên thương mại", value: "VJConnect" },
  { label: "Lĩnh vực", value: "Công nghệ thông tin" },
  { label: "Trụ sở", value: "Việt Nam" },
];

export default function AboutPage() {
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
          <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 md:py-28 lg:px-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-700 ring-1 ring-inset ring-brand-200">
              <Building2 size={14} /> Thành viên VJ Vietnam Group
            </span>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Kiến tạo nền tảng
              <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
                {" "}
                hợp đồng số
              </span>{" "}
              cho thị trường Việt Nam
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
              VJConnect là sản phẩm công nghệ trực thuộc Công ty TNHH VJ Việt Nam, được hậu thuẫn bởi quỹ đầu tư nước
              ngoài, với sứ mệnh số hóa quy trình cho thuê nhà tại Việt Nam — minh bạch, đúng pháp luật và dễ tiếp cận
              cho mọi chủ nhà và người thuê.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/register" className="btn-primary text-base">
                Tạo hợp đồng miễn phí <ArrowRight size={18} />
              </Link>
              <a href="mailto:support@vjconnect.com" className="btn-outline text-base">
                <Mail size={18} /> Liên hệ hợp tác
              </a>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Về VJConnect</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                Đơn vị công nghệ trực thuộc Công ty TNHH VJ Việt Nam
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate-600">
                VJConnect.com là sản phẩm công nghệ trực thuộc <strong className="text-slate-900">Công ty TNHH VJ Việt Nam</strong>{" "}
                — doanh nghiệp hoạt động trong lĩnh vực công nghệ thông tin, được hậu thuẫn bởi quỹ đầu tư nước ngoài.
              </p>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Chúng tôi ra đời để giải quyết những bất cập còn tồn tại trong quy trình cho thuê bất động sản truyền
                thống tại Việt Nam: hợp đồng thiếu chuẩn hóa, rủi ro pháp lý, và các bước thực hiện thủ công tốn thời
                gian.
              </p>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Với sự hậu thuẫn tài chính từ nhà đầu tư nước ngoài, chúng tôi có nguồn lực để đầu tư dài hạn vào việc
                hoàn thiện sản phẩm, cập nhật đúng theo các quy định pháp luật hiện hành và không ngừng cải tiến trải
                nghiệm người dùng.
              </p>
            </div>

            <div className="card p-7">
              <h3 className="text-sm font-bold text-slate-900">Cơ cấu tổ chức</h3>
              <div className="mt-6 flex flex-col items-center">
                <div className="rounded-2xl border-2 border-brand-200 bg-brand-50 px-6 py-3 text-center">
                  <p className="text-sm font-bold text-brand-700">Quỹ đầu tư nước ngoài</p>
                </div>
                <div className="h-6 w-0.5 bg-slate-300" />
                <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 px-6 py-3 text-center">
                  <p className="text-sm font-bold text-amber-700">Công ty TNHH VJ Việt Nam</p>
                </div>
                <div className="h-6 w-0.5 bg-slate-300" />
                <div className="rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-7 py-4 text-center shadow-md shadow-brand-500/25">
                  <p className="text-base font-bold text-white">VJConnect.com</p>
                  <p className="text-xs text-brand-50">Nền tảng hợp đồng thuê nhà điện tử</p>
                </div>
              </div>

              <dl className="mt-8 space-y-2.5 border-t border-slate-100 pt-6">
                {COMPANY_INFO.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <dt className="text-slate-400">{item.label}</dt>
                    <dd className="font-semibold text-slate-800">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Mission / Vision / Commitment */}
        <section className="bg-slate-50 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Giá trị cốt lõi của chúng tôi
              </h2>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
              {VALUES.map((value) => (
                <div key={value.title} className="card p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                    <value.icon size={22} />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why choose us */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Vì sao chọn VJConnect?</h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {WHY_ITEMS.map((item) => (
              <div key={item.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <item.icon size={20} />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-16 text-center sm:px-16">
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:28px_28px]"
            />
            <div className="relative">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Sẵn sàng hợp tác cùng VJConnect?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-brand-50">
                Dù bạn là chủ nhà cá nhân, công ty quản lý bất động sản hay đối tác công nghệ — chúng tôi luôn sẵn
                sàng đồng hành.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="btn justify-center bg-white px-7 py-3.5 text-base text-brand-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
                >
                  Bắt đầu miễn phí <ArrowRight size={18} />
                </Link>
                <a
                  href="mailto:support@vjconnect.com"
                  className="btn justify-center border-2 border-white/70 px-7 py-3 text-base text-white hover:bg-white/10"
                >
                  <Mail size={18} /> Liên hệ hợp tác
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
