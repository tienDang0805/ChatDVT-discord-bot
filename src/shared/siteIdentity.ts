// Keep server-rendered metadata and client navigation on the same public identity.
export const AUTHOR_SCHEMA = {
  '@type': 'Person',
  '@id': 'https://devtiendang.blog/me#person',
  name: 'Đặng Văn Tiến',
  alternateName: ['Tiến Đặng', 'Tien Dang', 'Dang Van Tien', 'devtiendang'],
  url: 'https://devtiendang.blog/me',
  image: 'https://devtiendang.blog/images/tien-dang-profile.jpg',
  jobTitle: 'Mobile Developer',
  description: 'Đặng Văn Tiến là Mobile Developer tại South Telecom ở TP.HCM, cựu sinh viên PTIT HCM ngành Kỹ thuật phần mềm (2017–2022) và là người phát triển chatbot AI ChatDVT trên Discord và web.',
  homeLocation: { '@type': 'Place', name: 'TP. Hồ Chí Minh, Việt Nam' },
  worksFor: { '@type': 'Organization', name: 'South Telecom' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'PTIT HCM', alternateName: ['PTITHCM', 'PTIT Ho Chi Minh City'] },
  knowsAbout: ['Mobile App Development', 'React Native', 'Android', 'Kotlin', 'Discord Bot', 'Discord.js', 'Google Gemini', 'ChatDVT'],
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
