# HTML công khai và crawler

## Bản sửa này làm gì

Home, Me, Playground, Discord và Chat (VI/EN) dùng cùng component React để tạo HTML có nội dung thật. React hydrate HTML đó trong trình duyệt sau khi đã tải component mở đầu. Nếu chunk mở đầu lỗi, giữ nội dung HTML và hiện nút tải lại phần tương tác. Bước build tạo HTML tĩnh cho 10 URL này; Express cũng render chúng để hỗ trợ query của Playground và Discord Activity.

`/blog`, `/blog/:slug` và bản `/en/...` lấy dữ liệu đã published từ database khi có request. Bài chưa xuất bản/không tồn tại trả 404; database hoặc render hỏng trả 503, no-store. Bài mặc định vẫn được dùng khi database hoạt động nhưng chưa có bài tương ứng. Bản EN của blog giữ nguyên ngôn ngữ tác giả nên noindex, canonical về VI.

Tiêu đề, mô tả lấy từ `usePageMeta` của component đang hiển thị. JSON nhúng và JSON-LD được escape; toàn văn bài viết được lọc bằng cùng bộ lọc HTML trên server và client. Admin, game/tool vẫn chạy SPA. `/mobile` và `/en/mobile` chuyển 301 về Playground với category=mobile, không còn trong sitemap.

`npm run build` tạo `dist/seo/renderer.cjs` và `dist/seo/app-shell.html`. Workflow hiện tại đã upload `dist/`, nên không cần bước cài React trên máy chủ. Workflow chạy kiểm thử cache và SEO trước khi upload. Không dùng `vite preview` để phục vụ blog production vì blog cần Express và database.

## Cloudflare: ngoại lệ Browser Integrity Check

Request kiểm tra có User-Agent Python-urllib đã bị BIC chặn 403/1010. Đây không phải bằng chứng rằng request đó đến từ Gemini. Gemini có thể dùng dữ liệu tìm kiếm/lần đọc cũ; cần request mới hoặc log tương ứng để kết luận.

Vào domain **devtiendang.blog → Rules → Overview → Create rule → Configuration Rule**:

1. Tên: `Public pages and assets - BIC exception`.
2. Custom filter expression → Edit expression, dán:

```text
(http.host in {"devtiendang.blog" "www.devtiendang.blog"}
 and http.request.method in {"GET" "HEAD"}
 and (
   http.request.uri.path in {
     "/" "/en" "/me" "/en/me" "/playground" "/en/playground"
     "/discord" "/en/discord" "/chat" "/en/chat" "/blog" "/en/blog"
     "/ecosystem" "/en/ecosystem" "/mobile" "/en/mobile"
     "/profile" "/en/profile" "/chatDVT"
     "/robots.txt" "/sitemap.xml" "/sw.js" "/manifest.json"
     "/favicon.ico" "/td-mark.svg" "/td-mark-192.png" "/apple-touch-icon.png" "/site-og.png"
   }
   or starts_with(http.request.uri.path, "/blog/")
   or starts_with(http.request.uri.path, "/en/blog/")
   or starts_with(http.request.uri.path, "/assets/")
   or starts_with(http.request.uri.path, "/images/")
   or starts_with(http.request.uri.path, "/mascots/")
   or starts_with(http.request.uri.path, "/_pixel-office/assets/")
 ))
```

3. Then settings → Add setting → **Browser Integrity Check → Off**.
4. Đặt cuối các Configuration Rules để rule khác không bật BIC lại cho cùng request; Deploy.

Ngoại lệ chỉ áp dụng GET/HEAD ở các đường dẫn công khai trên. Các bảo vệ khác của Cloudflare vẫn áp dụng; `/admin`, `/api` và request POST không khớp rule này. Giữ hai Cache Rules hiện có.

Nguồn Cloudflare: [tạo Configuration Rule](https://developers.cloudflare.com/rules/configuration-rules/create-dashboard/), [Browser Integrity Check](https://developers.cloudflare.com/waf/tools/browser-integrity-check/).
Google cũng khuyến khích render HTML trên server hoặc prerender vì không phải bot nào cũng chạy JavaScript: [JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

## Deploy và kiểm tra

Commit/push bằng quy trình của dự án để chạy `.github/workflows/deploy.yml`. Đây là bước đưa thay đổi local lên website; bản sửa không tự thay đổi tài khoản Cloudflare.

Sau khi workflow thành công và PM2 restart:

```sh
curl -sS -D /tmp/home.headers https://devtiendang.blog/ -o /tmp/home.html
rg 'data-ssr="true"|site-main|<h1' /tmp/home.html
curl -sS -A 'Python-urllib/3.11' -D /tmp/bot.headers https://devtiendang.blog/ -o /tmp/bot.html
rg 'HTTP/|content-type|cache-control|cf-cache-status' /tmp/bot.headers
rg 'data-ssr="true"|site-main|<h1' /tmp/bot.html
```

HTML phải có `data-ssr="true"`, `site-main` và nội dung thực tế; HTTP 200, Cache-Control no-cache. Một UA giả lập chỉ kiểm tra khả năng truy cập của UA đó, không xác nhận Googlebot/Gemini thật. Kiểm tra thêm `/en/me`, `/blog`, một slug đã published, một slug không tồn tại. File JS hiện tại phải trả 200 với Content-Type JavaScript; file không tồn tại phải trả 404, không trả HTML.

Nếu Nginx đang phục vụ HTML trực tiếp, chuyển các trang công khai sang Express để blog không lấy HTML cũ còn trên đĩa. Cần kiểm tra config thực tế bằng `sudo nginx -T` trên máy chủ trước khi sửa. Ví dụ thêm vào đúng server block của domain (PORT=3000 chỉ là ví dụ, thay bằng port app đang chạy):

```nginx
location ~ ^/(en/?|((en/)?(me|playground|discord|chat|blog|mobile))(/.*)?)?$ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Sau thay đổi Nginx, `sudo nginx -t` phải thành công trước `sudo systemctl reload nginx`. Nếu Nginx đã proxy mọi trang về Express thì không cần thêm đoạn này. Rule JS của Nginx cần để file thiếu trả 404 (`try_files $uri =404`), và chỉ cache dài các file tên có hash. Chưa kiểm tra config Nginx thực tế trong phiên này.

Mở một cuộc hội thoại Gemini mới và thử lại sau deploy. Nếu vẫn báo chunk cũ mà không có request mới, chưa đủ bằng chứng web hiện tại hỏng. Dùng Search Console → Test live URL để kiểm tra HTML Google thực sự lấy được; kết quả live tốt rồi mới Request indexing. Google có thể cập nhật kết quả tìm kiếm sau đó, không có thời gian cố định.

## Kiểm thử local

- `npm run build`.
- `npm run test:cache`.
- `npm run test:seo` (cần cho phép mở HTTP localhost).
- Renderer độc lập chạy được khi copy ra ngoài dự án, không phụ thuộc `client/node_modules` trên production.
- Kiểm tra trình duyệt: hydration, chuyển VI/EN, mở trực tiếp Me và blog article, giao diện đã lưu, không có cảnh báo/lỗi React.
- Giả lập chunk ChatDVTChatPage trả 503: HTML và link vẫn đọc được, hiện nút tải lại; không thay toàn trang bằng màn hình lỗi.

Cấu hình `tsconfig.ssr.json` type-check các module của renderer. Chạy riêng `tsc -p client/tsconfig.app.json` hiện vẫn có lỗi có sẵn ở các tool/admin ngoài phạm vi bản sửa; lệnh build hiện tại của dự án không chạy toàn bộ kiểm tra đó.
