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
      'Mình làm SDK Android bằng Kotlin. CameraX chụp ảnh, TensorFlow Lite tìm các hộp, rồi ML Kit đọc nhiều mã trong mỗi hộp. SDK trả kết quả theo từng hộp. Sau khi đo độ trễ trên máy Android, mình chuyển sang chỉ chạy nhận diện khi chụp để preview phản hồi tốt hơn. Mình dùng Maven Publish để phát hành bản release lên kho Maven riêng trên Repsy. Các team khai báo dependency Gradle theo groupId, artifactId và phiên bản.',
      'I built an Android SDK in Kotlin. CameraX captures the image, TensorFlow Lite locates boxes, and ML Kit reads multiple barcodes per box. The SDK groups results by box. After measuring latency on Android devices, I moved inference to capture time to keep the preview responsive. I use Maven Publish to release the library to a private Maven repository on Repsy. Teams declare the Gradle dependency by group ID, artifact ID and version.',
    ], tags: ['Kotlin', 'TensorFlow Lite', 'ML Kit', 'CameraX', 'Repsy Maven'],
  },
  {
    title: ['React Native & Mobile Systems', 'React Native & Mobile Systems'], category: 'Mobile · Systems',
    description: [
      'Phát triển và bảo trì ứng dụng CRM B2B, làm analytics SDK hỗ trợ lưu dữ liệu offline, và nâng cấp ứng dụng React Native cũ lên phiên bản mới. Công việc còn liên quan đến API, database và hệ thống quản lý bản cập nhật ứng dụng.',
      'Developed and maintained B2B CRM applications, built an analytics SDK with offline storage, and upgraded legacy React Native applications. The work also involved APIs, databases and systems for managing application updates.',
    ], tags: ['React Native', 'API', 'Database'],
  },
  {
    title: ['Tích hợp SDK robot Woni', 'Woni Robot SDK Integration'], category: 'Android Tablet · Robot',
    description: [
      'Mình phát triển app React Native trên tablet Android gắn trước ngực Woni, tích hợp và debug SDK hãng qua bridge Java. App cho khách chọn dịch vụ, in phiếu và điều robot dẫn khách đến quầy tương ứng. Hai robot có dock riêng và chạy theo lịch 08:00–17:00. Mình triển khai robot tại ngân hàng, hỗ trợ vận hành và sự kiện, đồng thời bàn giao và hướng dẫn đội FSE.',
      'I developed the React Native app on Woni’s chest-mounted Android tablet and integrated and debugged the vendor SDK through a Java bridge. Customers choose a service, get a printed ticket, and are guided to the corresponding counter. The two robots have separate docks and run on an 08:00–17:00 schedule. I deployed the robots at the bank, supported operations and events, and trained the field service engineering team during handover.',
    ], tags: ['Android Tablet', 'React Native', 'Java Bridge', 'Vendor SDK'],
  },
];
export const skillFamilies = [
  { title: 'Mobile', items: 'Kotlin, Java, React Native, TypeScript' },
  { title: 'Android & SDK', items: 'CameraX, TensorFlow Lite, ML Kit, Native Modules, Gradle, Maven' },
  { title: 'Backend & Tools', items: 'Node.js, Express, REST API, MySQL, Git' },
];
