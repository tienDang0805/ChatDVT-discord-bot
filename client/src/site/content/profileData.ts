import { MOBILE_ENGINEER_TITLE } from '../../../../src/shared/siteIdentity';

export const profile = {
  name: 'Đặng Văn Tiến',
  role: MOBILE_ENGINEER_TITLE,
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
      'Xây dựng SDK Kotlin trả mã vạch theo từng hộp. Sau khi đo độ trễ, mình chuyển inference sang lúc chụp để preview phản hồi tốt hơn. Phát hành SDK theo phiên bản qua kho Maven riêng trên Repsy để các team tích hợp bằng Gradle.',
      'Built a Kotlin SDK that groups decoded barcodes by box. After measuring latency, I moved inference to capture time to keep the preview responsive. I publish versioned releases to private Maven on Repsy for other teams to integrate through Gradle.',
    ], tags: ['Kotlin', 'TensorFlow Lite', 'ML Kit', 'CameraX', 'Repsy Maven'],
  },
  {
    title: ['React Native & Mobile Systems', 'React Native & Mobile Systems'], category: 'Mobile · Systems',
    description: [
      'Phát triển ứng dụng CRM B2B và SDK analytics hỗ trợ offline. Nâng ứng dụng từ React Native 0.62.2 lên 0.77.3 và xử lý tương thích trang nhớ 16 KB trên Android.',
      'Developed B2B CRM apps and an offline-first analytics SDK. Upgraded a production app from React Native 0.62.2 to 0.77.3 and addressed 16 KB page-size compatibility on Android.',
    ], tags: ['React Native', 'API', 'Database'],
  },
  {
    title: ['Tích hợp SDK robot Woni', 'Woni Robot SDK Integration'], category: 'Android Tablet · Robot',
    description: [
      'Phát triển app trên tablet Android 6.0 (API 23) gắn trước ngực Woni. Tích hợp SDK hãng qua Java bridge để robot in phiếu và dẫn khách đến đúng quầy. Triển khai tại ngân hàng, hỗ trợ vận hành và sự kiện, bàn giao và hướng dẫn đội FSE.',
      'Developed the app for Woni’s chest-mounted Android 6.0 (API 23) tablet. Integrated the vendor SDK through a Java bridge so the robots could print tickets and guide customers to their counters. Deployed at the bank, supported operations and events, and trained the field service team.',
    ], tags: ['Android Tablet', 'React Native', 'Java Bridge', 'Vendor SDK'],
  },
];
export const skillFamilies = [
  { title: 'Native Android', items: 'Kotlin, Java, CameraX, TensorFlow Lite, ML Kit, Gradle, Maven' },
  { title: 'React Native', items: 'TypeScript, Redux, Native Modules, Hermes, MMKV' },
  { title: 'Backend & Tools', items: 'Node.js, Express, REST API, MySQL, Git' },
];
