export const MOBILE_ENGINEER_TITLE = 'Mobile software engineer';

const HOME_PAGE_TITLE = `Đặng Văn Tiến — ${MOBILE_ENGINEER_TITLE}`;

export const HOME_PAGE_META = {
  vi: {
    title: HOME_PAGE_TITLE,
    description: `Đặng Văn Tiến là ${MOBILE_ENGINEER_TITLE} tại TP.HCM, phát triển ứng dụng Android native với Kotlin, SDK Android và ứng dụng đa nền tảng bằng React Native.`,
  },
  en: {
    title: HOME_PAGE_TITLE,
    description: `Đặng Văn Tiến is a ${MOBILE_ENGINEER_TITLE} in Ho Chi Minh City focused on native Android app development, Kotlin SDKs and cross-platform apps with React Native.`,
  },
};

export const ME_PAGE_META = {
  vi: {
    title: `Về Đặng Văn Tiến — ${MOBILE_ENGINEER_TITLE}`,
    description: `Đặng Văn Tiến là ${MOBILE_ENGINEER_TITLE} tại South Telecom. Kinh nghiệm phát triển ứng dụng React Native, SDK Android với Kotlin và ứng dụng tablet tích hợp SDK robot.`,
  },
  en: {
    title: `About Đặng Văn Tiến — ${MOBILE_ENGINEER_TITLE}`,
    description: `Đặng Văn Tiến is a ${MOBILE_ENGINEER_TITLE} at South Telecom. His work includes React Native apps, native Android SDKs in Kotlin and Android tablet integration with a robot SDK.`,
  },
};

// Keep server-rendered metadata and client navigation on the same public identity.
export const AUTHOR_SCHEMA = {
  '@type': 'Person',
  '@id': 'https://devtiendang.blog/me#person',
  name: 'Đặng Văn Tiến',
  alternateName: ['Tiến Đặng', 'Tien Dang', 'Dang Van Tien', 'devtiendang'],
  url: 'https://devtiendang.blog/me',
  image: 'https://devtiendang.blog/images/tien-dang-profile.jpg',
  jobTitle: MOBILE_ENGINEER_TITLE,
  description: `Đặng Văn Tiến là ${MOBILE_ENGINEER_TITLE} tại South Telecom, TP.HCM, chuyên Android native và React Native. Tiến học Kỹ thuật phần mềm tại PTIT HCM (2017–2022) và phát triển ChatDVT trên Discord và web.`,
  homeLocation: { '@type': 'Place', name: 'TP. Hồ Chí Minh, Việt Nam' },
  worksFor: { '@type': 'Organization', name: 'South Telecom' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'PTIT HCM', alternateName: ['PTITHCM', 'PTIT Ho Chi Minh City'] },
  knowsAbout: ['Mobile App Development', 'Mobile Software Engineering', 'Native Android Development', 'Android SDK Development', 'Cross-platform Mobile Development', 'React Native', 'Android', 'Kotlin', 'Discord Bot', 'Discord.js', 'Google Gemini', 'ChatDVT'],
  sameAs: [
    'https://github.com/tienDang0805',
    'https://www.linkedin.com/in/%C4%91%E1%BA%B7ng-v%C4%83n-ti%E1%BA%BFn-41623529b/',
    'https://www.facebook.com/dvtien8599',
  ],
};

// One product identity across Vietnamese/English pages and client navigation.
export const CHATDVT_ENTITY_ID = 'https://devtiendang.blog/discord#chatdvt';
export const CHATDVT_SOURCE_URL = 'https://github.com/tienDang0805/ChatDVT-discord-bot';
export const CHATDVT_FEATURES = {
  vi: ['Chat AI trên web và Discord', 'Phân tích ảnh và video', 'Tóm tắt tin nhắn', 'Mini game trên Discord'],
  en: ['AI chat on the web and Discord', 'Image and video analysis', 'Message summaries', 'Discord mini games'],
};
