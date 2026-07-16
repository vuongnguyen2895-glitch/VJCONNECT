import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "VJConnect — Hợp đồng thuê nhà điện tử",
  description: "Tạo, ký và quản lý hợp đồng cho thuê nhà trực tuyến chỉ trong 5 phút. Chuẩn pháp lý, ký số qua VNPT SmartCA.",
  keywords: "hợp đồng thuê nhà, ký điện tử, cho thuê nhà, hợp đồng online, VNPT SmartCA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: "12px", padding: "12px 16px", fontSize: "14px" },
          }}
        />
      </body>
    </html>
  );
}
