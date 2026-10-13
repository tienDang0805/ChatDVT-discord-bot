# CI/CD Visualizer — V1 beta

Trang `/cicd-visualizer` và `/en/cicd-visualizer`, mở từ thẻ riêng trong Playground. Giao diện dùng SiteLayout, PageShell, Be Vietnam Pro và tokens sáng/tối của website. Thẻ CI/CD là tính năng duy nhất được đưa trở lại Playground; các tính năng cũ vẫn ẩn.

## Cách dùng

1. Import/thả `.yml` hoặc `.yaml`, paste vào editor, hoặc chọn một trong ba workflow mẫu.
2. Bấm **Visualize**. Có thể bật **Tự cập nhật** khi sửa nguồn.
3. Khám phá sơ đồ tổng quan/chi tiết, thu gọn jobs, zoom hoặc đọc dạng danh sách.
4. Chọn node bằng click hoặc focus + Enter/Space. Inspector có cấu hình, nguồn YAML, env/defaults kế thừa và matrix preview; **Xem YAML** về đúng vùng nguồn.
5. PNG xuất toàn bộ projection đang mở, kể cả node ngoài viewport. Mở chế độ sơ đồ để xuất PNG; JSON cũng dùng được ở chế độ danh sách. Luôn có preview trước khi tải xuống.

Nguồn nằm trong bộ nhớ của tab. Không tự lưu localStorage, upload YAML, fetch nội dung action/reusable workflow hay chạy lệnh từ input. Reload trang xóa workspace. JSON summary loại raw YAML, script, env và input values; nhãn do người dùng đặt vẫn có thể chứa nội dung riêng. PNG chứa nhãn và preview lệnh đang hiển thị.

## Phạm vi

- Adapter GitHub Actions dùng chung, không hardcode project Alibaba.
- Trigger → job; quan hệ `needs`; step theo thứ tự khai báo, không suy ra dependency từ thứ tự jobs.
- Matrix literal có include/exclude; matrix expression giữ symbolic và không báo số tổ hợp giả.
- Reusable workflow là job tham chiếu, không sinh steps nội bộ giả.
- YAML 1.2; giữ BOM/CRLF/Unicode và offsets UTF-16 theo document/revision. Alias có nguồn liên quan; merge `<<` chỉ được giữ và cảnh báo, chưa áp dụng merge semantics.
- YAML lỗi có diagnostic; graph trước được gắn nhãn khi hiển thị lại. Semantic-invalid model có thể được xem để sửa, nhưng không được export như cấu hình ready.
- Script trong action có thể được nhóm để đọc. Các nhóm này là annotation từ dòng khai báo, không phải jobs/steps thực thi mới. Không có trạng thái success/failure hay cam kết deploy thành công.
- Validator kiểm tra cấu trúc cốt lõi; không thay thế schema GitHub đầy đủ hoặc actionlint. Expressions không được đánh giá; action inputs không được kiểm tra theo metadata bên ngoài. GitLab/Azure, cross-file expansion, visual editing và run overlays để roadmap.

## Cấu trúc

| Thư mục | Vai trò |
| --- | --- |
| `core/` | Types, parser/validation/source refs, matrix, graph projection, lời giải thích và diagnostics VI/EN |
| `workers/` | Protocol, analysis worker và layout orchestrator |
| `layout/` | ELK layout độc lập React Flow; dùng native ELK worker trong browser |
| `hooks/` | Worker lifecycle, cancel/timeout/request IDs và document revisions |
| `components/` | CodeMirror YAML, React Flow cards, inspector và annotation lane |
| `pages/` | Workspace nhiều file, import/drop, chọn source/view/export |
| `utils/` | Export JSON allowlist và PNG với viewport toàn graph + SVG strokes |
| `data/` | Ba mẫu; Alibaba chỉ là fixture |
| `tests/` | Unit tests, frozen fixture, browser smoke/stress scripts |

Budget: 1 MiB/file, import workspace 10 file/5 MiB; AST/expanded tree 30.000 nodes, depth 80, 200 jobs, 3.000 steps. Matrix tính tối đa 4.096 tổ hợp và preview 50; graph tối đa 500 node. Worker timeout 5 giây. Full model vẫn đọc được qua outline khi graph bị giới hạn.

## Kiểm tra

Tại `client/`:

```sh
npm run typecheck:cicd
npm run test:cicd
npm run build
```

Typecheck feature và tests dùng cấu hình riêng. Tests Node không được đưa vào tsconfig browser. Toàn app có lỗi TypeScript tồn tại trước feature; xem báo cáo [tiến độ](../../../../../plans/cicd-visualizer/PROGRESS.md).

Browser scripts dùng Playwright cài sẵn trong môi trường QA, không thêm browser runtime vào dependency production:

```sh
CICD_BASE_URL=http://127.0.0.1:4175 \
CICD_PLAYWRIGHT_MODULE=/absolute/path/to/playwright \
CICD_CHROME_EXECUTABLE=/absolute/path/to/chrome \
CICD_ARTIFACT_DIR=/tmp/cicd-visualizer-qa \
node src/features/public/cicd-visualizer/tests/browser-smoke.cjs
```

Chạy tương tự với `browser-stress.cjs`. Có thể bỏ `CICD_PLAYWRIGHT_MODULE` và `CICD_CHROME_EXECUTABLE` khi môi trường đã có package/browsers Playwright. Smoke kiểm tra card, paste/import, node/source, stale state, exports (có kiểm tra pixel PNG), auto update, các view, theme/mobile và EN route. Stress kiểm tra drag/drop, cùng tên file, labels không thực thi HTML, node budget/outline, đổi nguồn khi xử lý và import quá kích thước.

Kế hoạch và quyết định tiếp theo: [plans/cicd-visualizer](../../../../../plans/cicd-visualizer/README.md).
