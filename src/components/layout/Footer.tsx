import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import Logo from "@/components/brand/Logo";

const FOOTER_LINKS: Record<string, { href: string; label: string }[]> = {
  "Sản phẩm": [
    { href: "#features", label: "Tính năng" },
    { href: "#templates", label: "Mẫu hợp đồng" },
    { href: "#pricing", label: "Bảng giá" },
  ],
  "Công ty": [
    { href: "#", label: "Về chúng tôi" },
    { href: "#", label: "Điều khoản dịch vụ" },
    { href: "#", label: "Chính sách bảo mật" },
  ],
  "Hỗ trợ": [
    { href: "#", label: "Câu hỏi thường gặp" },
    { href: "#", label: "Liên hệ" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <Link href="/">
              <Logo />
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
              Nền tảng tạo, ký và quản lý hợp đồng thuê nhà điện tử, chuẩn pháp lý cho thị trường Việt Nam.
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-slate-500">
              <a href="mailto:support@vjconnect.com" className="flex items-center gap-2 hover:text-brand-600">
                <Mail size={16} /> support@vjconnect.com
              </a>
              <a href="tel:19001234" className="flex items-center gap-2 hover:text-brand-600">
                <Phone size={16} /> 1900 1234
              </a>
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
              <ul className="mt-3 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-slate-500 hover:text-brand-600">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} VJConnect. Đã đăng ký bản quyền.</p>
          <p className="text-xs text-slate-400">Hỗ trợ ký số qua VNPT SmartCA</p>
        </div>
      </div>
    </footer>
  );
}
