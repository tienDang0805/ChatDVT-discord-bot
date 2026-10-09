export const profile = {
  name: 'Đặng Văn Tiến',
  role: 'Mobile Software Engineer',
  company: 'South Telecom',
  period: '04/2023',
  email: 'dvtien0805@gmail.com',
  github: 'https://github.com/tienDang0805',
  linkedin: 'https://www.linkedin.com/in/%C4%91%E1%BA%B7ng-v%C4%83n-ti%E1%BA%BFn-41623529b/',
};
export const contributions = [
  {
    title: ['Android Barcode Scanning SDK', 'Android Barcode Scanning SDK'], category: 'Android · SDK',
    description: [
      'Từng phát triển một SDK Android từ bản thử nghiệm ban đầu, sử dụng CameraX, TensorFlow Lite và ML Kit để nhận diện nhiều hộp sản phẩm cùng các barcode trong ảnh. Sau đó đóng gói thành thư viện để team khác tích hợp qua Maven.',
      'Developed an Android SDK from an initial prototype, using CameraX, TensorFlow Lite and ML Kit to recognize multiple product boxes and their barcodes in an image. Packaged it as a library for other teams to integrate through Maven.',
    ], tags: ['CameraX', 'ML Kit', 'Maven'],
  },
  {
    title: ['React Native & Mobile Systems', 'React Native & Mobile Systems'], category: 'Mobile · Systems',
    description: [
      'Phát triển và bảo trì ứng dụng CRM B2B, làm analytics SDK hỗ trợ lưu dữ liệu offline, và nâng cấp ứng dụng React Native cũ lên phiên bản mới. Công việc còn liên quan đến API, database và hệ thống quản lý bản cập nhật ứng dụng.',
      'Developed and maintained B2B CRM applications, built an analytics SDK with offline storage, and upgraded legacy React Native applications. The work also involved APIs, databases and systems for managing application updates.',
    ], tags: ['React Native', 'API', 'Database'],
  },
  {
    title: ['Woni Service Robot', 'Woni Service Robot'], category: 'Android · Integration',
    description: [
      'Tham gia phát triển ứng dụng React Native chạy trên robot Android, đọc và debug SDK Java của vendor, sửa các vấn đề tích hợp và trực tiếp triển khai tại Vikki Bank. Có những lúc phải vừa debug robot thật, vừa hỗ trợ khách hàng và hướng dẫn team vận hành.',
      'Helped develop a React Native application running on an Android robot, read and debugged the vendor’s Java SDK, resolved integration issues and deployed it onsite at Vikki Bank. At times, this meant debugging the physical robot while supporting customers and guiding the operations team.',
    ], tags: ['React Native', 'Java SDK', 'Android'],
  },
];
export const skillFamilies = [
  { title: 'Mobile', items: 'Kotlin, Java, React Native, TypeScript' },
  { title: 'Android & SDK', items: 'CameraX, TensorFlow Lite, ML Kit, Native Modules, Gradle, Maven' },
  { title: 'Backend & Tools', items: 'Node.js, Express, REST API, MySQL, Git' },
];
