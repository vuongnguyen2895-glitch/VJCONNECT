import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone, PhoneCall } from "lucide-react";
import Logo from "@/components/brand/Logo";

const CONTACT = {
  address: "95 đường N2, KĐT Global City, Q2, TP.HCM",
  email: "info@hopdongthue.com",
  phoneDisplay: "036.731.5165",
  phoneDial: "0367315165",
};

function ZaloIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M7.5 8.5h9l-9 7h9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TikTokIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16.5 2h-3.2v13.6c0 1.5-1.2 2.7-2.7 2.7a2.7 2.7 0 0 1-2.7-2.7 2.7 2.7 0 0 1 2.7-2.7c.3 0 .6 0 .9.1V9.8a6 6 0 0 0-.9-.1A5.9 5.9 0 0 0 4.7 15.6a5.9 5.9 0 0 0 5.9 5.9 5.9 5.9 0 0 0 5.9-5.9V8.4a8.3 8.3 0 0 0 4.8 1.5V6.7a5 5 0 0 1-4.8-4.7Z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { href: "#", label: "Facebook", icon: Facebook },
  { href: "#", label: "Instagram", icon: Instagram },
  { href: "#", label: "TikTok", icon: TikTokIcon },
  { href: `https://zalo.me/${CONTACT.phoneDial}`, label: "Zalo", icon: ZaloIcon },
];

const FOOTER_LINKS: Record<string, { href: string; label: string }[]> = {
  "Sản phẩm": [
    { href: "#features", label: "Tính năng" },
    { href: "#templates", label: "Mẫu hợp đồng" },
    { href: "#pricing", label: "Bảng giá" },
  ],
  "Công ty": [
    { href: "/about", label: "Về chúng tôi" },
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
              <span className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0" /> {CONTACT.address}
              </span>
              <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 hover:text-brand-600">
                <Mail size={16} /> {CONTACT.email}
              </a>
              <a href={`tel:${CONTACT.phoneDial}`} className="flex items-center gap-2 hover:text-brand-600">
                <Phone size={16} /> {CONTACT.phoneDisplay}
              </a>
            </div>

            <div className="mt-4 flex items-center gap-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-brand-200 hover:text-brand-600"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
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

      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        <a
          href={`https://zalo.me/${CONTACT.phoneDial}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Nhắn Zalo"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0068FF] p-3 text-white shadow-lg transition-transform hover:scale-105"
        >
          <ZaloIcon className="h-6 w-6" />
        </a>
        <a
          href={`tel:${CONTACT.phoneDial}`}
          aria-label="Gọi điện"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 p-3 text-white shadow-lg transition-transform hover:scale-105"
        >
          <PhoneCall className="h-6 w-6" />
        </a>
      </div>
    </footer>
  );
}
