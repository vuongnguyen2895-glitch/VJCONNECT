"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "Hợp đồng tạo trên VJConnect có giá trị pháp lý không?",
    answer:
      "Mẫu hợp đồng được soạn theo Bộ luật Dân sự và Luật Nhà ở hiện hành. Tính năng ký số qua VNPT SmartCA — cho giá trị pháp lý tương đương chữ ký tay — đang được phát triển và sẽ ra mắt trong giai đoạn tiếp theo.",
  },
  {
    question: "Tôi có thể dùng thử miễn phí không?",
    answer:
      "Có, và đang có ưu đãi đặc biệt: mọi tài khoản đăng ký mới được sử dụng miễn phí toàn bộ tính năng Pro (hợp đồng không giới hạn, mẫu cao cấp, lưu trữ không giới hạn) trong vòng 1 năm đầu tiên, không cần thẻ tín dụng.",
  },
  {
    question: "VJConnect hỗ trợ những loại hợp đồng nào?",
    answer:
      "Hiện có 4 mẫu: nhà nguyên căn, chung cư/căn hộ, phòng trọ, và mặt bằng kinh doanh (mẫu cao cấp). Chúng tôi sẽ bổ sung thêm mẫu cho kho xưởng và đất trống trong thời gian tới.",
  },
  {
    question: "Dữ liệu của tôi có được bảo mật không?",
    answer: "Dữ liệu được mã hoá SSL 256-bit khi truyền tải và sao lưu tự động trên đám mây.",
  },
  {
    question: "Tôi có thể huỷ hoặc nâng cấp gói bất cứ lúc nào không?",
    answer: "Có. Không có ràng buộc hợp đồng dài hạn — bạn có thể nâng cấp, hạ cấp hoặc huỷ gói bất cứ lúc nào.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto mt-14 max-w-3xl divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
            >
              <span className="text-sm font-semibold text-slate-900 sm:text-base">{item.question}</span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-sm leading-relaxed text-slate-600 sm:px-6">{item.answer}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
