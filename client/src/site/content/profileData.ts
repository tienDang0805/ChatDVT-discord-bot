export const profile = {
  name: 'Đặng Văn Tiến',
  role: 'Mobile Developer',
  company: 'South Telecom',
  period: '04/2023',
  email: 'dvtien0805@gmail.com',
  github: 'https://github.com/tienDang0805',
  linkedin: 'https://www.linkedin.com/in/%C4%91%E1%BA%B7ng-v%C4%83n-ti%E1%BA%BFn-41623529b/',
  facebook: 'https://www.facebook.com/dvtien8599',
  education: {
    shortSchool: 'PTIT HCM',
    school: [
      'Học viện Công nghệ Bưu chính Viễn thông — Cơ sở TP.HCM (PTIT HCM)',
      'Posts and Telecommunications Institute of Technology — Ho Chi Minh City Campus (PTIT HCM)',
    ],
    degree: [
      'Kỹ sư ngành Kỹ thuật phần mềm (Software Engineering)',
      'Bachelor of Engineering in Software Engineering',
    ],
    period: '2017 — 2022',
    location: ['TP. Hồ Chí Minh', 'Ho Chi Minh City'],
    description: [
      'Đào tạo chính quy ngành Kỹ thuật phần mềm: nền tảng cấu trúc dữ liệu & giải thuật, lập trình hướng đối tượng, cơ sở dữ liệu, phát triển phần mềm hướng dịch vụ (REST API, Docker, CI/CD) và phát triển ứng dụng Mobile / Web.',
      'Full-time engineering program in Software Engineering, covering data structures and algorithms, object-oriented programming, databases, service-oriented software development (REST APIs, Docker, CI/CD) and mobile/web application development.',
    ],
    tags: ['Software Engineering', 'Mobile & Web', 'REST API', 'Docker & CI/CD'],
  },
};
export const contributions = [
  {
    title: ['Multi-barcode & Multi-box SDK', 'Multi-barcode & Multi-box SDK'], category: 'Android · On-device AI',
    description: [
      'Phát triển một SDK Android bằng Kotlin từ bản thử nghiệm ban đầu, sử dụng CameraX, model TensorFlow Lite và ML Kit để nhận diện đồng thời 10+ hộp sản phẩm cùng nhiều barcode trong một khung hình (~50ms/frame ở 30 FPS). Đóng gói thành thư viện AAR chuẩn hóa qua Maven giúp các team tích hợp trong dưới 1 giờ (giảm ~80% thời gian).',
      'Developed an Android SDK in Kotlin from an initial prototype, using CameraX, a TensorFlow Lite model and ML Kit to recognize 10+ product boxes and multiple barcodes in one frame (~50ms/frame at 30 FPS). Packaged as a Maven AAR library, cutting integration time across teams by ~80% (under 1 hour).',
    ], tags: ['Kotlin', 'TensorFlow Lite', 'ML Kit', 'CameraX', 'Maven'],
  },
  {
    title: ['React Native & Mobile Systems', 'React Native & Mobile Systems'], category: 'Mobile · Systems',
    description: [
      'Phát triển và bảo trì ứng dụng CRM B2B cho đội ngũ kinh doanh, xây dựng analytics SDK hỗ trợ hàng đợi lưu dữ liệu offline (đảm bảo 0% mất sự kiện khi rớt mạng), và nâng cấp ứng dụng React Native cũ lên phiên bản mới. Công việc còn liên quan đến API, database và hệ thống quản lý bản cập nhật ứng dụng.',
      'Developed and maintained B2B CRM applications for enterprise teams, built an analytics SDK with offline queue storage (0% event loss during network drops), and upgraded legacy React Native applications. The work also involved APIs, databases and systems for managing application updates.',
    ], tags: ['React Native', 'API', 'Database'],
  },
  {
    title: ['Robot App & SDK Integration', 'Robot App & SDK Integration'], category: 'Android · Robot',
    description: [
      'Phát triển giao diện ứng dụng điều khiển robot bằng React Native (60 FPS), làm bridge kết nối UI với Android/Java để gọi trực tiếp SDK phần cứng của nhà sản xuất robot. Công việc gồm đọc tài liệu và debug SDK trên thiết bị thật, xử lý các vấn đề tích hợp, triển khai cho khách hàng, hướng dẫn sử dụng và hỗ trợ vận hành.',
      'Developed the robot application UI in React Native (60 FPS) and a low-latency Android/Java bridge to call the robot manufacturer’s hardware SDK. The work included reading and debugging the SDK on real devices, resolving integration issues, deploying for customers, user training and operational support.',
    ], tags: ['React Native UI', 'Android / Java', 'Native Bridge', 'Vendor SDK'],
  },
];
export const skillFamilies = [
  { title: 'Mobile', items: 'Kotlin, Java, React Native, TypeScript' },
  { title: 'Android & SDK', items: 'CameraX, TensorFlow Lite, ML Kit, Native Modules, Gradle, Maven' },
  { title: 'Backend & Tools', items: 'Node.js, Express, REST API, MySQL, Git' },
];
