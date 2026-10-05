# Phân tích cache Cloudflare và service worker

Ngày kiểm tra: 05/10/2026. Phạm vi: mã nguồn hiện tại và GET công khai tới https://devtiendang.blog. Các kết quả live bên dưới là trước bản sửa local. Chưa deploy hoặc thay đổi tài khoản Cloudflare bằng công cụ.

## Bản sửa local và bước áp dụng

- Server trả HTML và `/sw.js` với `no-cache, max-age=0, must-revalidate`; JS/CSS trong `/assets/` có hash Vite 4 được cache một năm. File public không hash cache một giờ; `/hbd/` giữ private.
- API mặc định `private, no-store`. File thiếu trả 404 plain text `no-store`, không đi qua HTML fallback. SEO fallback lỗi 404/503 cũng `no-store`.
- `/sw.js` mới dọn cache `devtiendang-*`, không can thiệp request hoặc lưu HTML/API nữa. Nó vẫn tồn tại và được đăng ký để trình duyệt cũ thay worker; website hiện không có fallback offline từ worker này.
- Nút Thử lại reload toàn trang để bỏ import lỗi đã được React.lazy ghi nhớ. Chưa thêm cơ chế reload tự động.
- Kiểm tra bằng `npm run test:cache`, backend TypeScript, frontend build và prerender.
- Deploy bằng quy trình hiện có, restart app, sau đó purge Cloudflare một lần. Cần kiểm tra Nginx thực tế nếu proxy phục vụ static trực tiếp hoặc ghi đè Cache-Control: header Express chỉ áp dụng khi request tới Express.
- Workflow SCP hiện copy chồng vào thư mục cũ và không có bước xóa assets cũ. Giữ hành vi này để tab đang mở còn lấy được chunk của bản trước; upload này chưa phải triển khai nguyên tử. Khi cải tiến deploy, upload assets trước, chuyển HTML sau và giữ assets cũ trong ít nhất một khoảng chuyển tiếp đủ dài.
- Cấu hình Cloudflare cần tôn trọng origin và bypass HTML/API/worker theo hai Cache Rules bên dưới. Purge không sửa được việc WAF/BIC chặn request; kiểm tra Security Events nếu còn 403/1010.

## 1. Kết quả kiểm tra trực tiếp

| URL | HTTP / Content-Type | Cache-Control trả tới client | CF-Cache-Status |
| --- | --- | --- | --- |
| `/` | 200 / HTML | `public, max-age=0` | DYNAMIC |
| `/me` | 200 / HTML | `public, max-age=0` | DYNAMIC |
| `/sw.js` | 200 / JavaScript | `public, max-age=14400` | REVALIDATED, cả hai lần |
| `/assets/index-123a4770.js` | 200 / JavaScript | `public, max-age=14400` | MISS |
| `/assets/MePage-054eae67.js` | 200 / JavaScript | `public, max-age=14400` | MISS |
| `/assets/__cache-audit-missing-20261005.js` — URL kiểm thử không tồn tại | 404 / HTML | `max-age=14400` | MISS → HIT; lần sau có `Age: 35` |

`14400` là 4 giờ của HTTP cache phía browser theo header quan sát được. Không thể từ đó kết luận Edge TTL cũng là 4 giờ. `REVALIDATED` cho thấy Cloudflare đã có object và xác minh lại với origin.

Chưa có Cache Rules/Page Rules hiện tại hoặc nguyên văn lỗi của người dùng, nên chưa xác định rule nào đặt header 4 giờ, cũng chưa kết luận chính xác nguyên nhân của lần lỗi MePage. Trang chủ và `/me` không bị edge cache trong lượt kiểm tra này. File MePage hiện tại tải thành công.

## 2. Những vấn đề trong mã nguồn

- `client/index.html:46–49` đăng ký `/sw.js` trên mọi trang, không có `.catch()` xử lý lỗi đăng ký và không giới hạn production. Script nằm ở root nên scope mặc định là `/`.
- `client/public/sw.js:25–35` dùng network-first: gọi mạng trước, chỉ fallback Cache Storage khi fetch reject. Nó ghi mọi GET vào cache, không lọc API, origin, dữ liệu theo tài khoản hay HTTP status.
- HTTP 404/500 không làm `fetch()` reject. SW vẫn có thể ghi response lỗi vào cache; nhánh fallback không cứu được lỗi 404.
- Khi mạng lỗi và chưa có entry, `caches.match()` trả `undefined`, không phải một Response hợp lệ cho `respondWith()`.
- Ghi cache ở dòng 32 không được await hoặc gắn với `event.waitUntil()`, và không bắt lỗi ghi cache. Có thể xuất hiện lỗi promise riêng hoặc tác vụ ghi chưa hoàn tất.
- Cache tên `devtiendang-v5` cố định. Build frontend mới không tự tạo một phiên bản cache tương ứng. Việc cập nhật SW dựa trên nội dung script, không dựa riêng vào tên cache.
- Activate xóa mọi cache cùng origin có tên khác hiện tại; nên chỉ xóa cache thuộc prefix của ứng dụng.
- `client/src/App.tsx:20` lazy-load MePage. Một tab mở trước deploy có thể tiếp tục tham chiếu chunk MePage của build trước.
- `src/api/server.ts:546–558` phục vụ HTML prerender, static rồi SEO fallback. Các nhánh chưa có chính sách cache phân loại rõ ràng. URL asset thiếu lọt vào SEO fallback; live test nhận 404 HTML. Nên kết thúc riêng request asset thiếu bằng 404 `no-store` trước fallback HTML.
- `src/api/seo.ts:905–907` đọc HTML template một lần vào bộ nhớ khi server khởi tạo. Nếu chỉ thay `client/dist` mà không restart server, nhánh fallback có thể giữ HTML tham chiếu build cũ.
- `client/src/shared/components/ErrorBoundary.tsx` nút Thử lại chỉ reset state; lỗi import đã bị React.lazy ghi nhớ thường cần reload trang để lấy entry mới.

Cache Storage do SW điều khiển là một lớp riêng với HTTP cache của browser và CDN Cloudflare. Cache API không tự tuân theo `Cache-Control`. Vì thế thêm `no-store` ở API vẫn phải đi kèm việc loại API khỏi SW. Không có bằng chứng dữ liệu đã bị lộ, nhưng có nguy cơ giữ dữ liệu cũ theo tài khoản trong cùng browser nếu fallback sử dụng entry cùng URL.

## 3. Chính sách cache đề xuất

| Nhóm | Cloudflare | Header origin đề xuất | Service worker |
| --- | --- | --- | --- |
| `/assets/*` có hash nội dung, response thành công | Cache dài, theo origin | `public, max-age=31536000, immutable` | Tạm thời không cache; HTTP/CDN đã đủ |
| HTML entry và prerender: `/`, `/me`, `/en/me`, trang blog, các learning guide, `/ping/index.html`, `/_pixel-office/index.html` | Bypass trong giai đoạn ổn định | `no-cache` cho trang public | Không lưu HTML app hiện tại |
| `/sw.js` | Bypass | `no-cache, max-age=0, must-revalidate` | Không đưa vào runtime cache |
| `/manifest.json`, `/ping/manifest.json` | Bypass ban đầu | `no-cache` | Không cần |
| `/api/*`, đăng nhập, quản trị, chat, AI, dữ liệu cá nhân | Bypass | `private, no-store` | Không chặn/cache request này |
| `/socket.io/*`, polling realtime, SSE | Bypass | `no-store` nếu áp dụng cho response HTTP | Không chặn/cache |
| `/images/*`, icon và media public có URL cố định | Cache ngắn | `public, max-age=3600` để khởi đầu | Không cần |
| Tài nguyên public không hash trong `/_pixel-office/` | Cache ngắn theo từng loại file | `public, max-age=3600`; HTML vẫn `no-cache` | Không cần |
| `/sitemap.xml`, `/robots.txt` | Có thể cache 1 giờ sau khi ổn định | `public, max-age=3600` | Không cần |
| 4xx/5xx, file thiếu, response HTML tại URL JS | Không lưu lỗi | `no-store` | Không lưu |
| Ảnh/attachment riêng tư, bao gồm `/hbd/*` nếu chứa ảnh riêng | Bypass | `private, no-store` | Không lưu |

`no-cache` cho phép lưu nhưng phải xác minh lại trước khi dùng; `no-store` không cho HTTP cache lưu. `immutable` chỉ dành cho URL đổi khi nội dung đổi. Đừng gắn immutable cho toàn bộ file `.js`: `/sw.js` cũng là JavaScript nhưng cần cập nhật nhanh.

Chỉ gắn header cache dài khi file thật tồn tại và response thành công. Tránh gắn header dài trên toàn bộ prefix trước khi biết file có tồn tại.

## 4. Cấu hình Cloudflare ban đầu có thể áp dụng

Sau khi origin đã có headers và xử lý lỗi đúng, dùng hai rule không chồng nhau để ổn định trước. Xóa hoặc vô hiệu hóa các rule cũ ép Cache Everything / Ignore origin trên các đường dẫn này. Nếu có rule khác trùng điều kiện, phải kiểm tra thứ tự: Cache Rules áp dụng giá trị của rule khớp cuối cùng khi cùng thay đổi một setting.

### Rule A — Cache static public

Expression:

```text
(http.host eq "devtiendang.blog" and
 http.request.method in {"GET" "HEAD"} and
 (
   starts_with(http.request.uri.path, "/assets/") or
   starts_with(http.request.uri.path, "/images/") or
   http.request.uri.path in {
     "/favicon.ico" "/apple-touch-icon.png" "/td-mark.svg"
     "/td-mark-192.png" "/td-mark-512.png" "/site-og.png"
   }
 ))
```

- Cache eligibility: **Eligible for cache**.
- Edge TTL: **Use cache-control header if present, bypass cache if not**.
- Browser TTL: **Respect origin**.
- Không ép TTL chung bỏ qua origin.
- Nếu cấu hình Status Code TTL cho dải `400–599`, chọn **no-store** (API: `value: -1`), không chọn TTL dương. Khả năng hiển thị tùy gói/UI. Nếu không có tùy chọn, origin vẫn phải trả `no-store` và Edge TTL phải tôn trọng origin.
- Chỉ triển khai TTL một năm sau khi bảo đảm `/assets/` chứa file được đặt hash bởi build. Không ghi đè nội dung dưới URL hash cũ.

### Rule B — Bypass phần còn lại

Expression:

```text
(http.host eq "devtiendang.blog" and not
 (
   http.request.method in {"GET" "HEAD"} and
   (
     starts_with(http.request.uri.path, "/assets/") or
     starts_with(http.request.uri.path, "/images/") or
     http.request.uri.path in {
       "/favicon.ico" "/apple-touch-icon.png" "/td-mark.svg"
       "/td-mark-192.png" "/td-mark-512.png" "/site-og.png"
     }
   )
 ))
```

- Cache eligibility: **Bypass cache**.
- Browser TTL: **Respect origin**. CDN bypass không xóa cache browser hay Cache Storage.
- Đặt Browser Cache TTL chung thành **Respect Existing Headers**; không ép toàn site 4 giờ.
- `/_pixel-office/`, sitemap, robots và media khác được bypass ban đầu; sau khi ổn định, mở cache từng nhóm public bằng rule riêng. Đừng bật cache cả thư mục nếu bên trong có HTML hoặc file riêng tư.

## 5. Hướng xử lý service worker

Khuyến nghị giai đoạn đầu: rút tính năng offline hiện tại, để HTTP cache và Cloudflare chịu trách nhiệm cache tài nguyên. Đổi SW đang phục vụ tại đúng `/sw.js` thành bản migration không có fetch handler, kích hoạt bản mới, chỉ dọn cache prefix `devtiendang-` rồi unregister chính registration đó. Đồng thời bỏ đăng ký SW cũ trong HTML mới và bổ sung cleanup có giới hạn cho browser đã cài SW.

Không chỉ xóa `sw.js`: registration cũ có thể vẫn tồn tại và browser sẽ tiếp tục kiểm tra script. Phục vụ bản migration đủ lâu cho người quay lại; tab đang bị SW cũ điều khiển có thể cần reload sau migration. Đây là đề xuất triển khai, chưa thực hiện.

Nếu muốn giữ offline/PWA, cần SW có thiết kế riêng: offline page độc lập; không fallback HTML app cũ chứa chunk cũ; chỉ cache tài nguyên public trong allowlist, response hợp lệ; gắn mọi tác vụ ghi cache vào vòng đời event; giới hạn cache; không lưu API/auth/realtime. Có thể đăng ký với `updateViaCache: 'none'` và `.catch()`, nhưng tùy chọn này chỉ bỏ HTTP cache phía browser cho script SW/imports, không bỏ cache Cloudflare.

## 6. Deploy để tránh lỗi MePage sau cập nhật

1. Build vào thư mục release mới, không build/xóa trực tiếp thư mục đang phục vụ.
2. Đảm bảo asset mới tồn tại trước khi HTML mới được dùng. Giữ asset của các release cũ trong kho static mà URL `/assets/*` vẫn truy cập được, ban đầu 7–30 ngày hoặc theo thời gian tab cũ thực tế còn hoạt động. Chỉ giữ thư mục release ở nơi không được serve là chưa đủ.
3. Chuyển release đồng bộ, restart Node để HTML template trong bộ nhớ được cập nhật. Nếu nhiều instance, tránh instance HTML và asset lệch phiên bản.
4. Bổ sung listener `vite:preloadError` sớm trước render, reload tối đa một lần cho mỗi build trong một phiên; khi vẫn lỗi thì hiển thị hướng dẫn tải lại. Không reload vô hạn hoặc reload liên tục khi offline.
5. Với lỗi chunk, nút Thử lại nên tải lại document; reset ErrorBoundary đơn thuần không bảo đảm thử import lại.
6. Sau sửa headers/rules, purge object cũ liên quan HTML, `/sw.js`, URL lỗi; có thể purge toàn zone một lần nếu chưa biết phạm vi. Đây là thao tác triển khai được đề xuất, chưa thực hiện.
7. Browser HTTP cache và SW Cache Storage cần migration riêng. Purge Cloudflare không xóa hai lớp đó. Browser đã cache lỗi với TTL cũ vẫn có thể cần clear cache hoặc tải lại phù hợp trong giai đoạn chuyển tiếp.

## 7. Kiểm chứng sau sửa

- `/sw.js`: 200 JavaScript, `no-cache`, Cloudflare DYNAMIC/BYPASS; không còn TTL 4 giờ.
- HTML: mới sau deploy và không có edge HIT trong chính sách ban đầu.
- Asset hash: 200 đúng MIME, immutable; lần gọi tiếp theo có thể HIT khi đủ điều kiện và cùng edge.
- Asset không tồn tại: 404 `no-store`; gọi lại không có HIT cho lỗi. Không trả trang SPA thay nội dung JS.
- API và realtime không có cache entry trong SW, không edge HIT.
- Mở tab trước deploy, deploy mới, sau đó chuyển `/me`: chunk cũ vẫn truy cập được; nếu không thì cơ chế reload có giới hạn hoạt động.
- Test offline, online lại và đổi tài khoản trong cùng browser; dữ liệu riêng tư không được lấy từ cache URL cũ.
- Ghi lại nguyên văn console error, URL chunk, HTTP status, Content-Type, Cache-Control và CF-Cache-Status khi lỗi tái diễn để phân biệt chunk thiếu, MIME sai, WAF/challenge hoặc lỗi runtime.

## Bổ sung: lỗi HomePage khi Gemini đọc web

Người dùng cung cấp lỗi `Failed to fetch dynamically imported module: https://devtiendang.blog/assets/HomePage-048a7b4d.js`.

Kiểm tra tiếp trong ngày 05/10/2026:

- URL trên trả 200 JavaScript khi gọi bằng curl mặc định. Entry hiện tại `/assets/index-123a4770.js` vẫn import đúng `HomePage-048a7b4d.js`. Do đó không có bằng chứng file này là chunk cũ bị xóa trong lượt kiểm tra hiện tại.
- Kiểm tra 31 tài nguyên trong danh sách preload của HomePage bằng curl: tất cả trả 200, JS/CSS đúng MIME.
- Dùng Python urllib mặc định: cả 31 request nhận 403. Kiểm tra riêng HomePage trả `Server: cloudflare`, body `error code: 1010`, Ray ID `a45917c8cece8582-HKG`.
- Gọi cùng URL bằng curl với User-Agent `Python-urllib/3.11` cũng trả 403/1010, Ray ID `a45917cb1c1dddc1-HKG`. Đây là bằng chứng cơ chế chặn phụ thuộc đặc điểm client; chưa có log request Gemini để kết luận Gemini bị chặn bởi chính rule đó.
- Theo Cloudflare, mã 1010 liên quan Browser Integrity Check. Ưu tiên kiểm tra Security Events theo path `/assets/HomePage-048a7b4d.js`, thời điểm Gemini truy cập, action và nguồn rule. BIC kiểm tra header/User-Agent và có thể từ chối client tự động.

### Cách xử lý ưu tiên với trường hợp này

1. Đối chiếu Security Events trước. Nếu đúng BIC, tạo custom rule Skip **chỉ Browser Integrity Check** cho GET/HEAD tới static public `/assets/*` và các trang public muốn cho crawler đọc. Giới hạn hostname `devtiendang.blog`. Không gộp API/admin/dữ liệu riêng vào ngoại lệ này, không chọn Skip toàn bộ WAF. Với public content, chọn rõ `/`, `/me`, `/en/me`, `/blog`, `/en/blog`, `/blog/*`, `/en/blog/*` theo nhu cầu thực tế.
2. Kiểm tra lại bằng client đã bị chặn và bằng Gemini. Nếu vẫn bị chặn, đọc rule nguồn tiếp theo trong Security Events; không suy ra mọi 403 đều do cache hoặc BIC.
3. Tiếp tục sửa cache 404 và SW theo báo cáo vì các vấn đề này đã được xác minh độc lập, nhưng purge cache không loại bỏ một quyết định block của lớp bảo mật.
4. Làm prerender/SSR nội dung thực cho public pages, nhất là blog. Script tên `prerender-seo.ts` hiện chỉ chèn meta/JSON-LD/noscript; HTML live vẫn có `<div id="root"></div>` rỗng và đoạn noscript mô tả ngắn. Nó chưa render toàn bộ nội dung homepage/danh sách bài/nội dung bài thành HTML. Các tool/game/admin có thể tiếp tục dùng SPA.
5. HTML public nên chứa tiêu đề, đoạn văn, link bài viết và nội dung bài thực trước khi JS chạy; React hydrate để bổ sung tương tác. Không chỉ tăng đoạn noscript hoặc thêm nút retry rồi xem đó là giải pháp crawling. Server-side rendering/pre-rendering giúp crawler không chạy JS đọc nội dung, nhưng không khắc phục request bị Cloudflare chặn trước khi tới HTML.

Nguồn cho phần bổ sung:

- [Cloudflare Error 1010](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1010/).
- [Browser Integrity Check và custom rule Skip chọn lọc](https://developers.cloudflare.com/waf/tools/browser-integrity-check/).
- [Google Search Central: JavaScript SEO, server rendering và prerender](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

## Nguồn cho phân tích cache ban đầu

- [Vite: lỗi dynamic import khi deploy xóa chunk cũ, no-cache cho HTML](https://vite.dev/guide/build#load-error-handling).
- [Cloudflare: Cache Rules settings và chế độ tôn trọng origin](https://developers.cloudflare.com/cache/how-to/cache-rules/settings/).
- [Cloudflare: thứ tự và ưu tiên Cache Rules](https://developers.cloudflare.com/cache/how-to/cache-rules/order/).
- [Cloudflare: Edge TTL, Browser TTL, purge không xóa cache browser](https://developers.cloudflare.com/cache/how-to/edge-browser-cache-ttl/).
- [MDN: service worker và proxy trong browser](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).
- [MDN: Cache API không tuân theo HTTP cache headers](https://developer.mozilla.org/en-US/docs/Web/API/Cache).
- [MDN: Cache.put có thể lưu response lỗi](https://developer.mozilla.org/en-US/docs/Web/API/Cache/put).
- [MDN: scope và updateViaCache](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register).
