# Đặng Văn Tiến × ChatDVT · Brand Spec

> Ngày tổng hợp: 2026-10-01  
> Nguồn: codebase hiện tại, ảnh đại diện hiện có và 5 ảnh chụp ChatDVT trên Discord do người dùng cung cấp.  
> Mức độ đầy đủ: đủ cho vòng định hướng hình ảnh; chưa có logo vector/VI chính thức.

## 1. Kiến trúc thương hiệu

- **Thương hiệu con người:** `Đặng Văn Tiến` là chủ website, chủ thể chính ở Homepage và Me. Đây là tên recruiter cần nhớ, gắn với vai trò `Mobile Developer · React Native · Android/Kotlin`.
- **Thương hiệu sản phẩm:** `ChatDVT` là flagship product và là bằng chứng rõ nhất cho khả năng biến ý tưởng thành sản phẩm đang chạy.
- **Quan hệ:** không đặt hai tên cạnh tranh ngang hàng. Homepage/Me đi theo `Tiến là ai → Tiến đã xây gì`; tại Discord Bot, ChatDVT là nhân vật chính, Tiến xuất hiện như người xây dựng sản phẩm. Đây là thứ bậc theo trang, không phải đồng thương hiệu ngang hàng.
- **Cách ghi:** `Đặng Văn Tiến.` dùng như wordmark chữ ở header; `ChatDVT` viết liền khi nói về sản phẩm, `Chat DVT` chỉ giữ nguyên khi xuất hiện trong ảnh chụp Discord.

## 2. Tài sản nhận diện bắt buộc

### Chân dung Đặng Văn Tiến

- File: `assets/tien-profile.jpg` — 320×320.
- Nguồn gốc: `client/public/images/tien-dang-profile.jpg` trong codebase hiện tại.
- Vai trò: neo nhận diện con người ở hero/About; ưu tiên crop tròn hoặc khung chân dung nhỏ, không phóng quá lớn vì độ phân giải giới hạn.
- Không làm: không dùng AI sửa mặt, không thay ảnh stock, không filter màu quá mạnh.

### Avatar ChatDVT

- File: `assets/chatdvt-avatar.jpg` — 1024×1024.
- Nguồn gốc: `client/public/images/chibi/chatdvt.jpg` trong codebase hiện tại.
- Vai trò: nhận diện sản phẩm, xuất hiện ở ChatDVT/Discord/AI Chat và có thể làm “sidekick” nhỏ cạnh Tiến.
- Không làm: không vẽ lại mascot bằng SVG/CSS, không đổi màu lông/tai nghe, không bóp méo tỉ lệ.

### UI thật của ChatDVT trên Discord

- `assets/chatdvt-quiz-setup.png` — modal thiết lập quiz.
- `assets/chatdvt-quiz-running.png` — quiz đang chạy trong channel.
- `assets/chatdvt-api-key.png` — modal nhập Gemini API key.
- `assets/chatdvt-personality.png` — modal cấu hình nhân cách bot.
- `assets/chatdvt-intro.png` — phản hồi giới thiệu của bot trong hội thoại.
- Vai trò: bằng chứng sản phẩm thật, không phải ảnh trang trí. Ưu tiên ảnh `quiz-running` và `intro` cho hero/case-study; ba modal còn lại dùng làm detail strip hoặc gallery.
- Không làm: không dựng UI Discord giả thay cho ảnh thật; không che nội dung chính bằng hiệu ứng quá nặng.

## 3. Màu sắc suy ra từ tài sản

- `--ink: #17181d` — nền/ink lấy từ giao diện Discord tối.
- `--paper: #f4f0e8` — nền giấy ấm để cân bằng chất kỹ thuật.
- `--discord: #5865f2` — blurple lấy từ button/focus ring Discord trong ảnh thật.
- `--mascot: #dda24f` — vàng cam từ avatar ChatDVT.
- `--cyan: #52d8e8` — cyan từ bảng hologram trên avatar.
- `--signal: #ff5b3d` — chấm nhấn nhỏ, gần dấu chấm cam hiện có trong wordmark.
- Quy tắc: mỗi hướng chỉ dùng tối đa 2 màu có sắc + một thang trung tính. Không dùng tím-hồng-xanh gradient toàn màn hình.

## 4. Typography

- Nội dung song ngữ Việt/Anh, nên fallback chain luôn đặt Latin trước rồi mới tới `Noto Sans SC`/`Arial`/system.
- Không dùng Inter/Roboto/Arial làm display chính.
- Display có thể chọn `Archivo Expanded`, `Newsreader`, `Bricolage Grotesque` hoặc `Geist Mono` tùy hướng; body ưu tiên `Hanken Grotesk`, `Source Sans 3` hoặc `IBM Plex Sans`.
- Chữ Việt ở body tối thiểu 16px, line-height 1.65–1.8; heading dùng `text-wrap: balance`, body dùng `text-wrap: pretty`.

## 5. Chữ ký thị giác

- **Hai chủ thể, một câu chuyện:** chân dung Tiến và mascot ChatDVT xuất hiện có chủ đích trong cùng hệ thống nhưng khác vai trò.
- **Proof, not promises:** ảnh chụp sản phẩm thật được đặt như bằng chứng, luôn có caption nêu chức năng đang thể hiện.
- **Đường tín hiệu:** một đường mảnh hoặc nhịp index nối `Profile → Work → ChatDVT → Contact`, tượng trưng cho builder tạo ra sản phẩm.
- **Chi tiết 120%:** cách chuyển từ portrait sang product proof phải là khoảnh khắc đáng nhớ nhất; các phần còn lại giữ gọn và dễ quét.

## 6. Vùng cấm

- Không biến toàn website thành trang quảng cáo riêng của bot; riêng Discord Bot được phép tập trung vào ChatDVT theo lựa chọn của người dùng.
- Không dùng skill meter, số liệu tự bịa, testimonial giả hoặc logo công ty không được cung cấp.
- Không sao chép nguyên UI Discord làm ngôn ngữ toàn site.
- Không dùng mascot ở mọi section; nó là dấu hiệu của sản phẩm, không phải icon trang trí.
- Không thay chức năng bằng emoji hoặc card grid bento đồng dạng.
