import { PrismaClient, TemplateCategory } from "@prisma/client";

const prisma = new PrismaClient();

const SHARE_ROOM_CLAUSES = [
  {
    id: "share-room-subject",
    title: "Đối tượng và địa chỉ thuê",
    content: [
      "Bên A đồng ý cho Bên B thuê 01 phòng/giường trong nhà/căn hộ theo hình thức ở ghép (share phòng) tại địa chỉ đã ghi tại phần Thông tin tài sản của hợp đồng này, để ở, không sử dụng làm văn phòng hay mục đích kinh doanh.",
      "Bên B được sử dụng khu vực riêng (giường, tủ, kệ được phân công) và các khu vực sinh hoạt chung (bếp, phòng khách, WC, ban công...) theo đúng Nội quy nhà chung đính kèm tại Phụ lục của hợp đồng này.",
    ].join("\n"),
  },
  {
    id: "share-room-payment",
    title: "Tiền thuê, đặt cọc và phương thức thanh toán",
    content: [
      "1. Tiền thuê phòng đã bao gồm phí quản lý, không bao gồm tiền điện, nước sinh hoạt, internet và phí gửi xe (nếu có).",
      "2. Tiền thuê phòng được thanh toán vào ngày thanh toán hàng tháng đã thỏa thuận trong hợp đồng.",
      "3. Bên B đặt cọc cho Bên A một khoản tiền đặt cọc như đã thỏa thuận. Khoản đặt cọc này được hoàn trả lại cho Bên B ngay sau khi kết thúc hợp đồng, với điều kiện Bên B không vi phạm bất kỳ điều khoản nào của hợp đồng.",
      "4. Trường hợp Bên B đơn phương chấm dứt hợp đồng trước hạn mà không thông báo theo đúng quy định, khoản tiền cọc sẽ không được hoàn lại.",
      "5. Trường hợp Bên A đơn phương chấm dứt hợp đồng trước hạn mà không thông báo theo đúng quy định, Bên A phải hoàn trả cọc và bồi thường thêm một khoản tương đương tiền cọc cho Bên B.",
      "6. Thanh toán bằng tiền mặt hoặc chuyển khoản theo thông tin tài khoản đã cung cấp trong hợp đồng.",
    ].join("\n"),
  },
  {
    id: "share-room-duration",
    title: "Thời hạn thuê",
    content: [
      "Thời hạn thuê được thực hiện theo ngày bắt đầu và ngày kết thúc đã ghi nhận trong hợp đồng.",
      "Trường hợp đến hạn chấm dứt hợp đồng mà hai bên không thông báo cho nhau về việc chấm dứt tối thiểu trước 30 ngày và Bên B vẫn tiếp tục ở, hợp đồng được xem như gia hạn theo từng tháng.",
      "Bên B muốn trả phòng trước hạn cần báo trước tối thiểu 30 ngày cho Bên A.",
    ].join("\n"),
  },
  {
    id: "share-room-rights-a",
    title: "Quyền và nghĩa vụ của Bên Cho Thuê",
    content: [
      "1. Được thanh toán tiền nhà đầy đủ, đúng hạn.",
      "2. Được quyền sắp xếp phòng, bố trí lại chỗ ở giữa các thành viên và đứng ra giải quyết các vấn đề chung của nhà/căn hộ khi cần thiết.",
      "3. Được quyền ra vào khu vực chung để kiểm tra, sửa chữa; thông báo trước ít nhất 12 giờ khi cần vào phòng riêng, trừ trường hợp khẩn cấp.",
      "4. Bàn giao phòng cho Bên B với đầy đủ trang thiết bị, nội thất hiện có và các tiện nghi chung đã thỏa thuận.",
      "5. Trường hợp lấy lại nhà, phải báo trước cho Bên B ít nhất 30 ngày và hoàn trả cọc đầy đủ.",
      "6. Hoàn trả tiền cọc cho Bên B nếu Bên B không vi phạm bất kỳ điều khoản nào của hợp đồng và nội quy nhà chung sau khi kết thúc thời hạn thuê.",
      "7. Tổ chức vệ sinh khu vực chung định kỳ theo gói dịch vụ đã thỏa thuận (nếu có).",
    ].join("\n"),
  },
  {
    id: "share-room-rights-b",
    title: "Quyền và nghĩa vụ của Bên Thuê",
    content: [
      "1. Được sử dụng khu vực riêng đã phân công và các khu vực sinh hoạt chung theo đúng Nội quy nhà chung đính kèm.",
      "2. Được hoàn trả tiền cọc sau khi hết hạn hợp đồng nếu không còn chi phí nào chưa thanh toán và không vi phạm nghĩa vụ nào trong hợp đồng.",
      "3. Thanh toán tiền thuê, tiền điện nước và các chi phí phát sinh đầy đủ, đúng hạn.",
      "4. Sử dụng phòng đúng mục đích để ở, không tự ý sửa chữa, cải tạo, khoan đục tường khi chưa được Bên A đồng ý bằng văn bản.",
      "5. Có trách nhiệm và chịu chi phí đối với các hư hỏng, mất mát trang thiết bị, nội thất do lỗi của mình hoặc khách do mình dẫn vào gây ra.",
      "6. Khi kết thúc hợp đồng, bàn giao lại phòng và khu vực chung trong tình trạng sạch sẽ, các thiết bị còn hoạt động tốt, trừ hao mòn hợp lý do sử dụng.",
      "7. Tuân thủ đầy đủ Nội quy nhà chung đính kèm tại Phụ lục của hợp đồng này — vi phạm nội quy được xử lý theo đúng các mức độ quy định tại nội quy.",
      "8. Không nuôi thú cưng, không tàng trữ hoặc sử dụng chất cấm dưới mọi hình thức trong phòng và khu vực chung.",
      "9. Báo trước cho Bên A tối thiểu 30 ngày trước khi trả phòng. Nếu chuyển đi trước khi hết hạn hợp đồng mà không tìm được người thay thế và không được Bên A đồng ý, Bên B sẽ mất tiền cọc.",
      "10. Quá hạn thanh toán tiền nhà từ 5 ngày trở lên phải thông báo lý do và được Bên A chấp thuận; nếu không được chấp thuận, Bên B có thể mất cọc và phải dọn đi theo yêu cầu của Bên A.",
    ].join("\n"),
  },
  {
    id: "share-room-general",
    title: "Điều khoản chung",
    content: [
      "1. Hợp đồng này được thực hiện đầy đủ bởi hai bên. Mọi điều chỉnh, bổ sung phải được sự đồng ý bằng văn bản của cả hai bên.",
      "2. Hợp đồng chấm dứt trước thời hạn nếu: Bên B không thanh toán đúng hạn theo quy định; Bên B gây mất trật tự, an ninh khu vực; tàng trữ hoặc sử dụng chất cấm theo quy định pháp luật; hoặc vi phạm các điều khoản của hợp đồng/nội quy mà không khắc phục sau khi đã được nhắc nhở quá 2 lần.",
      "3. Trong các trường hợp chấm dứt hợp đồng do lỗi của Bên B nêu trên, tiền cọc sẽ không được hoàn lại và Bên B phải thanh toán đầy đủ các chi phí phát sinh cho đến ngày trả phòng.",
      "4. Nếu có tranh chấp phát sinh, hai bên ưu tiên giải quyết thông qua hòa giải, thương lượng. Nếu không đạt được thỏa thuận, tranh chấp sẽ được đưa ra Tòa án có thẩm quyền giải quyết.",
      "5. Hợp đồng được lập thành 02 (hai) bản có giá trị pháp lý như nhau, mỗi bên giữ 01 (một) bản, có hiệu lực kể từ ngày ký.",
    ].join("\n"),
  },
  {
    id: "share-room-force-majeure",
    title: "Bất khả kháng",
    content: [
      "Các trường hợp bất khả kháng không do lỗi của Bên A hoặc Bên B, bao gồm: thiên tai, hỏa hoạn, dịch bệnh, chiến tranh; tài sản bị giải tỏa theo chính sách/dự án nhà nước; thay đổi quy hoạch đô thị ảnh hưởng nghiêm trọng đến việc sử dụng tài sản thuê.",
      "Nếu các trường hợp trên xảy ra và hai bên không thống nhất được phương án xử lý, bên bị ảnh hưởng có quyền thanh lý hợp đồng và thông báo trước cho bên còn lại ít nhất 15 ngày làm việc. Khi thanh lý, Bên A hoàn trả tiền đặt cọc và các khoản đã thanh toán trước sau khi trừ thời gian đã sử dụng thực tế (nếu có).",
    ].join("\n"),
  },
  {
    id: "share-room-house-rules",
    title: "Phụ lục: Nội quy nhà chung",
    content: [
      "Bằng việc ký hợp đồng này, Bên B xác nhận đã đọc, hiểu và đồng ý tuân thủ toàn bộ Nội quy nhà chung dưới đây — là một phần không thể tách rời của hợp đồng.",
      "I. QUY ĐỊNH CHUNG",
      "1. Tinh thần sống chung: Nhà chung là không gian sống chung dựa trên tinh thần tôn trọng, chia sẻ và trách nhiệm. Mỗi thành viên có nghĩa vụ giữ gìn không gian sống văn minh, sạch sẽ và an toàn cho tất cả mọi người.",
      "2. Giờ giấc sinh hoạt: Giờ yên tĩnh từ 22:00 – 07:00 hàng ngày, hạn chế tối đa tiếng ồn. Ngoài giờ yên tĩnh vẫn cần giữ âm lượng ở mức hợp lý, không ảnh hưởng người khác.",
      "3. An ninh & ra vào: Mỗi thành viên được cấp thẻ/chìa khóa riêng, không sao chép hoặc cho người ngoài mượn. Tắt đèn và thiết bị điện không cần thiết khi ra ngoài hoặc là người cuối cùng rời khỏi nhà. Không mở cửa cho người lạ.",
      "4. Đăng ký tạm trú: Thành viên có trách nhiệm cung cấp đầy đủ giấy tờ tùy thân (CCCD/CMND/Hộ chiếu) để Bên A thực hiện đăng ký tạm trú theo quy định pháp luật.",
      "5. Hợp đồng & thanh toán: Tiền phòng thanh toán đúng hạn, trễ hạn sẽ tính phí phạt theo quy định trong hợp đồng. Thành viên muốn trả phòng cần báo trước tối thiểu 30 ngày.",
      "II. QUY ĐỊNH PHÒNG RIÊNG (Private Room)",
      "1. Quyền riêng tư: Phòng riêng là không gian cá nhân, không ai được vào phòng người khác khi chưa có sự đồng ý. Ban quản lý chỉ vào phòng khi có lý do chính đáng và thông báo trước ít nhất 12 giờ, trừ trường hợp khẩn cấp; khi khách hết hợp đồng hoặc dọn đi thì được vào phòng nếu có khách mới muốn xem.",
      "2. Vệ sinh & bảo quản: Tự chịu trách nhiệm giữ phòng sạch sẽ, gọn gàng. Không để rác qua đêm trong phòng. Không khoan, đóng đinh, dán keo cứng hoặc thay đổi kết cấu phòng khi chưa có sự cho phép bằng văn bản.",
      "3. Thiết bị & tài sản: Bảo quản cẩn thận các thiết bị có sẵn trong phòng. Không tự ý mang thêm thiết bị điện công suất lớn khi chưa được phép.",
      "4. Vật nuôi: Không được nuôi thú cưng trong phòng riêng trừ khi có thỏa thuận riêng với ban quản lý và sự đồng thuận của các thành viên khác.",
      "III. QUY ĐỊNH PHÒNG GHÉP 1:1 (Shared Room)",
      "1. Tôn trọng không gian chung trong phòng: Mỗi thành viên được phân công khu vực riêng (giường, tủ, kệ) — không sử dụng đồ hoặc xâm phạm khu vực của người kia khi chưa được đồng ý. Trao đổi thẳng thắn, lịch sự khi có vấn đề phát sinh.",
      "2. Giờ giấc & sinh hoạt cá nhân: Tôn trọng giờ ngủ của bạn cùng phòng. Sau 22:30 hạn chế bật đèn chính, ưu tiên đèn đọc sách cá nhân. Sử dụng tai nghe khi nghe nhạc, xem phim, gọi video trong phòng.",
      "3. Vệ sinh & mùi: Giữ gọn gàng khu vực cá nhân. Phơi đồ đúng nơi quy định. Hạn chế nước hoa, xịt phòng có mùi quá nồng ảnh hưởng đến bạn cùng phòng.",
      "4. Khách vào phòng: Không được đưa khách vào phòng ghép qua đêm. Khách thăm chỉ được vào phòng trong khung giờ 08:00 – 21:00 và phải có sự đồng ý của bạn cùng phòng.",
      "5. Giải quyết mâu thuẫn: Liên hệ ban quản lý để được hỗ trợ hòa giải nếu không tự giải quyết được. Ban quản lý có quyền sắp xếp lại phòng khi cần thiết để đảm bảo chất lượng sống cho tất cả.",
      "IV. QUY ĐỊNH KHU VỰC WC / PHÒNG TẮM",
      "1. Thời gian sử dụng: Không quá 30 phút vào giờ cao điểm (06:00–08:30 và 17:00–19:00). Không khóa cửa WC khi không sử dụng.",
      "2. Vệ sinh sau khi sử dụng: Xả nước sau khi dùng toilet, bỏ giấy vệ sinh đúng nơi. Nhặt tóc rụng ở lỗ thoát nước sau mỗi lần tắm.",
      "3. Đồ dùng cá nhân: Mỗi thành viên tự phân chia chỗ để đồ cá nhân, không dùng đồ dùng cá nhân của người khác.",
      "4. Bảo trì: Phát hiện hỏng hóc phải báo ban quản lý ngay để được sửa chữa kịp thời.",
      "V. QUY ĐỊNH KHU VỰC BẾP (Kitchen)",
      "1. Nguyên tắc sử dụng: Dọn dẹp ngay sau khi nấu ăn — rửa chén bát, lau bếp, lau bàn. Không để chén bát bẩn trong bồn rửa quá 02 giờ.",
      "2. Thực phẩm & tủ lạnh: Không sử dụng hoặc lấy thực phẩm của người khác khi chưa được phép.",
      "3. Thiết bị nhà bếp: Sử dụng đúng cách, tắt bếp ngay sau khi nấu xong. Tuyệt đối không rời khỏi bếp khi đang nấu ăn để tránh nguy cơ hỏa hoạn. Thiết bị hư hỏng phải báo ngay cho ban quản lý, không tự sửa chữa.",
      "4. Rác thải & vệ sinh: Đổ rác bếp hàng ngày hoặc khi đầy, không để bốc mùi.",
      "5. Nấu ăn có mùi nặng: Bật quạt hút/mở cửa thông gió khi nấu món có mùi nặng, vệ sinh kỹ hơn sau khi nấu.",
      "VI. QUY ĐỊNH KHU VỰC PHÒNG KHÁCH (Living Room)",
      "1. Mục đích sử dụng: Không gian sinh hoạt chung cho tất cả thành viên, không chiếm dụng cho mục đích cá nhân trong thời gian dài.",
      "2. Gọn gàng & sạch sẽ: Trả lại đồ đạc về vị trí ban đầu sau khi sử dụng. Không ăn uống trên sofa (trừ đồ uống có nắp). Không để giày dép bừa bãi.",
      "3. TV & thiết bị giải trí: Ưu tiên xem chương trình chung khi có nhiều người. Giữ âm lượng vừa phải, đặc biệt sau 21:00.",
      "4. Làm việc tại phòng khách: Không họp online bằng loa ngoài tại khu vực này, dùng tai nghe hoặc di chuyển đến khu vực phù hợp.",
      "VII. QUY ĐỊNH VỀ KHÁCH ĐẾN THĂM",
      "1. Đăng ký trước: Thông báo trước cho ban quản lý qua nhóm chat/Zalo. Khách chỉ được đến trong khung giờ 08:00 – 21:00, trừ khi có thỏa thuận khác.",
      "2. Trách nhiệm: Thành viên mời khách chịu toàn bộ trách nhiệm về hành vi của khách. Khách phải tuân thủ nội quy nhà chung.",
      "3. Khách ở qua đêm: Không được ở qua đêm tại phòng ghép 1:1. Tại phòng riêng, khách có thể ở qua đêm tối đa 03 đêm/tháng, phải thông báo trước với ban quản lý.",
      "4. Giới hạn: Mỗi lần tối đa 02 khách. Không tổ chức tiệc, tụ tập đông người khi chưa có sự đồng ý của ban quản lý và các thành viên khác.",
      "VIII. QUY ĐỊNH AN TOÀN & PHÒNG CHÁY CHỮA CHÁY",
      "Cấm hút thuốc trong toàn bộ khu vực nhà (bao gồm ban công, phòng riêng). Cấm sử dụng chất cấm dưới mọi hình thức. Không thắp nến, đốt nhang, sử dụng bếp cồn hoặc nguồn lửa hở trong phòng ngủ. Nắm rõ vị trí bình chữa cháy và lối thoát hiểm, không chặn lối thoát hiểm bằng đồ đạc, xe cộ.",
      "IX. QUY ĐỊNH VỀ INTERNET & TIỆN ÍCH CHUNG",
      "WiFi cung cấp cho toàn bộ nhà, không tự ý thay đổi mật khẩu/thiết lập router. Không sử dụng mạng cho hoạt động bất hợp pháp. Máy giặt dùng theo nguyên tắc ai đến trước dùng trước, lấy đồ ra trong vòng 30 phút sau khi máy chạy xong. Phơi đồ đúng khu vực quy định.",
      "X. XỬ LÝ VI PHẠM",
      "Nhắc nhở lần 1 (vi phạm vệ sinh, tiếng ồn nhẹ, quên dọn dẹp): nhắc nhở qua nhóm chat hoặc trực tiếp. Nhắc nhở lần 2 (tái phạm sau lần 1): cảnh cáo bằng văn bản. Nhắc nhở lần 3 (tiếp tục tái phạm): phạt tiền theo quy định hợp đồng. Vi phạm nghiêm trọng (sử dụng chất cấm, gây mất an ninh, trộm cắp, bạo lực, phá hoại tài sản): chấm dứt hợp đồng ngay lập tức, không hoàn cọc.",
      "XI. QUYỀN & TRÁCH NHIỆM CỦA BAN QUẢN LÝ",
      "Đảm bảo cơ sở vật chất hoạt động tốt, sửa chữa kịp thời khi có hư hỏng. Hỗ trợ giải quyết mâu thuẫn giữa các thành viên công bằng. Tổ chức vệ sinh chung định kỳ (tùy gói dịch vụ). Kiểm tra cơ sở vật chất và PCCC định kỳ, có thông báo trước. Có quyền cập nhật nội quy khi cần thiết, thông báo cho thành viên trước ít nhất 07 ngày.",
    ].join("\n"),
  },
];

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
  {
    name: "Ở ghép / Share phòng",
    slug: "o-ghep-share-phong",
    category: TemplateCategory.ROOM,
    description: "Hợp đồng cho thuê phòng ở ghép, share phòng trong nhà chung/co-living",
    icon: "🛏️",
    isPremium: false,
    sortOrder: 5,
    contentJson: {
      sections: [
        { id: "header", title: "Tiêu đề hợp đồng", type: "header" },
        { id: "landlord", title: "Bên cho thuê (Bên A)", type: "party" },
        { id: "tenant", title: "Bên thuê (Bên B)", type: "party" },
        { id: "property", title: "Thông tin phòng ở ghép", type: "property", fields: ["address", "room_number", "area", "furniture"] },
        { id: "terms", title: "Điều khoản cho thuê", type: "terms", fields: ["rent", "deposit", "payment_date", "duration", "start_date", "utilities"] },
        { id: "rules", title: "Nội quy nhà chung", type: "static" },
        { id: "rights", title: "Quyền và nghĩa vụ các bên", type: "static" },
        { id: "termination", title: "Chấm dứt hợp đồng", type: "static" },
        { id: "signatures", title: "Chữ ký", type: "signatures" },
      ],
      defaultClauses: SHARE_ROOM_CLAUSES,
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
