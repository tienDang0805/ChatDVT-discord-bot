# Đặng Văn Tiến × ChatDVT — Kết quả nghiên cứu định hướng

> Đây là đề xuất để lựa chọn phong cách. Chưa có hướng được người dùng duyệt. Các file frontend production giữ nguyên.

## Kết luận về thương hiệu

Dùng cả hai tên phù hợp với mục tiêu đã cung cấp, nếu có thứ bậc: Đặng Văn Tiến là danh tính nghề nghiệp recruiter cần nhớ; ChatDVT là sản phẩm đại diện. Homepage cần trả lời nhanh ba câu: Tiến làm công việc gì? Có sản phẩm nào để kiểm chứng? Liên hệ bằng cách nào?

Chuyên môn chính là Mobile Developer, React Native và Android/Kotlin. ChatDVT giúp chứng minh phạm vi học hỏi và khả năng xây sản phẩm cá nhân. Vì vậy, ảnh bot nên đi kèm mô tả vai trò và quyết định kỹ thuật của Tiến, thay vì chỉ có danh sách tính năng của bot.

## Vai trò của từng trang

| Trang | Câu hỏi cần trả lời | Nội dung ưu tiên |
|---|---|---|
| Homepage | Tiến là ai, nên xem gì tiếp? | Role, chân dung, sản phẩm chọn lọc, liên hệ |
| Mobile | Chuyên môn chính được thể hiện thế nào? | React Native/Android, toolkit và guide |
| Projects & Lab | Có những sản phẩm nào đáng xem? | Selected work trước; catalog và filter sau |
| Discord Bot | ChatDVT có hoạt động thực tế không? | Ảnh UI thật, mô tả ngắn, nguồn code và hành trình xây |
| AI Chat | Có thể hỏi gì về Tiến và website? | Giới thiệu công dụng, prompt gợi ý, giới hạn rõ |
| Blog | Tiến suy nghĩ và học như thế nào? | Bài viết thật; bài ChatDVT hiện có làm điểm neo |
| About Me | Kinh nghiệm và cách liên hệ? | South Telecom, 2023–nay, TP.HCM, năng lực, contact |

Sáu mục menu có thể giữ nguyên. Homepage làm lớp giới thiệu và chọn lọc; các trang con phục vụ chiều sâu. Việc thay label/menu order vẫn là lựa chọn sau khi chốt phong cách.

## Những gì ảnh Discord chứng minh

- Ảnh quiz đang chạy và ảnh hội thoại giới thiệu là hai bằng chứng dễ hiểu nhất khi recruiter xem nhanh.
- Modal thiết lập quiz cho thấy một flow có cấu hình cụ thể.
- Modal personality cho thấy bot có hệ thống tùy chỉnh danh tính và giọng văn.
- Modal API key phù hợp với phần giải thích cách vận hành; nên đặt ở gallery chi tiết, vì recruiter không cần nhập key để hiểu portfolio.
- Màu button/focus ring trong ảnh thuộc Discord. Không có đủ cơ sở coi blurple là màu thương hiệu bắt buộc của ChatDVT.
- Avatar ChatDVT cung cấp hai màu nhận diện riêng: vàng cam và cyan. Chân dung Tiến hiện có 320×320, đủ dùng cho avatar; nếu chọn hướng có portrait lớn thì nên bổ sung ảnh gốc chất lượng cao ở giai đoạn tinh chỉnh.

## Ba hướng và đánh đổi

| Hướng | Điểm mạnh theo brief | Điều cần cân nhắc khi chọn |
|---|---|---|
| 1 — Cinematic Signal | Tên nổi bật; sản phẩm thật xuất hiện ngay; có chất kỹ thuật | Chữ lớn và nền tối dễ chiếm sự chú ý hơn chuyên môn mobile; cần cân nhắc mật độ nội dung |
| 2 — Recruiter Ledger | Danh tính và bằng chứng tách rõ; thuận tiện quét kinh nghiệm, tool và liên hệ | ChatDVT nằm ở sâu hơn; trên mobile cần rút ngắn phần giới thiệu để đến sản phẩm sớm |
| 3 — Human × Sidekick | Thể hiện trực tiếp hai thương hiệu; có nhận diện riêng từ avatar | Portrait lớn phụ thuộc chất lượng ảnh; mascot và display đậm cần tiết chế để hợp recruiter |

Nhận định tư vấn: hướng 2 phù hợp nhất với ưu tiên recruiter hiện tại. Hướng 3 thể hiện cặp thương hiệu rõ nhất. Có thể kết hợp độ rõ của hướng 2 với một dấu hiệu nhận diện Tiến–ChatDVT của hướng 3. Đây là gợi ý, không phải quyết định thay người dùng.

## Cơ sở code đã dùng

- `client/src/site/pages/HomePage.tsx`: homepage hiện có selected projects, mobile tools, bài viết và ChatDVT band.
- `client/src/site/pages/MePage.tsx`: nguồn profile, kinh nghiệm, stack và contact hiện có.
- `client/src/site/pages/MobilePage.tsx`, `PlaygroundPage.tsx`: cấu trúc discovery cho toolkit và project.
- `client/src/site/pages/DiscordPage.tsx`, `ChatDVTChatPage.tsx`: hai bề mặt giới thiệu/trải nghiệm ChatDVT.
- `client/src/site/pages/BlogPage.tsx`: danh sách bài thật và fallback bài ChatDVT.
- `src/shared/featureCatalog.ts`: nguồn tên, mô tả, route và mức độ hiển thị của project.
- `client/public/images/tien-dang-profile.jpg` và `client/public/images/chibi/chatdvt.jpg`: asset hiện có, kết hợp với 5 screenshot người dùng cung cấp.

## Đầu ra của vòng này

Ba prototype chỉ minh họa ngôn ngữ thiết kế và cấu trúc nội dung. Chúng có thể mở, cuộn và dùng menu; chưa phải bản thiết kế chi tiết cuối cùng cho bảy trang. Sau khi người dùng chọn, mới lập page templates và component system thống nhất cho Homepage + sáu mục. Feature/tool/game/admin bên trong chưa nằm trong vòng redesign này.

Tham chiếu: [Huashu-Design](https://github.com/alchaincyf/huashu-design), [Brittany Chiang](https://brittanychiang.com/), [COLLINS](https://wearecollins.com/). Nguyên lý tổ chức thông tin và hệ nhận diện được diễn giải cho nội dung của Tiến; không dùng nội dung, số liệu hoặc thành tích của các tham chiếu làm dữ liệu portfolio.
