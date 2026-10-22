export const profile = {
  name: 'Đặng Văn Tiến',
  role: 'Mobile Developer',
  company: 'South Telecom',
  period: '04/2023',
  email: 'dvtien0805@gmail.com',
  github: 'https://github.com/tienDang0805',
  linkedin: 'https://www.linkedin.com/in/%C4%91%E1%BA%B7ng-v%C4%83n-ti%E1%BA%BFn-41623529b/',
};
export const contributions = [
  {
    title: ['Multi-barcode & Multi-box SDK', 'Multi-barcode & Multi-box SDK'], category: 'Android · On-device AI',
    description: [
      'Từng phát triển một SDK Android bằng Kotlin từ bản thử nghiệm ban đầu, sử dụng CameraX, model TensorFlow Lite và ML Kit để nhận diện nhiều hộp sản phẩm cùng nhiều barcode trong một ảnh. Sau đó đóng gói thành thư viện để team khác tích hợp qua Maven.',
      'Developed an Android SDK in Kotlin from an initial prototype, using CameraX, a TensorFlow Lite model and ML Kit to recognize multiple product boxes and multiple barcodes in one image. Packaged it as a library for other teams to integrate through Maven.',
    ], tags: ['Kotlin', 'TensorFlow Lite', 'ML Kit', 'CameraX', 'Maven'],
  },
  {
    title: ['React Native & Mobile Systems', 'React Native & Mobile Systems'], category: 'Mobile · Systems',
    description: [
      'Phát triển và bảo trì ứng dụng CRM B2B, làm analytics SDK hỗ trợ lưu dữ liệu offline, và nâng cấp ứng dụng React Native cũ lên phiên bản mới. Công việc còn liên quan đến API, database và hệ thống quản lý bản cập nhật ứng dụng.',
      'Developed and maintained B2B CRM applications, built an analytics SDK with offline storage, and upgraded legacy React Native applications. The work also involved APIs, databases and systems for managing application updates.',
    ], tags: ['React Native', 'API', 'Database'],
  },
  {
    title: ['Robot App & SDK Integration', 'Robot App & SDK Integration'], category: 'Android · Robot',
    description: [
      'Phát triển giao diện ứng dụng robot bằng React Native, làm bridge kết nối UI với Android/Java để gọi SDK của nhà sản xuất robot. Công việc gồm đọc tài liệu và debug SDK, xử lý các vấn đề tích hợp, triển khai cho khách hàng, hướng dẫn sử dụng và hỗ trợ vận hành.',
      'Developed the robot application UI in React Native and an Android/Java bridge to call the robot manufacturer’s SDK. The work included reading and debugging the SDK, resolving integration issues, deploying for customers, user training and operational support.',
    ], tags: ['React Native UI', 'Android / Java', 'Native Bridge', 'Vendor SDK'],
  },
];
export const skillFamilies = [
  { title: 'Mobile', items: 'Kotlin, Java, React Native, TypeScript' },
  { title: 'Android & SDK', items: 'CameraX, TensorFlow Lite, ML Kit, Native Modules, Gradle, Maven' },
  { title: 'Backend & Tools', items: 'Node.js, Express, REST API, MySQL, Git' },
];
