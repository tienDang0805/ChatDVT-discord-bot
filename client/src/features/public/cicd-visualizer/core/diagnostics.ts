import type { Diagnostic } from './types';
const messages: Record<string, [string, string]> = {
  INPUT_EMPTY: ['Dán nội dung hoặc chọn file YAML để bắt đầu.', 'Paste a workflow or choose a YAML file to get started.'],
  INPUT_LIMIT: ['File vượt giới hạn 1 MiB.', 'The file exceeds the 1 MiB limit.'],
  YAML_SYNTAX: ['Cú pháp YAML chưa hợp lệ.', 'Invalid YAML syntax.'],
  YAML_DUPLICATE_KEY: ['YAML có key bị trùng; hãy giữ một định nghĩa.', 'Duplicate YAML key; keep one definition.'],
  YAML_MULTI_DOCUMENT: ['Mỗi file workflow chỉ được chứa một YAML document.', 'A workflow file must contain one YAML document.'],
  PROVIDER_UNSUPPORTED: ['Hiện hỗ trợ GitHub Actions. YAML này chưa được nhận diện là workflow GitHub.', 'GitHub Actions is supported. This YAML was not identified as a GitHub workflow.'],
  WORKFLOW_INVALID: ['Workflow cần on và jobs có cấu trúc hợp lệ.', 'The workflow needs valid on and jobs definitions.'],
  JOB_INVALID: ['Kiểm tra ID, runner và steps; job gọi workflow khác không có steps riêng.', 'Check the job ID, runner and steps; a reusable workflow job does not define its own steps.'],
  JOB_NEEDS_INVALID: ['needs phải là tên job hoặc danh sách tên job.', 'needs must be a job ID or a list of job IDs.'],
  JOB_NEEDS_MISSING: ['needs tham chiếu job không tồn tại.', 'needs references a missing job.'],
  JOB_DEPENDENCY_CYCLE: ['Chuỗi needs có vòng lặp hoặc phụ thuộc vòng lặp.', 'The needs chain contains or depends on a cycle.'],
  STEP_DEFINITION_INVALID: ['Mỗi step cần một run hoặc uses hợp lệ; kiểm tra cấu trúc và ID.', 'A step needs exactly one valid run or uses; check its structure and ID.'],
  STEP_ID_DUPLICATE: ['ID step bị trùng trong cùng job.', 'Duplicate step ID within the job.'],
  MATRIX_DYNAMIC: ['Matrix được xác định khi chạy; chưa thể biết số biến thể từ file này.', 'This matrix is resolved at runtime; its size is unknown from this file.'],
  MATRIX_LIMIT: ['Matrix quá lớn để tính preview; vẫn giữ cấu hình gốc.', 'The matrix exceeds the preview computation budget; the configuration is preserved.'],
  MATRIX_INVALID: ['Kiểm tra các trục matrix và include/exclude.', 'Check matrix dimensions and include/exclude.'],
  REFERENCE_UNRESOLVED: ['Workflow được gọi chưa được mở rộng; xem cấu hình tham chiếu.', 'The called workflow has not been expanded; inspect the reference configuration.'],
  FEATURE_UNSUPPORTED: ['Trường này chưa được phân tích; vẫn có trong cấu hình gốc.', 'This field is not interpreted; it is preserved in the raw configuration.'],
  ANALYSIS_LIMIT: ['Nội dung vượt ngân sách phân tích của công cụ.', 'The document exceeds the tool’s analysis budget.'],
  WORKER_UNAVAILABLE: ['Trình duyệt chưa mở được worker. Thử tải lại trang.', 'The browser could not start a worker. Try reloading.'],
  WORKER_TIMEOUT: ['Phân tích quá thời gian; thử một workflow nhỏ hơn.', 'The operation timed out; try a smaller workflow.'],
  WORKER_FAILED: ['Worker gặp lỗi. Thử Visualize lại.', 'The worker failed. Try visualizing again.'],
  ANALYSIS_FAILED: ['Không phân tích được nội dung. Kiểm tra YAML và thử lại.', 'Analysis failed. Check the YAML and retry.'],
  LAYOUT_FAILED: ['Không bố trí được sơ đồ. Thử chế độ tổng quan.', 'Layout failed. Try overview mode.'],
  EXPORT_FAILED: ['Chưa xuất được ảnh. Thử thu gọn sơ đồ hoặc xuất JSON.', 'Image export failed. Collapse the graph or export JSON.'],
};
export function diagnosticText(diagnostic: Pick<Diagnostic, 'code' | 'params'>, en: boolean): string {
  const main = messages[diagnostic.code]?.[en ? 1 : 0] ?? diagnostic.code;
  const detail = diagnostic.params?.field ?? diagnostic.params?.job ?? diagnostic.params?.target;
  return detail ? main + ' (' + detail + ')' : main;
}
