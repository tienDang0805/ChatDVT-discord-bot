# Nghiên cứu lại bố cục — 01/10/2026

## Vấn đề đã đối chiếu với code và render thật

Ảnh baseline toàn trang: `screenshots/baseline-home-full.jpg`. Đã đọc HomePage.tsx, PlaygroundPage.tsx và so Home với phiên bản HEAD trước redesign. Cả hai vẫn dẫn người xem qua các khối tương tự: giới thiệu → sản phẩm → công cụ/song song bài viết → ChatDVT. Bản mới thay cách trang trí, nhưng chưa tạo một mạch đọc mới.

- Home: ba sản phẩm được cân ngang bằng dù vai trò khác nhau; ChatDVT xuất hiện trong card rồi lặp lại trong một banner riêng, không thêm bằng chứng. Các đoạn chuyển chủ đề gần như chỉ là khoảng trống và heading.
- Me: chân dung/giới thiệu lặp lại Home; kỹ năng tách khỏi công việc nên recruiter phải tự ghép công nghệ với đóng góp.
- Playground: phần giới thiệu không giúp khám phá. Một spotlight và nhiều card cùng dạng khiến nội dung khác nhau bị ép cùng hình thức; visual của Mobile chỉ là tên công cụ xếp trong pill, không phải bằng chứng sử dụng.
- AI Chat: màn chào cộng các ô prompt vẫn là mẫu chat quen thuộc; nhân vật và ngữ cảnh giao tiếp chưa tạo ra cá tính riêng. Chỉnh greeting không phải chỉnh mô hình tương tác.

Đây là đánh giá bố cục, không phải lỗi build. Các kiểm tra kỹ thuật của vòng trước không chứng minh người dùng thích thiết kế.

## Tham chiếu chính thức, đã xem bằng trình duyệt

### Josh W Comeau

Nguồn: https://www.joshwcomeau.com/

Đã xem đầu trang và cuộn xuống feed. Header xanh nhạt, đường chuyển trắng hữu cơ và nhân vật tạo một bối cảnh riêng. Phía dưới là dòng bài dễ đọc, với nhóm khám phá phụ bên cạnh — không tiếp tục chất thêm card trang trí.

Học: cá tính tập trung vào một hệ hình ảnh/nhịp đọc có chủ đích; nội dung chính vẫn có ưu tiên rõ ràng. Chuyển sang Tiến bằng nhân vật thật + công việc thật, không sao chép nhân vật/đồ hoạ Josh và không bịa thêm bài viết để lấp layout.

### Bryn Taylor

Nguồn: https://www.bryntaylor.co.uk/

Đã xem phần đầu và cuộn đến Work/Pleo. Phần công việc dùng hình sản phẩm lớn, tiêu đề ngắn mô tả việc làm, và bộ lọc phục vụ khám phá. Không cần tag công nghệ dày đặc để người xem hiểu ý nghĩa dự án.

Học: để bằng chứng thật đứng cạnh lời giải thích. Không áp dụng mô hình website bán dịch vụ, logo khách hàng, testimonials hay quảng cáo template vào portfolio của Tiến. Đặc biệt không dựng ảnh app công ty giả.

### Bruno Simon — đối chiếu về tính nhất quán của ý tưởng

Nguồn nội dung chính thức: https://bruno-simon.com/

Trang có môi trường tương tác, hướng dẫn điều khiển và phần giải thích cách xây dựng bằng Three.js. Không lấy trò lái xe/3D làm mẫu cho portfolio recruiter: chi phí truy cập và tài sản hình ảnh không phù hợp mục tiêu. Rút ra một suy luận thiết kế: cá tính có thể xuất phát từ cách tác giả làm việc và được dùng nhất quán trong cách điều hướng, thay vì thêm đồ trang trí lên một template cũ. Chưa dùng screenshot của trang này làm bằng chứng hình thức.

## Huashu được dùng thế nào

Đã bổ sung một ảnh công cụ mobile thật: `../assets/deeplink-tool-live.jpg`, chụp từ Deep Link Tester đang chạy ở preview local, với ví dụ URL `myapp://…` có sẵn. Không dựng mockup app công ty. Đây là bằng chứng sản phẩm hiện tại, không phải giao diện feature mới; cả ba hướng đều có quyền dùng cùng ảnh.

Nguồn repo đã kiểm tra: https://github.com/alchaincyf/huashu-design ; đọc skill cài tại máy và các reference workflow, critique, content, typography, assets, verification, cùng phân khu 20 phong cách web.

Áp dụng quy trình, không coi Huashu là component library: chuẩn hoá brief và tài sản thật → ba logic độc lập → render các màn hình và phần dưới → đánh giá concept/nhịp đọc → người dùng chọn → mới chuyển React. Phong cách trong thư viện là điểm khởi đầu, không thay thế nội dung và quyền chọn của chủ web.

Ba hướng cùng dùng nội dung/ảnh/độ rộng, được thiết kế độc lập. Logic A: đồng hồ trả giây 56, 56 % 20 + 1 = 17, Functional Brutalism; ưu tiên dòng thông tin/link và bỏ hộp cứng theo yêu cầu người dùng. Logic B: benchmark Josh Comeau. Logic C: triết lý studio phù hợp do người thiết kế hướng đó chọn và xác minh nguồn chính thức. Ghi chú chi tiết và đánh đổi nằm trong a-notes.md, b-notes.md, c-notes.md.

## Tiêu chí chọn, không phải thang điểm tự khen

1. Tiến có là nhân vật chính trên Home/Me, và ChatDVT có đúng vai phụ không?
2. Khi cuộn, phần sau có tiếp nối ý của phần trước hay chỉ đổi heading?
3. Recruiter có tìm được đóng góp mobile và liên hệ nhanh không?
4. Home, Me, Playground và Chat có cấu trúc đúng chức năng, thay vì lặp cùng hero/card?
5. Có điểm nhận diện riêng ngay cả khi bỏ màu sắc không?

Chưa chọn hướng thắng thay người dùng. Các nguyên mẫu không gọi API thật, không thay đổi features/backend, không đăng hoặc deploy.
