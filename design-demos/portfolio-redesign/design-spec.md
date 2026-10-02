# Portfolio Redesign · Direction Brief

## Consultant restatement

Đây không phải bài toán “làm lại cho đẹp” theo nghĩa trang trí, mà là sắp xếp lại cách một recruiter hiểu Đặng Văn Tiến trong vài phút đầu. Thương hiệu trung tâm có thể dùng cả hai tên, nhưng phải có thứ bậc rõ: Đặng Văn Tiến là người recruiter cân nhắc tuyển; ChatDVT là sản phẩm tiêu biểu chứng minh Tiến có khả năng học, xây, ship và duy trì một hệ thống thật. Homepage cần biến website hiện tại từ một danh mục nhiều tool thành một câu chuyện nghề nghiệp có bằng chứng: Tiến làm mobile là năng lực chính, các project cho thấy phạm vi thử nghiệm, còn ChatDVT là case study giàu cá tính nhất. Sáu mục chính vẫn giữ nguyên vì chúng phản ánh hệ sinh thái hiện có, nhưng mỗi mục phải có vai trò trong hành trình tuyển dụng thay vì đứng ngang nhau như sáu menu rời rạc. Ảnh Discord được dùng như evidence của sản phẩm đang hoạt động, không phải chỉ để trang trí và cũng không phải mẫu UI bắt buộc phải sao chép. Dựa trên cách hiểu này, tôi trực tiếp làm 3 hướng hình ảnh thật khác nhau để so sánh trước khi chạm vào frontend production.

## 1. Product, audience, scenario

- **Sản phẩm:** website cá nhân/portfolio của Đặng Văn Tiến, kết nối hồ sơ nghề nghiệp, project lab, ChatDVT, bài viết và công cụ mobile.
- **Đối tượng chính:** recruiter/hiring manager đang tuyển Mobile Developer hoặc React Native/Android Developer; đối tượng phụ là developer muốn xem tool/project.
- **Tình huống sử dụng:** recruiter mở link từ CV/LinkedIn trên laptop, quét hero trong 10–20 giây, xem 2–3 sản phẩm, xác nhận năng lực/kinh nghiệm rồi tìm CTA liên hệ. Mobile vẫn phải dùng tốt nhưng không phải viewport trình diễn chính.
- **Mục tiêu ưu tiên:** (1) giới thiệu Tiến rõ và đáng nhớ; (2) showcase sản phẩm thật; (3) dẫn tới liên hệ; (4) cho phép khám phá sâu sáu mục mà không biến homepage thành catalog dài.
- **Không nằm trong vòng này:** thiết kế chi tiết các feature/tool/game/admin bên trong; luồng API; logic chat; code frontend production.

## 2. Information architecture

Homepage là trang tổng hợp được redesign cùng sáu mục chính:

1. **Mobile** — bằng chứng chuyên môn chính: React Native, Android/Kotlin, Mobile Developer Toolkit và React Native Guide.
2. **Projects & Lab** — chọn lọc project nổi bật trước, catalog/filter sau; tránh coi mọi thử nghiệm là ngang giá nhau.
3. **Discord Bot** — case study flagship của ChatDVT với ảnh giao diện thật: chat, quiz, cấu hình personality/API key.
4. **AI Chat** — trải nghiệm hỏi trực tiếp về Tiến và project; ở homepage chỉ giới thiệu giá trị, chưa redesign flow chat chi tiết.
5. **Blog** — lớp chiều sâu về cách suy nghĩ và quá trình xây sản phẩm; bài ChatDVT phần 1 là bài neo hiện có.
6. **About Me** — hồ sơ nghề nghiệp, South Telecom, 2023–nay, TP.HCM, năng lực và contact.

Header giữ sáu label chính và một wordmark `Đặng Văn Tiến.`. Homepage không cần menu “Home” riêng: click wordmark trở về đầu trang. CTA ưu tiên `Xem sản phẩm` và `Trao đổi công việc`; GitHub/LinkedIn/email là utility links.

## 3. Shared real content

- Tên: **Đặng Văn Tiến**.
- Role: **Mobile Developer · React Native · Android/Kotlin**.
- Context: đang làm tại **South Telecom**, kinh nghiệm **2023 — nay**, ở **TP. Hồ Chí Minh**.
- Positioning: “Mình xây sản phẩm mobile cho công việc, và dùng project cá nhân để học bằng cách ship.”
- Flagship: **ChatDVT**, một AI assistant trên Discord có hội thoại theo ngữ cảnh, phân tích ảnh/video, tóm tắt, identity/personality và mini game.
- Mobile toolkit: Android Device Toolbox, Deep Link Tester, WebView Simulator, QR Generator, React Native Guide.
- Selected projects có thật từ catalog: ChatDVT, Mobile Developer Toolkit, Survivor Arena 8D, English Learning Hub, Mermaid Editor, Chibi Sticker AI.
- Blog anchor: “Hành trình làm ra ChatDVT: Khi một Mobile Dev đi làm bot”.
- Contact: `dvtien0805@gmail.com`, GitHub `tienDang0805`, LinkedIn hiện có trong codebase.
- Tuyệt đối không thêm số người dùng, uptime, tăng trưởng, testimonial hoặc giải thưởng chưa được cung cấp.

## 4. Emotional tone and visual goals

Từ khóa chung: **chân thật, có năng lực, tò mò, ship được, có cá tính nhưng recruiter-friendly**. Trang phải cho cảm giác đây là một developer tự xây hệ sinh thái của mình, không phải template portfolio và cũng không phải landing page SaaS vô danh. Ưu tiên phân cấp mạnh, copy ngắn, evidence lớn, caption cụ thể. ChatDVT có thể vui và thân thiện nhưng không được làm hồ sơ của Tiến trông trẻ con. Không dùng skill bars, data slop, emoji headline, gradient tím “AI”, card bo tròn hàng loạt hoặc ba cột feature quen thuộc.

## 5. Output and dimensions

- Ba prototype độc lập bằng **HTML/CSS/JS thuần**, mỗi hướng là một file hoàn chỉnh, không chỉnh code production.
- Viewport so sánh chính: **1440×900**. Mỗi trang phải responsive và không vỡ ở **390×844**.
- Mỗi file phải mở trực tiếp qua local server; asset dùng đường dẫn tương đối trong `assets/`.
- Header và hero phải hiện rõ trong screenshot 1440×900; phần dưới có đầy đủ preview của cả sáu mục để chứng minh hệ thống có thể mở rộng.
- Motion chỉ dùng một page-load sequence và hover/focus nhẹ; hỗ trợ `prefers-reduced-motion`.
- Accessibility: body ≥16px, caption ≥12px, hit target ≥44px, focus visible, contrast body ≥4.5:1.

## 6. Image strategy

Hình ảnh là nội dung bắt buộc. Cả ba hướng dùng chung asset thật trong `assets/`:

- `tien-profile.jpg` cho identity/About.
- `chatdvt-avatar.jpg` cho brand/product mark.
- `chatdvt-quiz-running.png` và `chatdvt-intro.png` là hai hero proof ưu tiên (đủ rõ, kể được sản phẩm).
- `chatdvt-quiz-setup.png`, `chatdvt-api-key.png`, `chatdvt-personality.png` dùng làm detail gallery.

Không tạo ảnh mới, không dùng stock. Ảnh chân dung chỉ hiển thị ở kích thước vừa phải vì nguồn 320px. Ảnh Discord có thể crop bằng `object-position`, nhưng caption phải nói đúng chức năng đang thấy.

## 7. Three independent directions

### Direction 1 · Cinematic Signal

- Logic: giây `07` → `07 % 20 + 1 = 8`, Web Style #8 “Cinematic Sound-Viz Dark”, chuyển mẹo waveform thành **conversation signal** của Discord.
- Cấu trúc: hero full-bleed tối, wordmark/role cực lớn, dải tín hiệu ngang nối portrait với product screenshots; sau hero chuyển thành indexed case-study rail.
- Màu: ink đen, paper trắng ấm, blurple nhỏ, signal orange/cyan có nguồn từ asset.
- Font: Archivo Expanded/Bricolage cho display, Hanken/IBM Plex Sans cho body, JetBrains Mono cho label.
- Form đến từ nội dung: dòng hội thoại và các trạng thái bot tạo ra “tín hiệu” liên tục giữa builder và product.

### Direction 2 · Recruiter Ledger

- Logic: benchmark migration từ **Brittany Chiang** — identity cố định, evidence cuộn độc lập, recruiter quét nhanh experience/projects/contact; chỉ mượn nguyên lý thông tin, không sao chép giao diện.
- Cấu trúc: desktop split 38/62; trái là Tiến + CTA/contact/section index, phải là project ledger và visual proof. Mobile chuyển một cột với sticky compact header.
- Màu: paper ấm, ink, một accent blurple/cyan rất ít; đường rule mảnh, ít card.
- Font: Newsreader/Source Serif cho headline, Hanken/Source Sans cho body, mono cho thời gian/index.
- Form đến từ nội dung: recruiter đọc “hồ sơ bên trái, bằng chứng bên phải” giống một dossier nghề nghiệp có thể kiểm chứng.

### Direction 3 · Human × Sidekick

- Logic: custom studio direction theo tư duy **COLLINS** — tạo hệ nhận diện có thể co giãn, một ý tưởng khác biệt lặp lại nhất quán; ở đây là cặp `builder ↔ AI sidekick`.
- Cấu trúc: editorial poster mở đầu với hai vòng nhận diện giao nhau; navigation như issue index; các project xuất hiện thành các chapter lớn, không dùng card grid đều nhau.
- Màu: paper/ink với mascot orange và hologram cyan; blurple chỉ xuất hiện trong UI proof thật.
- Font: Bricolage Grotesque hoặc Archivo Expanded cho display, Source Sans 3 cho body.
- Form đến từ nội dung: chính mối quan hệ giữa Tiến và ChatDVT trở thành motif, vừa có con người vừa có sản phẩm.

## 8. Hard constraints for all directions

- Cả hai brand cùng xuất hiện nhưng `Đặng Văn Tiến` luôn là primary identity.
- Homepage nằm trong scope và phải dẫn tới đủ sáu mục.
- Không làm feature interaction thật; button/link có thể là anchor/demo state.
- Không dùng lorem ipsum, ảnh giả hoặc metric tự bịa.
- Ba layout phải khác cấu trúc, không dùng chung một bộ khung rồi đổi màu.
- Không tạo `direction-approved.md` trước khi người dùng nhìn ba screenshot và chọn hướng.

## 9. Approved refinement · 2026-10-01

Người dùng đã chọn hướng 3 và thay đổi thứ bậc theo trang: Homepage/Me lấy Tiến làm nhân vật chính; ChatDVT là nhân vật phụ. Discord Bot lấy ChatDVT làm nhân vật chính, Tiến là người xây dựng sản phẩm. Quyết định này thay thế ràng buộc “Đặng Văn Tiến luôn là primary identity” khi áp dụng riêng cho trang Discord Bot; tên chủ website trong header vẫn là Đặng Văn Tiến.

Bản `direction-3-refined.html` bỏ hệ khung poster vuông, làm mềm khối bằng đường cong chân dung, nút pill, khoảng trắng mở và panel ảnh bo góc. Dùng Be Vietnam Pro từ dependency frontend hiện có, có hỗ trợ tiếng Việt và giấy phép được lưu cạnh font. Đây là vòng prototype tiếp theo, chưa chuyển thành frontend React.

Ba màn chi tiết ở vòng này: Homepage, Me, Discord Bot. Mobile, Projects & Lab, AI Chat và Blog có preview ở Homepage nhưng chưa có trang độc lập hoàn chỉnh. Khi ba màn đại diện được duyệt, tiếp tục mở rộng cùng hệ thống sang bốn mục còn lại trước khi triển khai production.
